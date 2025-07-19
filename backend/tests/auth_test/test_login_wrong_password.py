import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_login_wrong_password(test_client, registered_user):
    user_data, _ = registered_user
    response = await test_client.post("/auth/login", data={
        "username": user_data["email"],
        "password": "WrongPassword"
    })

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "LOGIN_BAD_CREDENTIALS" in response.json()["detail"]