from pydantic import EmailStr
from typing import Any, Dict, Optional, Type, TypeVar
from fastapi_users.db.base import BaseUserDatabase
from sqlalchemy import select, delete, update, insert
from sqlalchemy.ext.asyncio import AsyncSession
from backend.profile.models import User as UserModel
from backend.profile.schemas import UserDB

UP = TypeVar("UP", bound=UserDB)


class PostgreSQLUserDatabase(BaseUserDatabase[UP, int]):
    def __init__(
            self,
            session: AsyncSession,
            user_model: Type[UserModel],
            user_db_model: Type[UP]
    ):
        self.session = session
        self.user_model = user_model
        self.user_db_model = user_db_model

    async def get(self, id: int) -> Optional[UP]:
        stmt = select(self.user_model).where(self.user_model.id == id)
        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()
        if user is None:
            return None
        return self._convert_to_userdb(user)

    async def get_by_email(self, email: str) -> Optional[UP]:
        stmt = select(self.user_model).where(self.user_model.email == email)
        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()
        if user is None:
            return None
        return self._convert_to_userdb(user)

    async def get_by_username(self, username: str) -> Optional[UP]:
        stmt = select(self.user_model).where(self.user_model.username == username)
        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()
        if user is None:
            return None
        return self._convert_to_userdb(user)

    async def create(self, user_dict: Dict[str, Any]) -> UP:
        user_dict.pop("id", None)

        stmt = insert(self.user_model).values(**user_dict).returning(self.user_model)
        result = await self.session.execute(stmt)
        await self.session.commit()
        user = result.scalar_one()
        return self._convert_to_userdb(user)

    async def update(
            self,
            user: UP,
            update_dict: Dict[str, EmailStr | str]
    ) -> UP:
        stmt = (
            update(self.user_model)
            .where(self.user_model.id == user.id)
            .values(**update_dict)
            .returning(self.user_model)
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        updated_user = result.scalar_one()
        return self._convert_to_userdb(updated_user)

    async def delete(self, user: UP) -> None:
        stmt = delete(self.user_model).where(self.user_model.id == user.id)
        await self.session.execute(stmt)
        await self.session.commit()

    def _convert_to_userdb(self, user: UserModel) -> UP:
        user_dict = {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "hashed_password": user.password_hash,
            "created_at": user.created_at,
            "salt": user.salt,

            # Add default required fields
            "is_active": True,
            "is_superuser": False,
            "is_verified": True

        }
        return self.user_db_model(**user_dict)