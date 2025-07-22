from pydantic import EmailStr
from typing import Optional
from uuid import UUID
from fastapi_users import schemas


class UserRead(schemas.BaseUser):
    id: UUID
    name: str
    username: str
    email: EmailStr
    is_active: bool


class UserCreate(schemas.BaseUserCreate):
    name: str
    username: str
    email: EmailStr
    password: str


class UserUpdate(schemas.BaseUserUpdate):
    name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None