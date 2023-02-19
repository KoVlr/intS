from fastapi import APIRouter, Depends
from backend.API.auth import get_current_user
from . import schemes

main_api_router = APIRouter(
    prefix="",
    tags=["main_api"]
)

@main_api_router.get("/user", response_model=schemes.User)
def get_user_info(user = Depends(get_current_user)):
    return user