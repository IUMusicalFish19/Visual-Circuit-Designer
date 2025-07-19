import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_register_duplicate_email(test_client, registered_user):
    _, user = registered_user

    await test_client.post("/auth/register", json={
        "email": "test@example.com",
        "name": "new user",
        "username": "testuser",
        "password": "password"
    })

    response = await test_client.post("/auth/register", json={
        "email": "test@example.com",
        "name": "super new user",
        "username": "newuser",
        "password": "password"
    })

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "email" in response.json()["detail"].lower()