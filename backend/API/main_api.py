from fastapi import APIRouter, Depends, HTTPException
from backend.API.auth import get_current_user
from sqlalchemy.orm import Session
from backend.database.database import get_db
from . import schemes
from . import crud

main_api_router = APIRouter(
    prefix="/api",
    tags=["main_api"]
)

@main_api_router.get("/user", response_model=schemes.User)
def get_user_info(user = Depends(get_current_user)):
    return user

@main_api_router.post("/become_author", response_model=schemes.Author)
def become_author(db: Session = Depends(get_db), user = Depends(get_current_user)):
    if user.author != []:
        raise HTTPException(status_code=400, detail="User is already author")
    return crud.create_author(db, schemes.AuthorCreate(user_id=user.id))