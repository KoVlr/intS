from uvicorn import run
from fastapi import FastAPI
from backend.API.auth import auth_router
from backend.API.main_api import main_api_router
from backend.API.files_providing import files_providing_router
from backend.API.articles import articles_router
from backend.API.comments import comments_router
from backend.API.courses import courses_router
from fastapi.staticfiles import StaticFiles
from backend.db_models import Base
from backend.database import engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(main_api_router)
app.include_router(auth_router)
app.include_router(articles_router)
app.include_router(courses_router)
app.mount("/public", StaticFiles(directory="public"), name="public")
app.include_router(files_providing_router)

if __name__ == '__main__':
    run("main:app", reload=True)