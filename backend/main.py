from uvicorn import run
from fastapi import FastAPI
from API.auth import auth_router
from API.users import users_router
from API.files_providing import files_providing_router
from API.articles import articles_router
from API.comments import comments_router
from API.courses import courses_router
from fastapi.staticfiles import StaticFiles
from database.db_models import Base
from database.db_connection import engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(users_router)
app.include_router(auth_router)
app.include_router(articles_router)
app.include_router(courses_router)
app.include_router(comments_router)
app.mount("/public", StaticFiles(directory="public"), name="public")
app.include_router(files_providing_router)

if __name__ == '__main__':
    run("main:app", reload=True)