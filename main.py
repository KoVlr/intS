from uvicorn import run
from fastapi import FastAPI
from backend.API.auth import auth_router
from backend.API.test import test_router
from backend.API.FilesProviding import FilesProviding_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(test_router)
app.include_router(FilesProviding_router)

if __name__ == '__main__':
    run("main:app", reload=True)