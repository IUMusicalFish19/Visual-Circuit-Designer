from backend.auth.config import MONGO_URI
from motor.motor_asyncio import AsyncIOMotorClient
from backend.auth.users.mongo_users import MongoUserDatabase

client = AsyncIOMotorClient(MONGO_URI)
db = client["visual-circuit-designer"]
user_collection = db["Users"]

user_db = MongoUserDatabase(user_collection)
