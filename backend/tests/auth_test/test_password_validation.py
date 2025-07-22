import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_register_weak_password(test_client):
    response = await test_client.post("/auth/register", json={
        "name": "Weak User",
        "username": "weak",
        "email": "weak@example.com",
        "password": "123"
    })

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "password" in response.json()["detail"]