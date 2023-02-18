from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Cookie, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import ValidationError
import uuid

from backend.database.database import get_db
from sqlalchemy.orm import Session
from . import schemes
from . import crud

auth_router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

SECRET_KEY = "dc2055582fbc7a9624f25f09ddfc757be3d43868d25a7b1390971e84fc99c1f9"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 30

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="auth/login",
    scopes={"admin": "Administrator rights.", "super_admin": "Right to add and remove administrators."},
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(email: str, password: str, db: Session):
    user = crud.get_user(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(email: str, db: Session):
    scopes = crud.get_scopes(db, email)

    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta

    data={"sub": email, "scopes": scopes, "exp": expire}
    encoded_jwt = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def update_refresh_token(user_id: int, refresh_token: uuid.UUID | None, db: Session):
    if refresh_token is not None:
        crud.delete_refresh_token(db, refresh_token)

    new_refresh_token = schemes.RefreshToken(
        uuid = uuid.uuid4(),
        user_id = user_id,
        created_at = datetime.utcnow(),
        expires_in = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS).total_seconds()
    )

    db_refresh_token = crud.create_refresh_token(db, new_refresh_token)
    return db_refresh_token

@auth_router.post("/login", response_model=schemes.Token)
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
    
    new_refresh_token = update_refresh_token(user.id, refresh_token, db)
    access_token = create_access_token(user.email, db)
    
    response.set_cookie(key="refresh_token", value=new_refresh_token.uuid, max_age=new_refresh_token.expires_in, httponly=True)
    return {"access_token": access_token, "token_type": "Bearer"}

@auth_router.post("/refresh_tokens", response_model=schemes.Token)
def refresh_tokens(response: Response, refresh_token: uuid.UUID | None = Cookie(None), db: Session = Depends(get_db)):
    db_refresh_token = crud.get_refresh_token(db, refresh_token)
    if not db_refresh_token:
        raise HTTPException(status_code=400, detail="Refresh_token not found")
    
    refresh_token_age = (datetime.utcnow() - db_refresh_token.created_at).total_seconds()
    if refresh_token_age > db_refresh_token.expires_in:
        raise HTTPException(status_code=400, detail="Refresh_token expired")

    new_refresh_token = update_refresh_token(db_refresh_token.user_id, refresh_token, db)
    access_token = create_access_token(new_refresh_token.user.email, db)

    response.set_cookie(key="refresh_token", value=new_refresh_token.uuid, max_age=new_refresh_token.expires_in, httponly=True)
    return {"access_token": access_token, "token_type": "Bearer"}

@auth_router.post("/signup", response_model=schemes.User)
def sign_up(user: schemes.UserCreate, db: Session = Depends(get_db)):
    existing_user = crud.get_user(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered")
    
    user.password = get_hash(user.password)

    return crud.create_user(db, user)

def get_current_user(
    security_scopes: SecurityScopes, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
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
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: int = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_scopes = payload.get("scopes", [])
        token_data = schemes.TokenData(scopes=token_scopes, email=email)
    except (JWTError, ValidationError):
        raise credentials_exception
    user = crud.get_user(db, email)
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