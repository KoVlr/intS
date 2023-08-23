from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Cookie, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import ValidationError
from sqlalchemy.orm import Session
import uuid
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from config import EMAIL, PASSWORD, SMTP_HOST, HOST, SECRET_KEY


from database.db_connection import get_db
import schemes.users
import schemes.auth
import crud

auth_router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"]
)


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 30

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="api/auth/token",
    scopes={"author": "The right to create and edit courses"},
    auto_error=False
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(email: str, password: str, db: Session):
    user = crud.get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(email: str, db: Session):
    scopes = crud.get_scopes(db, email)

    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expires = datetime.utcnow() + expires_delta

    data={"sub": email, "scopes": scopes, "exp": expires}
    encoded_jwt = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

    access_token = schemes.auth.Token(
        access_token=encoded_jwt,
        token_type="Bearer",
        expires=expires.timestamp(),
        rights=scopes
    )
    return access_token


def update_refresh_token(user_id: int, refresh_token: uuid.UUID | None, db: Session):
    if refresh_token is not None:
        crud.delete_refresh_token(db, refresh_token)

    new_refresh_token = schemes.auth.RefreshToken(
        uuid = uuid.uuid4(),
        user_id = user_id,
        created_at = datetime.utcnow(),
        expires_in = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS).total_seconds()
    )
    db_refresh_token = crud.create_refresh_token(db, new_refresh_token)
    return db_refresh_token


@auth_router.post("/token", response_model=schemes.auth.Token)
def login_for_access_token(
        response: Response,
        form_data: OAuth2PasswordRequestForm = Depends(),
        refresh_token: uuid.UUID | None = Cookie(None),
        db: Session = Depends(get_db)
    ):

    email = form_data.username #user is identified by email

    user = authenticate_user(email, form_data.password, db)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not user.activated:
        raise HTTPException(status_code=400, detail="Email not confirmed")
    
    new_refresh_token = update_refresh_token(user.id, refresh_token, db)
    access_token = create_access_token(user.email, db)
    
    response.set_cookie(
            key="refresh_token",
            value=new_refresh_token.uuid,
            max_age=new_refresh_token.expires_in,
            httponly=True,
            path='/api/auth',
            samesite='strict'
        )
    return access_token


@auth_router.post("/refresh-tokens", response_model=schemes.auth.Token)
def refresh_tokens(
        response: Response,
        refresh_token: uuid.UUID | None = Cookie(None),
        db: Session = Depends(get_db)
    ):
    if refresh_token is None:
        raise HTTPException(status_code=400, detail="Refresh_token not found")
    
    db_refresh_token = crud.get_refresh_token(db, refresh_token)
    if not db_refresh_token:
        raise HTTPException(status_code=400, detail="Refresh_token not found")
    
    refresh_token_age = (datetime.utcnow() - db_refresh_token.created_at).total_seconds()
    if refresh_token_age > db_refresh_token.expires_in:
        raise HTTPException(status_code=400, detail="Refresh_token expired")

    new_refresh_token = update_refresh_token(db_refresh_token.user_id, refresh_token, db)
    access_token = create_access_token(new_refresh_token.user.email, db)

    response.set_cookie(
            key="refresh_token",
            value=new_refresh_token.uuid,
            max_age=new_refresh_token.expires_in,
            httponly=True,
            path='/api/auth',
            samesite='strict'
        )
    return access_token



def send_email_confirmation(user):
    msg = MIMEMultipart()
    message = f'Была создана учётная запись с именем пользователя {user.username}. Для подтверждения электронной почты перейдите по ссылке {HOST}/users/{user.id}/activation/{user.confirmation_code}'
    msg['From'] = EMAIL
    msg['To'] = user.email
    msg['Subject'] = 'Подтверждение электронной почты'
    msg.attach(MIMEText(message, 'plain'))
    server = smtplib.SMTP(SMTP_HOST)
    server.starttls()
    server.login(msg['From'], PASSWORD)
    server.sendmail(msg['From'], msg['To'], msg.as_string())
    server.quit()


@auth_router.post("/users", response_model=schemes.users.User)
def sign_up(user: schemes.users.UserNew, db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_email(db, user.email)
    if existing_user is not None and existing_user.activated:
        raise HTTPException(status_code=400, detail="User already registered")
    
    user.password = get_hash(user.password)

    user_create = schemes.users.UserCreate(
        **user.dict(),
        activated=False,
        confirmation_code=uuid.uuid4()
    )

    if existing_user is not None:
        db_user = crud.update_user(db, existing_user.id, schemes.users.UserUpdate(**user_create.dict()))
    else:
        db_user = crud.create_user(db, user_create)

    send_email_confirmation(db_user)
    return db_user


@auth_router.post("/users/{user_id}/activation/{confirmation_code}", response_model=schemes.auth.Token)
def user_activation(
    response: Response,
    user_id: int,
    confirmation_code: uuid.UUID,
    db: Session = Depends(get_db)
):
    db_user = crud.get_user(db, user_id)

    if db_user.activated:
        raise HTTPException(status_code=400, detail="Email already confirmed")

    if db_user is None:
        raise HTTPException(status_code=400, detail="User does not exist")
    
    if db_user.confirmation_code != confirmation_code:
        raise HTTPException(status_code=400, detail="Incorrect confirmation code")
    
    crud.update_user(db, user_id, schemes.users.UserUpdate(activated=True))
    
    new_refresh_token = update_refresh_token(user_id, None, db)
    access_token = create_access_token(db_user.email, db)
    
    response.set_cookie(
            key="refresh_token",
            value=new_refresh_token.uuid,
            max_age=new_refresh_token.expires_in,
            httponly=True,
            path='/api/auth',
            samesite='strict'
        )
    return access_token



def get_current_user(
    security_scopes: SecurityScopes, token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )

    if token is None:
        if security_scopes.scopes:
            raise credentials_exception
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: int = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_scopes = payload.get("scopes", [])
        token_data = schemes.auth.TokenData(scopes=token_scopes, email=email)
    except (JWTError, ValidationError):
        raise credentials_exception
    
    user = crud.get_user_by_email(db, token_data.email)
    if user is None:
        raise credentials_exception
    
    for scope in security_scopes.scopes:
        if scope not in token_data.scopes:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not enough permissions",
                headers={"WWW-Authenticate": authenticate_value},
            )
    return user


def get_authenticated_user(
    user = Depends(get_current_user)
):
    if user is None:
        raise HTTPException(status_code=401, detail='Not authenticated')
    return user



@auth_router.delete("/token")
def logout(
        response: Response,
        refresh_token: uuid.UUID | None = Cookie(None),
        user = Depends(get_authenticated_user),
        db: Session = Depends(get_db)
    ):
    if refresh_token is not None:
        crud.delete_refresh_token(db, refresh_token)

    response.delete_cookie(key="refresh_token")
    return {'status': 'success'}