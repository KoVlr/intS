from fastapi import APIRouter, Depends, HTTPException, Security
from backend.API.auth import get_current_user
from sqlalchemy.orm import Session
from backend.database.database import get_db
from datetime import datetime
import uuid
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

@main_api_router.post("/articles/new", response_model=schemes.Article)
def create_new_article(
        new_article: schemes.ArticleNew,
        db: Session = Depends(get_db),
        user = Security(get_current_user, scopes=['author'])
    ):
    course = crud.get_course(db, new_article.course_id)
    if course is None:
        raise HTTPException(status_code=400, detail="This course does not exist")
    
    if course.author_id != user.author[0].id:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    existing_article = crud.get_article_by_name(db, new_article.name, new_article.course_id)
    if existing_article:
        raise HTTPException(status_code=400, detail="Article with the same name already exists in this course")
    
    filename = str(uuid.uuid4()) + '.md'
    article = schemes.ArticleCreate(
        **new_article.dict(),
        file = 'storage/articles/' + filename[:2] + '/' + filename[2:4] + '/' + filename,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    return crud.create_article(db, article)