from pydantic import BaseModel
from typing import List
from datetime import datetime
import uuid

class Token(BaseModel):
    access_token: str
    token_type: str
    expires: datetime

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