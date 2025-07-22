from pydantic import BaseModel, EmailStr, Field
from uuid import UUID, uuid4

class UserDB(BaseModel):
    id: UUID
    name: str
    username: str
    email: EmailStr
    hashed_password: str
    is_active: bool = True
    is_superuser: bool = False
