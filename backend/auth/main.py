from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, APIRouter, HTTPException
from fastapi.responses import Response
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import status
from fastapi_users import FastAPIUsers
from fastapi_users.manager import UserManagerDependency, BaseUserManager
from pymongo.errors import DuplicateKeyError
from starlette.responses import JSONResponse

from ..auth.schema import UserCreate, UserRead, UserUpdate
from ..auth.models import UserDB
from ..auth.db import user_collection
from ..auth.users.mongo_users import MongoUserDatabase
from ..auth.users.manager import MyUserManager, auth_backend, refresh_backend
from uuid import UUID

user_db = MongoUserDatabase(user_collection)

async def get_user_db():
    yield user_db

async def get_user_manager(db=Depends(get_user_db)):
    yield MyUserManager(db)

fastapi_users = FastAPIUsers[UserDB, UUID](
    get_user_manager,
    [auth_backend, refresh_backend],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/jwt/login")
get_current_user = fastapi_users.current_user(active=False)


app = FastAPI()
router = APIRouter()

@app.exception_handler(DuplicateKeyError)
async def mongo_duplicate_handler(request, exc):
    detail = "Duplicate key error"
    if "email" in str(exc):
        detail = "Email already exists"
    if "username" in str(exc):
        detail = "Username already exists"
    return JSONResponse(
        status_code=400,
        content={"detail": detail},
    )

app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"]
)

app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"]
)

@router.post("/login")
async def login(
    response: Response,
    credentials: OAuth2PasswordRequestForm = Depends(),
    user_manager: BaseUserManager[UserDB, UUID] = Depends(get_user_manager),
):
    user = await user_manager.authenticate(credentials)

    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="LOGIN_BAD_CREDENTIALS")

    # Generate tokens
    access_token = await auth_backend.get_strategy().write_token(user)
    refresh_token = await refresh_backend.get_strategy().write_token(user)

    # Set cookie
    refresh_backend.transport._set_login_cookie(response, refresh_token)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.get("/verify", tags=["auth"])
async def verify_access_token(user: UserDB = Depends(get_current_user)):
    return {
        "valid": True,
        "user_id": str(user.id),
        "email": user.email,
    }

app.include_router(router, prefix="/auth", tags=["auth"])

async def create_indexes():
    await user_collection.create_index("email", unique=True)
    await user_collection.create_index("username", unique=True)

@asynccontextmanager
async def startup():
    await create_indexes()