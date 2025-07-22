from typing import Optional
from uuid import UUID, uuid4

from fastapi.security import OAuth2PasswordRequestForm
from fastapi_users.manager import BaseUserManager, UUIDIDMixin

from backend.auth.models import UserDB
from fastapi_users.authentication import JWTStrategy, AuthenticationBackend, CookieTransport, BearerTransport
from fastapi_users.password import PasswordHelper
from backend.auth.config import SECRET
from backend.auth.schema import UserCreate
import logging


logger = logging.getLogger(__name__)

class MyUserManager(UUIDIDMixin, BaseUserManager[UserDB, UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET
    password_helper = PasswordHelper()

    async def on_after_register(self, user: UserDB, request=None):
        print(f"User registered: {user}")

    async def authenticate(
            self, credentials: OAuth2PasswordRequestForm
    ) -> Optional[UserDB]:
        logger.debug(f"Authenticating user: {credentials.username}")
        try:
            user = await self.get_by_email(credentials.username)
            if user is None:
                # Run the hasher to mitigate timing attack
                self.password_helper.hash(credentials.password)
                return None

            verified, updated_password_hash = self.password_helper.verify_and_update(
                credentials.password, user.hashed_password
            )
            if not verified:
                return None

            if updated_password_hash is not None:
                user.hashed_password = updated_password_hash
                await self.user_db.update(user, {})

            return user
        except Exception:
            return None

    async def create(self, user_create: UserCreate, safe: bool = False, request=None) -> UserDB:
        # Ensure all required fields are included
        user_id = uuid4()

        # Prepare user data
        user_dict = user_create.model_dump()
        user_dict["id"] = str(user_id)
        user_dict["hashed_password"] = self.password_helper.hash(user_create.password)

        user_dict["is_active"] = True
        user_dict["is_superuser"] = False
        user_dict.pop("password", None)

        created_user = await self.user_db.create(user_dict)
        return await self.get(created_user["id"])

# Transport for access token (Bearer)
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

# Transport for refresh token (HTTP-only cookie)
cookie_transport = CookieTransport(cookie_name="refresh_token", cookie_max_age=86_400)

def get_access_strategy() -> JWTStrategy:
    return JWTStrategy(
        secret=SECRET,
        lifetime_seconds=3600 * 24,  # 24 hours
        # lifetime_seconds=2, # For expiration tests
        algorithm="HS256",
        token_audience=["fastapi-users:auth"]
    )

def get_refresh_strategy() -> JWTStrategy:
    return JWTStrategy(
        secret=SECRET,
        lifetime_seconds=86400 * 30,  # 30 days
        algorithm="HS256",
        token_audience = ["fastapi-users:auth"]
    )

# Create authentication backends
auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_access_strategy,
)

refresh_backend = AuthenticationBackend(
    name="cookie",
    transport=cookie_transport,
    get_strategy=get_refresh_strategy,
)