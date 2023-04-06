from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, Security, Query
from sqlalchemy.orm import Session
from datetime import datetime
from random import choices
import string


from .auth import get_authenticated_user, get_current_user
from ..database import get_db
from .. import schemes
from .. import crud

courses_router = APIRouter(
    prefix="/api/courses",
    tags=["Courses"]
)


def generate_access_code():
    return ''.join(choices(string.ascii_uppercase + string.digits, k=8))


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
        access_code = None if new_course.is_public else generate_access_code(),
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
            access_code = db_course.access_code
        else:
            in_collection = False
            for collection in db_course.collections:
                if collection.user_id == user.id:
                    in_collection = True
                    break

            access = False
            access_code = None
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
        access_code=access_code,
        articles=articles
    )


@courses_router.get("/{course_id}/drafts", response_model=List[schemes.DraftInCourse])
def get_course_drafts(
        course_id: int,
        user = Security(get_authenticated_user, scopes=['author']),
        db: Session = Depends(get_db)
    ):
    #Check access

    return crud.get_drafts(db, course_id)


@courses_router.patch("/{course_id}")
def change_course(
        update_data: schemes.CoursePatch,
        course_id: int,
        db: Session = Depends(get_db)
    ):
    #Check access
    db_course = crud.get_course(db, course_id)

    course_update_data = {} if update_data.course_data is None\
                            else update_data.course_data.dict(exclude_unset=True)
    
    if db_course.access_code and update_data.change_access_code\
        or not db_course.access_code and update_data.course_data.is_public is False:
        course_update_data['access_code'] = generate_access_code()
    
    if update_data.articles_order is not None:
        articles_list = crud.get_published_articles(db, course_id)
        for article in articles_list:
            crud.update_article(db, article.id, schemes.ArticleUpdate(position_in_course=None))

        for (pos, article_id) in enumerate(update_data.articles_order):
            crud.update_article(db, article_id, schemes.ArticleUpdate(position_in_course=pos))

    updated_course = schemes.CourseUpdate(
        **course_update_data,
        updated_at=datetime.utcnow()
    )

    crud.update_course(db, course_id, updated_course)


@courses_router.post("/{course_id}/access")
def get_access_to_course(
        course_id: int,
        access_data: schemes.AccessPost,
        user = Depends(get_authenticated_user),
        db: Session = Depends(get_db)
    ):
    existing_access = crud.get_access_entry(db, user.id, course_id)
    if existing_access is not None:
        raise HTTPException(status_code=400, detail="User already has access")
    
    db_course = crud.get_course(db, course_id)
    if db_course is None:
        raise HTTPException(status_code=400, detail="Course does not exist")
    
    if user.author is not None and user.author.id == db_course.author_id:
        raise HTTPException(status_code=400, detail="User is the author of the course")
    
    if access_data.access_code != db_course.access_code:
        raise HTTPException(status_code=400, detail="Invalid access code")
    
    crud.create_access(db, schemes.AccessCreate(
            user_id=user.id,
            course_id=course_id,
            received_at=datetime.utcnow()
        ))
    

@courses_router.post("/collection/{course_id}")
def add_course_to_collection(
        course_id: int,
        user = Depends(get_authenticated_user),
        db: Session = Depends(get_db)
    ):
    #Check access
    crud.create_collection_entry(db, schemes.CollectionCreate(
        user_id=user.id, course_id=course_id, added_at=datetime.utcnow()
    ))


@courses_router.delete("/collection/{course_id}")
def delete_course_from_collection(
        course_id: int,
        user = Depends(get_authenticated_user),
        db: Session = Depends(get_db)
    ):
    #Check access
    crud.delete_collection_entry(db, user.id, course_id)