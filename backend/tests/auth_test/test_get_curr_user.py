import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_get_current_user(test_client, registered_user):
    _, user = registered_user

    # First login to get token
    login_response = await test_client.post("/auth/login", data={
        "username": user["email"],
        "password": "TestPassword123"
    })
    token = login_response.json()["access_token"]

    # Get current user
    response = await test_client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == user["email"]
    assert data["username"] == user["username"]