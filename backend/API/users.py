from fastapi import APIRouter, Depends, HTTPException
from API.auth import get_authenticated_user
from sqlalchemy.orm import Session
from database.db_connection import get_db

import schemes
import crud

users_router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@users_router.get("/me", response_model=schemes.User)
def get_user_info(user = Depends(get_authenticated_user)):
    return user


@users_router.post("/authors", response_model=schemes.Author)
def become_author(db: Session = Depends(get_db), user = Depends(get_authenticated_user)):
    if user.author is not None:
        raise HTTPException(status_code=400, detail="User is already author")
    return crud.create_author(db, schemes.AuthorCreate(user_id=user.id))