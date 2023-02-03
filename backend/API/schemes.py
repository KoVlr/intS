from pydantic import BaseModel
from typing import List

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None
    scopes: List[str] = []

class UserModel(BaseModel):
    email: str
    hashed_password: str