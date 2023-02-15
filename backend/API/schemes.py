from pydantic import BaseModel
from typing import List

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None
    scopes: List[str] = []

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(BaseModel):
    id: int
    class Config:
        orm_mode = True