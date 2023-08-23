from pydantic import BaseModel
import uuid


class UserBase(BaseModel):
    username: str
    email: str


class UserNew(UserBase):
    password: str


class UserCreate(UserNew):
    activated: bool
    confirmation_code: uuid.UUID


class User(UserBase):
    id: int
    class Config:
        orm_mode = True


class UserUpdate(BaseModel):
    username: str | None = None
    email: str | None = None
    password: str | None = None
    activated: bool | None = None
    confirmation_code: uuid.UUID | None = None


class AuthorCreate(BaseModel):
    user_id: int


class Author(AuthorCreate):
    id: int
    class Config:
        orm_mode = True