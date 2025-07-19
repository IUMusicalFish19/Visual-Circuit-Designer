import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_delete_user(test_client, registered_user):
    _, user = registered_user

    # Login
    login_response = await test_client.post("/auth/jwt/login", data={
        "username": user["email"],
        "password": "TestPassword123"
    })
    print("Login status:", login_response.status_code)
    print("Login body:", login_response.text)
    assert login_response.status_code == status.HTTP_200_OK
    assert login_response is not None
    assert "access_token" in login_response.json()
    token = login_response.json()["access_token"]

    # Delete user
    response = await test_client.delete(
        f"/users/{user['id']}",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify user is deleted
    login_response = await test_client.post("/auth/jwt/login", data={
        "username": user["email"],
        "password": "TestPassword123"
    })
    assert login_response.status_code == status.HTTP_400_BAD_REQUEST