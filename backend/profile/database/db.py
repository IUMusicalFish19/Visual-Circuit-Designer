import os
from typing import Any, AsyncGenerator
from fastapi import Depends
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.ext.asyncio.session import AsyncSession

from backend.profile.database.pgre_projects import PostgreSQLProjectDatabase
from backend.profile.database.pgre_users import PostgreSQLUserDatabase
from backend.profile.models import User, ProjectModel
from backend.profile.schemas import UserDB, ProjectDB

try:
    DATABASE_URL = (
        f"postgresql+asyncpg://{os.environ['POSTGRES_USER']}:"
        f"{os.environ['POSTGRES_PASSWORD']}@"
        f"{os.environ['POSTGRES_HOST']}:"
        f"{os.environ['POSTGRES_PORT']}/"
        f"{os.environ['POSTGRES_DB']}"
    )
except KeyError:
    DATABASE_URL = (
        f"postgresql+asyncpg://vcd:"
        f"pgpwd4vcd@"
        f"localhost:"
        f"5432/"
        f"vcd"
    )

engine = create_async_engine(DATABASE_URL, echo=True)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

async def get_async_session() -> AsyncGenerator[AsyncSession, Any]:
    async with async_session_maker() as session:
        yield session

async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield PostgreSQLUserDatabase(
        session=session,
        user_model=User,
        user_db_model=UserDB
    )

async def get_project_db(session: AsyncSession = Depends(get_async_session)):
    yield PostgreSQLProjectDatabase(
        session=session,
        project_model=ProjectModel,
        project_db_model=ProjectDB
    )