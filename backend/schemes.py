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
    created_at: datetime
    updated_at: datetime

class Course(CourseCreate):
    id: int
    name: str
    description: str
    is_public: bool
    updated_at: datetime
    views_count: int


    class Config:
        orm_mode = True


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
    updated_at: datetime
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