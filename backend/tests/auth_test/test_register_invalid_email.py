import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_register_invalid_email(test_client):
    response = await test_client.post("/auth/register", json={
        "name": "Invalid User",
        "username": "invalid",
        "email": "not-an-email",
        "password": "Password123"
    })

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY