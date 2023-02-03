from sqlalchemy.orm import Session
from . import schemes
import backend.database.db_models as db_models

def get_user(db: Session, email: str):
    user_in_db = db.query(db_models.Users).filter(db_models.Users.email == email).first()
    if not user_in_db:
        return False
    user = schemes.UserModel(
        email = user_in_db.email,
        hashed_password = user_in_db.hashed_password
    )
    return user

def get_scopes(db: Session, email: str):
    return []

def create_user(db: Session, user: schemes.UserModel):
    new_user = db_models.Users(
        email = user.email,
        hashed_password = user.hashed_password
    )
    db.add(new_user)
    db.commit()