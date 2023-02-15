from fastapi import APIRouter
from fastapi.responses import FileResponse

FilesProviding_router = APIRouter(
    prefix="",
    tags=["FilesProviding"]
)

@FilesProviding_router.get("/")
def root():
    return FileResponse("public/index.html")

@FilesProviding_router.get("/{path:path}")
def to_root(path: str):
    return FileResponse("public/index.html")