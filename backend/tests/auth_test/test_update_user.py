import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_update_user(test_client, registered_user):
    _, user = registered_user

    # Login
    login_response = await test_client.post("/auth/login", data={
        "username": user["email"],
        "password": "TestPassword123"
    })
    token = login_response.json()["access_token"]

    # Update user
    update_data = {
        "name": "Updated Name",
        "username": "updatedusername"
    }
    response = await test_client.patch(
        f"/users/{user['id']}",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["username"] == update_data["username"]