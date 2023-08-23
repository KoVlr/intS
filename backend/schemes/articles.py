from pydantic import BaseModel
from typing import List
from datetime import datetime


class ArticleNew(BaseModel):
    name: str


class ArticleBase(ArticleNew):
    course_id: int
    created_at: datetime
    updated_at: datetime
    is_published: bool = False
    published_at: datetime | None = None
    position_in_course: int | None = None


class ArticleCreate(ArticleBase):
    content: str


class ArticleGet(ArticleBase):
    id: int
    class Config:
        orm_mode = True


class ArticlePatch(BaseModel):
    name: str | None
    is_published: bool | None


class ArticleUpdate(ArticlePatch):
    updated_at: datetime | None
    position_in_course: int | None
    published_at: datetime | None
    content: str | None


class ArticleContent(BaseModel):
    content: str


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


class History(BaseModel):
    article_id: int
    user_id: int
    read_at: datetime


class HistoryGet(BaseModel):
    id: int
    name: str
    read_at: datetime
    course_name: str
    course_id: int
    author: str