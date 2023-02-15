from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import ValidationError

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

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="auth/token",
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

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

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

@auth_router.post("/token", response_model=schemes.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email = form_data.username #user is identified by email

    user = authenticate_user(email, form_data.password, db)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    scopes = crud.get_scopes(db, user.email)
    access_token = create_access_token(
        data={"sub": user.email, "scopes": scopes},
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "Bearer"}


@auth_router.post("/signup", response_model=schemes.User)
def sign_up(user: schemes.UserCreate, db: Session = Depends(get_db)):
    existing_user = crud.get_user(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered")
    
    user.password = get_hash(user.password)

    return crud.create_user(db, user)