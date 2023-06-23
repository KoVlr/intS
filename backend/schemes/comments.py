from pydantic import BaseModel
from typing import List
from datetime import datetime


class CommentNew(BaseModel):
    article_id: int
    content: str | None
    reply_to: int | None = None


class CommentCreate(CommentNew):
    user_id: int
    created_at: datetime
    viewed_by_author: bool = False
    reply_viewed: bool = False


class Comment(CommentCreate):
    id: int

    class Config:
        orm_mode = True


class CommentGet(BaseModel):
    id: int
    user: str
    content: str | None
    created_at: datetime
    reply_to: int | None
    replies_count: int
    ownership: bool = False


class CommentPatch(BaseModel):
    content: str | None = None

class CommentUpdate(CommentPatch):
    created_at: datetime | None = None
    viewed_by_author: bool | None = None
    reply_viewed: bool | None = None


class CommentNotificationBase(BaseModel):
    id: int
    content: str
    created_at: datetime
    article_id: int

    class Config:
        orm_mode = True


class CommentNotification(CommentNotificationBase):
    user: str
    course: str
    article: str
    course_id: int
    parent_sequence: List[int]