from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, Security, Query, UploadFile
from sqlalchemy.orm import Session
from datetime import datetime
from os import makedirs, remove, removedirs
import uuid
import shutil
from fastapi.responses import FileResponse


from .auth import get_authenticated_user, get_current_user
from database.db_connection import get_db
from database import db_models
import schemes.courses
import schemes.articles
import crud


courses_router = APIRouter(
    prefix="/api/courses",
    tags=["Courses"]
)


def is_own_course(db_course: db_models.Courses, user: db_models.Users):
    if user is not None and user.author is not None and db_course.author_id == user.author.id:
        return True
    else:
        return False


def is_available_course(
        db_course: db_models.Courses,
        user: db_models.Users,
        db: Session
    ):
    if db_course.is_public:
        return True
    
    if user is None:
        return False
    
    db_access_entry = crud.get_access_entry(db, db_course.id, user.id)
    if db_access_entry is not None:
        return True
    
    if user.author is not None and db_course.author_id == user.author.id:
        return True
    
    return False


def check_own_course(db_course: db_models.Courses, user: db_models.Users):
    if not is_own_course(db_course, user):
        raise HTTPException(status_code=400, detail="Not enough permissions")


def check_available_course(
        db_course: db_models.Courses,
        user: db_models.Users,
        db: Session
    ):
    if not is_available_course(db_course, user, db):
        raise HTTPException(status_code=400, detail="No access to this course")


def get_own_course(
        course_id: int,
        user = Security(get_authenticated_user, scopes=['author']),
        db: Session = Depends(get_db)
    ):
    db_course = crud.get_course(db, course_id)
    if db_course is None:
        raise HTTPException(status_code=400, detail="This course does not exist")
    
    check_own_course(db_course, user)
    return db_course


