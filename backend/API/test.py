from fastapi import APIRouter, Depends
from backend.API.auth import get_current_user

test_router = APIRouter(
    prefix="/test",
    tags=["Test"]
)

@test_router.get("/")
def get_user_info(user = Depends(get_current_user)):
    return user