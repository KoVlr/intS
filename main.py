from uvicorn import run
from fastapi import FastAPI
from backend.API.auth import auth_router
from backend.API.main_api import main_api_router
from backend.API.files_providing import files_providing_router
from fastapi.staticfiles import StaticFiles
from backend.database.db_models import Base
from backend.database.database import engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth_router)
app.include_router(main_api_router)
app.mount("/public", StaticFiles(directory="public"), name="public")
app.include_router(files_providing_router)

if __name__ == '__main__':
    run("main:app", reload=True)