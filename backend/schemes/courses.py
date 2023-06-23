from pydantic import BaseModel
from typing import List
from datetime import datetime
import uuid


class CourseNew(BaseModel):
    name: str
    description: str
    is_public: bool


class CourseCreate(CourseNew):
    author_id: int
    views_count: int = 0
    access_code: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


class Course(BaseModel):
    id: int
    name: str
    description: str
    is_public: bool
    author_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class CourseForAuthor(Course):
    access_code: uuid.UUID | None


class CourseInList(BaseModel):
    id: int
    name: str
    author: str
    description: str
    is_public: bool

    class Config:
        orm_mode = True


class CourseInAuthorList(BaseModel):
    id: int
    name: str
    description: str
    is_public: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class ArticleSearch(BaseModel):
    id: int
    name: str
    class Config:
        orm_mode = True


class CourseSearchBase(BaseModel):
    id: int
    name: str
    class Config:
        orm_mode = True


class CourseSearch(CourseSearchBase):
    author: str
    article: ArticleSearch | None = None


class ArticleInCourse(BaseModel):
    id: int
    name: str
    updated_at: datetime

    class Config:
        orm_mode = True


class FileCreate(BaseModel):
    course_id: int
    path: str
    original_name: str
    uploaded_at: datetime


class FileGet(BaseModel):
    id: int
    original_name: str
    class Config:
        orm_mode = True


class CourseGet(BaseModel):
    course_data: Course
    author: str
    ownership: bool
    in_collection: bool | None
    access: bool
    access_code: uuid.UUID | None
    articles: List[ArticleInCourse] | None
    files: List[FileGet] | None


class CourseChangeData(BaseModel):
    name: str | None
    description: str | None
    is_public: bool | None


class CourseUpdate(CourseChangeData):
    access_code: uuid.UUID | None
    views_count: int | None
    updated_at: datetime | None


class CoursePatch(BaseModel):
    course_data: CourseChangeData | None
    change_access_code: bool | None
    articles_order: List[int] | None


class AccessPost(BaseModel):
    access_code: uuid.UUID


class AccessCreate(BaseModel):
    user_id: int
    course_id: int
    received_at: datetime


class CollectionCreate(BaseModel):
    user_id: int
    course_id: int
    added_at: datetime