import json
import httpx
import base64
from typing import Annotated
from fastapi import Depends, HTTPException, Header
from fastapi.security import OAuth2PasswordBearer


async def get_current_user(authorization: Annotated[str, Header(...)]) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.removeprefix("Bearer ").strip()

    async with httpx.AsyncClient(base_url="http://localhost:8080") as client:
        response = await client.post("/api/auth/verify", headers={"Authorization": f"Bearer {token}"})

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return decode_jwt(token)

def decode_jwt(token: str):
    try:
        payload_part = token.split('.')[1]
        padded = payload_part + '=' * (-len(payload_part) % 4)
        decoded_bytes = base64.urlsafe_b64decode(padded)
        payload = json.loads(decoded_bytes)
        return payload
    except Exception as e:
        raise ValueError(f"Invalid token format: {e}")