def get_available_course(
        course_id: int,
        user = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
    db_course = crud.get_course(db, course_id)
    if db_course is None:
        raise HTTPException(status_code=400, detail="This course does not exist")
    
    check_available_course(db_course, user, db)
    return db_course


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



@courses_router.post("", response_model=schemes.courses.Course)
def create_new_course(
        new_course: schemes.courses.CourseNew,
        user = Security(get_authenticated_user, scopes=['author']),
        db: Session = Depends(get_db)
    ):
    existing_course = crud.get_course_by_name(db, new_course.name, user.author.id)
    if existing_course is not None:
        raise HTTPException(status_code=400, detail="Сourse with the same name already exists for this author")
    
    course = schemes.courses.CourseCreate(
        **new_course.dict(),
        author_id=user.author.id,
        access_code = None if new_course.is_public else uuid.uuid4(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    return crud.create_course(db, course)


@courses_router.get("", response_model = List[schemes.courses.CourseInList])
def get_courses(
        offset: Annotated[int, Query(ge=0)] = 0,
        limit: Annotated[int, Query(ge=1, le=100)] = 20,
        db: Session = Depends(get_db)
    ):
    db_courses = crud.get_courses_list(db, offset, limit)
    courses = [schemes.courses.Course.from_orm(db_course) for db_course in db_courses]

    for i, db_course in enumerate(db_courses):
        author = db_course.author.user.username
        courses[i] = schemes.courses.CourseInList(**courses[i].dict(), author=author)

    return courses


@courses_router.get("/mine", response_model = List[schemes.courses.CourseInAuthorList])
def get_my_courses(
        offset: Annotated[int, Query(ge=0)] = 0,
        limit: Annotated[int, Query(ge=1, le=100)] = 20,
        user = Security(get_authenticated_user, scopes=["author"]),
        db: Session = Depends(get_db)
    ):
    return crud.get_courses_by_author(db, user.author.id, offset, limit)


@courses_router.get("/collection", response_model = List[schemes.courses.CourseInList])
def get_collection(
        offset: Annotated[int, Query(ge=0)] = 0,
        limit: Annotated[int, Query(ge=1, le=100)] = 20,
        user = Depends(get_authenticated_user),
        db: Session = Depends(get_db)
    ):
    db_courses = crud.get_courses_in_collection(db, user.id,offset, limit)
    courses = [schemes.courses.Course.from_orm(db_course) for db_course in db_courses]

    for i, db_course in enumerate(db_courses):
        author = db_course.author.user.username
        courses[i] = schemes.courses.CourseInList(**courses[i].dict(), author=author)

    return courses


@courses_router.get("/search", response_model = List[schemes.courses.CourseSearch])
def search_in_courses(
    query: str,
    mine: bool = False,
    collection: bool = False,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_courses = crud.get_search_in_courses(
        db,
        query=query,
        user_id = user.id if user is not None else None,
        offset=offset,
        limit=limit,
        mine=mine,
        collection=collection
    )

    db_articles = crud.get_search_in_articles(
        db,
        query=query,
        user_id = user.id if user is not None else None,
        offset=offset,
        limit=limit,
        mine=mine,
        collection=collection
    )

    search_result = []
    for db_course in db_courses:
        search_result += [{
            **schemes.courses.CourseSearchBase.from_orm(db_course).dict(),
            'author': db_course.author.user.username
        }]
    for db_article in db_articles:
        search_result += [{
            'id': db_article.course.id,
            'name': db_article.course.name,
            'author': db_article.course.author.user.username,
            'article': schemes.courses.ArticleSearch.from_orm(db_article)
        }]
    return search_result


@courses_router.post("/collection/{course_id}")
def add_course_to_collection(
        course_id: int,
        user = Depends(get_authenticated_user),
        db: Session = Depends(get_db)
    ):
    crud.create_collection_entry(db, schemes.courses.CollectionCreate(
        user_id=user.id, course_id=course_id, added_at=datetime.utcnow()
    ))


@courses_router.delete("/collection/{course_id}")
def delete_course_from_collection(
        course_id: int,
        user = Depends(get_authenticated_user),
        db: Session = Depends(get_db)
    ):
    crud.delete_collection_entry(db, user.id, course_id)


def toCourseGet(
    db_course: db_models.Courses,
    user: db_models.Users,
    db: Session
):
    author = db_course.author.user.username
    ownership = is_own_course(db_course, user)
    access = is_available_course(db_course, user, db)

    if ownership:
        access_code = db_course.access_code
        in_collection = None
    else:
        access_code = None
        in_collection = user.id in [
            collection_entry.user_id for collection_entry in db_course.collections
        ]

    if access:
        articles = crud.get_published_articles(db, db_course.id)
        files = crud.get_course_files(db, db_course.id)
    else:
        articles = None
        files = None

    
    return schemes.courses.CourseGet(
        course_data=db_course,
        author=author,
        ownership=ownership,
        in_collection=in_collection,
        access=access,
        access_code=access_code,
        articles=articles,
        files=files
    )


@courses_router.get("/{course_id}", response_model=schemes.courses.CourseGet)
def get_course(
        course_id: int, user = Depends(get_current_user), db: Session = Depends(get_db)
    ):
    db_course = crud.get_course(db, course_id)
    return toCourseGet(db_course, user, db)


@courses_router.patch("/{course_id}", response_model=schemes.courses.CourseForAuthor)
def change_course(
        update_data: schemes.courses.CoursePatch,
        db_course = Depends(get_own_course),
        db: Session = Depends(get_db)
    ):
    course_update_data = {} if update_data.course_data is None\
                            else update_data.course_data.dict(exclude_unset=True)
    
    if db_course.access_code and update_data.change_access_code\
        or not db_course.access_code and update_data.course_data is not None\
            and update_data.course_data.is_public is False:
        course_update_data['access_code'] = uuid.uuid4()
    
    if update_data.articles_order is not None:
        articles_list = crud.get_published_articles(db, db_course.id)
        for article in articles_list:
            crud.update_article(db, article.id, schemes.articles.ArticleUpdate(position_in_course=None))

        for (pos, article_id) in enumerate(update_data.articles_order):
            crud.update_article(db, article_id, schemes.articles.ArticleUpdate(position_in_course=pos))

    updated_course = schemes.courses.CourseUpdate(
        **course_update_data,
        updated_at=datetime.utcnow()
    )

    return crud.update_course(db, db_course.id, updated_course)


@courses_router.delete("/{course_id}")
def delete_course(
    course_id: int,
    user = Depends(get_current_user),
    db_course = Depends(get_own_course),
    db: Session = Depends(get_db)
):
    for db_article in db_course.articles:
        for db_image in db_article.images:
            filepath = str(db_image.file)
            dirpath = filepath[:filepath.rfind('/')]
            remove(filepath)
            removedirs(dirpath)

    for db_file in db_course.files:
        filepath = str(db_file.path)
        dirpath = filepath[:filepath.rfind('/')]
        remove(filepath)
        removedirs(dirpath)

    crud.delete_course(db, course_id)


@courses_router.get("/{course_id}/drafts", response_model=List[schemes.courses.ArticleInCourse])
def get_course_drafts(
        db_course = Depends(get_own_course),
        db: Session = Depends(get_db)
    ):
    return crud.get_drafts(db, db_course.id)


@courses_router.post("/{course_id}/access")
def get_access_to_course(
        course_id: int,
        access_data: schemes.courses.AccessPost,
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
    
    crud.create_access(db, schemes.courses.AccessCreate(
            user_id=user.id,
            course_id=course_id,
            received_at=datetime.utcnow()
        )
    )
    

@courses_router.post("/{course_id}/files", response_model=schemes.courses.CourseGet)
def upload_files(
    files: list[UploadFile],
    user = Depends(get_current_user),
    course = Depends(get_own_course),
    db: Session = Depends(get_db)
):
    
    uploaded_files = []
    existing_files = crud.get_course_files(db, course.id)

    for file in files:
        for e_file in existing_files:
            if e_file.original_name == file.filename:
                raise HTTPException(status_code=400, detail="File with the same name already exists in this course")

        filename = str(uuid.uuid4()) + '.' + file.filename.split('.')[-1]
        dirpath = 'storage/files/' + filename[:2] + '/' + filename[2:4] + '/'
        filepath = dirpath + filename

        file_data = schemes.courses.FileCreate(
            course_id = course.id,
            path = filepath,
            original_name = file.filename,
            uploaded_at=datetime.utcnow()
        )
        
        makedirs(dirpath, exist_ok=True)
        with open(filepath, 'wb') as fdst:
            shutil.copyfileobj(file.file, fdst)

        db_file = crud.create_file(db, file_data)
        uploaded_files += [db_file]

    course_data = schemes.courses.CourseUpdate(updated_at=datetime.utcnow())
    db_course = crud.update_course(db, course.id, course_data)
    return toCourseGet(db_course, user, db)


@courses_router.get("/files/{file_id}")
def get_file(
        db_file = Depends(get_available_file),  db: Session = Depends(get_db)
    ):    
    return FileResponse(db_file.path, filename=db_file.original_name)


@courses_router.delete("/files/{file_id}", response_model=schemes.courses.CourseGet)
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

    course_data = schemes.courses.CourseUpdate(updated_at=datetime.utcnow())
    db_course = crud.update_course(db, db_file.course_id, course_data)
    return toCourseGet(db_course, user, db)