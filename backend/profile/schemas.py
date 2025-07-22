from pydantic import EmailStr
from datetime import datetime
from typing import Optional, Dict
from fastapi_users import schemas


# Users schemas
class UserProfile(schemas.BaseUser):
    id: int
    username: str
    name: str
    email: EmailStr
    created_at: str

class UserRead(schemas.BaseUser[int]):
    username: str
    name: str
    email: EmailStr
    created_at: datetime

class UserCreate(schemas.BaseUserCreate):
    username: str
    name: str
    email: EmailStr
    password: str

class UserUpdate(schemas.BaseUserUpdate):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class UserDB(UserRead, schemas.BaseUser):
    salt: str

    class Config:
        orm_mode = True

class UpdateName(schemas.BaseModel):
    name: str

class UpdateEmail(schemas.BaseModel):
    email: EmailStr

class UpdatePassword(schemas.BaseModel):
    password: str


# Projects schemas
class Project(schemas.BaseModel):
    name: str
    circuit: Optional[Dict] = None
    verilog: Optional[str] = None
    custom_nodes: Optional[Dict] = None

class ProjectCreateResponse(schemas.BaseModel):
    status: str
    project_id: int

class ProjectDB(Project):
    pid: int
    owner_id: int

    class Config:
        from_attributes = True
