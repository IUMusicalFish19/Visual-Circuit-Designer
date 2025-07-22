import httpx
import pytest
import pytest_asyncio

from backend.auth.db import user_collection
from backend.auth.main import app


@pytest_asyncio.fixture
async def test_client():
    transport = httpx.ASGITransport(app=app)
    return httpx.AsyncClient(transport=transport, base_url="http://test")

@pytest_asyncio.fixture(autouse=True)
async def cleanup(test_client):
    await user_collection.delete_many({})
    yield
    await user_collection.delete_many({})
    await test_client.aclose()

@pytest_asyncio.fixture
async def registered_user(test_client):
    user_data = {
        "name": "Test User",
        "username": "testuser",
        "email": "test@example.com",
        "password": "TestPassword123"
    }
    response = await test_client.post("/auth/register", json=user_data)
    assert response.status_code == 201

    return user_data, response.json()