from fastapi_users.db.base import BaseUserDatabase
from backend.auth.models import UserDB
from motor.motor_asyncio import AsyncIOMotorCollection
from uuid import UUID, uuid4
from typing import Optional, Dict, Any


class MongoUserDatabase(BaseUserDatabase[UserDB, UUID]):
    def __init__(self, collection: AsyncIOMotorCollection):
        self.collection = collection

    async def get(self, id: UUID) -> Optional[UserDB]:
        user = await self.collection.find_one({"id": str(id)})
        return UserDB(**user) if user else None

    async def get_by_email(self, email: str) -> Optional[UserDB]:
        user = await self.collection.find_one({"email": email})
        if user:
            # Ensure the ID is properly converted
            user["id"] = str(user["id"]) if isinstance(user.get("id"), UUID) else user.get("id")
            return UserDB(**user)
        return None

    async def create(self, user: dict) -> dict:
        if "id" not in user:
            print("[mongo_users] User does not have an ID, generating one...")
            user["id"] = str(uuid4())
        await self.collection.insert_one(user)
        return user

    async def update(
            self,
            user: UserDB,
            update_dict: Dict[str, Any] = None,
    ) -> UserDB:
        if update_dict:
            user_dict = user.model_dump()
            user_dict.update(update_dict)
        else:
            user_dict = user.model_dump()

        user_dict["id"] = str(user_dict["id"])

        await self.collection.replace_one({"id": user_dict["id"]}, user_dict)
        return UserDB(**user_dict)

    async def get_by_username(self, username: str) -> Optional[UserDB]:
        user = await self.collection.find_one({"username": username})
        if user:
            user["id"] = str(user["id"]) if isinstance(user.get("id"), UUID) else user.get("id")
            return UserDB(**user)
        return None

    async def delete(self, user: UserDB) -> None:
        await self.collection.delete_one({"id": str(user.id)})

    async def _convert_to_userdb(self, user_dict: dict) -> UserDB:
        # Convert MongoDB document to UserDB
        user_dict["id"] = UUID(user_dict["id"]) if isinstance(user_dict.get("id"), str) else user_dict.get("id")
        return UserDB(**user_dict)