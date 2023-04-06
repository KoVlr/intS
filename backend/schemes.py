from pydantic import BaseModel
from typing import List
from datetime import datetime
import uuid

class Token(BaseModel):
    access_token: str
    token_type: str
    expires: float
    rights: List[str] = []

class TokenData(BaseModel):
    email: str | None = None
    scopes: List[str] = []

class RefreshToken(BaseModel):
    uuid: uuid.UUID
    user_id: int
    created_at: datetime
    expires_in: int


class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        orm_mode = True



class AuthorCreate(BaseModel):
    user_id: int

class Author(AuthorCreate):
    id: int
    class Config:
        orm_mode = True



class CourseNew(BaseModel):
    name: str
    description: str
    is_public: bool


class CourseCreate(CourseNew):
    author_id: int
    views_count: int = 0
    access_code: str | None
    created_at: datetime
    updated_at: datetime


class Course(BaseModel):
    id: int
    name: str
    description: str
    is_public: bool
    author_id: int
    views_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class CourseInList(BaseModel):
    id: int
    name: str
    author: str
    description: str
    is_public: bool


class CourseInAuthorList(BaseModel):
    id: int
    name: str
    description: str
    is_public: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class DraftInCourse(BaseModel):
    id: int
    name: str
    updated_at: datetime

    class Config:
        orm_mode = True


class ArticleInCourse(DraftInCourse):
    position_in_course: int


class CourseGet(BaseModel):
    course_data: Course
    author: str
    ownership: bool
    in_collection: bool | None
    access: bool
    access_code: str | None
    articles: List[ArticleInCourse]


class CourseChangeData(BaseModel):
    name: str | None
    description: str | None
    is_public: bool | None


class CourseUpdate(CourseChangeData):
    access_code: str | None
    updated_at: datetime


class CoursePatch(BaseModel):
    course_data: CourseChangeData | None
    change_access_code: bool | None
    articles_order: List[int] | None


class AccessPost(BaseModel):
    access_code: str


class AccessCreate(BaseModel):
    user_id: int
    course_id: int
    received_at: datetime


class CollectionCreate(BaseModel):
    user_id: int
    course_id: int
    added_at: datetime


class ArticleNew(BaseModel):
    name: str
    course_id: int

class ArticleBase(ArticleNew):
    created_at: datetime
    updated_at: datetime
    is_published: bool = False
    published_at: datetime | None = None
    position_in_course: int | None = None

class ArticleCreate(ArticleBase):
    file: str

class ArticleGet(ArticleBase):
    id: int
    class Config:
        orm_mode = True

class ArticlePatch(BaseModel):
    name: str | None
    is_published: bool | None

class ArticleUpdate(BaseModel):
    updated_at: datetime | None
    name: str | None
    is_published: bool | None
    position_in_course: int | None
    published_at: datetime | None


class ImageCreate(BaseModel):
    article_id: int
    file: str
    original_name: str

class ImageGet(BaseModel):
    id: int
    original_name: str  
    class Config:
        orm_mode = True

class UploadImagesResponse(BaseModel):
    article: ArticleGet
    uploaded_images: list[ImageGet]