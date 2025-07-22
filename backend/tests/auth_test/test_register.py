import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_register_user(test_client):
    response = await test_client.post("/auth/register", json={
        "name": "New User",
        "username": "newuser",
        "email": "new@example.com",
        "password": "NewPassword123"
    })

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "id" in data
    assert data["email"] == "new@example.com"
    assert data["username"] == "newuser"
