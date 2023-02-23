from sqlalchemy.orm import Session
from . import schemes
import backend.database.db_models as db_models
import uuid

def get_user(db: Session, email: str):
    return db.query(db_models.Users).filter(db_models.Users.email == email).first()

def get_scopes(db: Session, email: str):
    user = db.query(db_models.Users).filter(db_models.Users.email == email).first()
    scopes = []
    if user.author != []:
        scopes += ['author']
    return scopes

def create_user(db: Session, user: schemes.UserCreate):
    db_user = db_models.Users(
        username=user.username,
        email=user.email,
        hashed_password=user.password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_refresh_token(db: Session, refresh_token: schemes.RefreshToken):
    db_refresh_token = db_models.RefreshTokens(**refresh_token.dict())
    db.add(db_refresh_token)
    db.commit()
    db.refresh(db_refresh_token)
    return db_refresh_token

def get_refresh_token(db: Session, refresh_token: uuid.UUID):
    return db.query(db_models.RefreshTokens).filter(db_models.RefreshTokens.uuid == refresh_token).first()

def delete_refresh_token(db: Session, refresh_token: uuid.UUID):
    db_refresh_token = db.query(db_models.RefreshTokens).filter(db_models.RefreshTokens.uuid == refresh_token).first()
    if db_refresh_token:
        db.delete(db_refresh_token)
        db.commit()


def create_author(db: Session, author: schemes.AuthorCreate):
    db_author = db_models.Authors(user_id=author.user_id)
    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    return db_author