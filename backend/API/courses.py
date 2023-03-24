from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, Security, Query
from sqlalchemy.orm import Session
from datetime import datetime


from .auth import get_authenticated_user, get_current_user
from ..database import get_db
from .. import schemes
from .. import crud

courses_router = APIRouter(
    prefix="/api/courses",
    tags=["Courses"]
)


@courses_router.post("", response_model=schemes.Course)
def create_new_course(
        new_course: schemes.CourseNew,
        user = Security(get_authenticated_user, scopes=['author']),
        db: Session = Depends(get_db)
    ):
    existing_course = crud.get_course_by_name(db, new_course.name, user.author.id)
    if existing_course:
        raise HTTPException(status_code=400, detail="Сourse with the same name already exists for this author")
    
    course = schemes.CourseCreate(
        **new_course.dict(),
        author_id=user.author.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    return crud.create_course(db, course)


@courses_router.get("", response_model = List[schemes.CourseInList])
def get_courses(
        offset: Annotated[int, Query(ge=0)] = 0,
        limit: Annotated[int, Query(ge=1, le=100)] = 20,
        db: Session = Depends(get_db)
    ):
    db_courses = crud.get_courses_list(db, offset, limit)
    courses = [schemes.Course.from_orm(db_course) for db_course in db_courses]

    for i, db_course in enumerate(db_courses):
        author = db_course.author.user.username
        courses[i] = schemes.CourseInList(**courses[i].dict(), author=author)

    return courses


@courses_router.get("/mine", response_model = List[schemes.CourseInAuthorList])
def get_my_courses(
        offset: Annotated[int, Query(ge=0)] = 0,
        limit: Annotated[int, Query(ge=1, le=100)] = 20,
        user = Security(get_authenticated_user, scopes=["author"]),
        db: Session = Depends(get_db)
    ):
    return crud.get_courses_by_author(db, user.author.id, offset, limit)


@courses_router.get("/{course_id}", response_model=schemes.CourseGet)
def get_course(
        course_id: int, user = Depends(get_current_user), db: Session = Depends(get_db)
    ):
    db_course = crud.get_course(db, course_id)
    author = db_course.author.user.username
    articles = crud.get_published_articles(db, course_id)

    if user is None:
        ownership = False
        in_collection = False
        access = True if db_course.is_public else False
    else:
        if user.author is not None and db_course.author_id == user.author.id:
            ownership = (db_course.author_id == user.author.id)
        else:
            ownership = False

        if ownership:
            in_collection = None
            access = True
        else:
            in_collection = False
            for collection in db_course.collections:
                if collection.user_id == user.id:
                    in_collection = True
                    break

            access = False
            for access_entry in db_course.access:
                if access_entry.user_id == user.id:
                    access = True
                    break
    
    return schemes.CourseGet(
        course_data=db_course,
        author=author, 
        ownership=ownership,
        in_collection=in_collection,
        access=access,
        articles=articles
    )