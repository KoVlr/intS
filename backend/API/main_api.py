from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.responses import FileResponse
from backend.API.auth import get_current_user
from sqlalchemy.orm import Session
from backend.database.database import get_db
from datetime import datetime
from os import remove, removedirs
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



@main_api_router.post("/courses/new", response_model=schemes.Course)
def create_new_course(
        new_course: schemes.CourseNew,
        db: Session = Depends(get_db),
        user = Security(get_current_user, scopes=['author'])
    ):
    existing_course = crud.get_course_by_name(db, new_course.name, user.author[0].id)
    if existing_course:
        raise HTTPException(status_code=400, detail="Сourse with the same name already exists for this author")
    
    course = schemes.CourseCreate(
        **new_course.dict(),
        author_id=user.author[0].id,
        created_at=datetime.utcnow()
    )
    return crud.create_course(db, course)



@main_api_router.get("/images/{image_id}")
def get_image(image_id: int, db: Session = Depends(get_db)):
    #Check if there is access to this image
    
    image = crud.get_image(db, image_id)
    return FileResponse(image.file)

@main_api_router.delete("/images/{image_id}", response_model=schemes.ArticleGet)
def delete_image(image_id: int, db: Session = Depends(get_db)):
    # Check that this image exists
    # Check that this image belongs to this author

    image = crud.get_image(db, image_id)
    article_id = image.article_id

    filepath = str(image.file)
    dirpath = filepath[:filepath.rfind('/')]
    remove(filepath)
    removedirs(dirpath)
    crud.delete_image(db, image_id)

    article_data = schemes.ArticleUpdate(updated_at=datetime.utcnow())
    return crud.update_article(db, article_id, article_data)