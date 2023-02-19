from fastapi import APIRouter
from fastapi.responses import FileResponse

files_providing_router = APIRouter(
    prefix="",
    tags=["files_providing"]
)

@files_providing_router.get("/")
def root():
    return FileResponse("public/index.html")

@files_providing_router.get("/{path:path}")
def to_root(path: str):
    return FileResponse("public/index.html")