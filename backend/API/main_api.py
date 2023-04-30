from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.responses import FileResponse
from backend.API.auth import get_authenticated_user, get_current_user
from sqlalchemy.orm import Session
from backend.database import get_db
from datetime import datetime
from os import remove, removedirs

from .courses import check_own_course, check_available_course, toCourseGet
from .. import schemes
from .. import crud

main_api_router = APIRouter(
    prefix="/api",
    tags=["Main_api"]
)



@main_api_router.get("/users/me", response_model=schemes.User)
def get_user_info(user = Depends(get_authenticated_user)):
    return user


@main_api_router.post("/authors", response_model=schemes.Author)
def become_author(db: Session = Depends(get_db), user = Depends(get_authenticated_user)):
    if user.author is not None:
        raise HTTPException(status_code=400, detail="User is already author")
    return crud.create_author(db, schemes.AuthorCreate(user_id=user.id))



def get_own_image(
        image_id: int,
        user = Security(get_authenticated_user, scopes=['author']),
        db: Session = Depends(get_db)
    ):
    db_image = crud.get_image(db, image_id)
    if db_image is None:
        raise HTTPException(status_code=400, detail="This image does not exist")
    
    check_own_course(db_image.article.course, user)
    return db_image


def get_available_image(
        image_id: int,
        user = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
    db_image = crud.get_image(db, image_id)
    if db_image is None:
        raise HTTPException(status_code=400, detail="This image does not exist")
    
    check_available_course(db_image.article.course, user, db)
    return db_image


def get_own_file(
        file_id: int,
        user = Security(get_authenticated_user, scopes=['author']),
        db: Session = Depends(get_db)
    ):
    db_file = crud.get_file(db, file_id)
    if db_file is None:
        raise HTTPException(status_code=400, detail="This file does not exist")
    
    check_own_course(db_file.course, user)
    return db_file


def get_available_file(
        file_id: int,
        user = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
    db_file = crud.get_file(db, file_id)
    if db_file is None:
        raise HTTPException(status_code=400, detail="This file does not exist")
    
    check_available_course(db_file.course, user, db)
    return db_file


@main_api_router.get("/images/{image_id}")
def get_image(
        image_id: int, db_image = Depends(get_available_image),  db: Session = Depends(get_db)
    ):    
    return FileResponse(db_image.file)


@main_api_router.delete("/images/{image_id}", response_model=schemes.ArticleGet)
def delete_image(image_id: int, db_image = Depends(get_own_image), db: Session = Depends(get_db)):

    filepath = str(db_image.file)
    dirpath = filepath[:filepath.rfind('/')]
    remove(filepath)
    removedirs(dirpath)
    crud.delete_image(db, image_id)

    article_data = schemes.ArticleUpdate(updated_at=datetime.utcnow())
    return crud.update_article(db, db_image.article_id, article_data)


@main_api_router.get("/files/{file_id}")
def get_file(
        db_file = Depends(get_available_file),  db: Session = Depends(get_db)
    ):    
    return FileResponse(db_file.path, filename=db_file.original_name)


@main_api_router.delete("/files/{file_id}", response_model=schemes.CourseGet)
def delete_file(
    file_id: int,
    user = Depends(get_current_user),
    db_file = Depends(get_own_file),
    db: Session = Depends(get_db)
):

    filepath = str(db_file.path)
    dirpath = filepath[:filepath.rfind('/')]
    remove(filepath)
    removedirs(dirpath)
    crud.delete_file(db, file_id)

    course_data = schemes.CourseUpdate(updated_at=datetime.utcnow())
    db_course = crud.update_course(db, db_file.course_id, course_data)
    return toCourseGet(db_course, user, db)