from sqlalchemy.orm import Session
from . import schemes
import backend.database.db_models as db_models

def get_user(db: Session, email: str):
    return db.query(db_models.Users).filter(db_models.Users.email == email).first()

def get_scopes(db: Session, email: str):
    return []

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