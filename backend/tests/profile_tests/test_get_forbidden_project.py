import pytest
from fastapi import status
from backend.profile.utils import decode_jwt


@pytest.mark.asyncio
async def test_create_project(auth_client, registered_user, profile_client, test_project_data):
    original_user, original_token = registered_user
    user_data = {
        "name": "AnotherUser",
        "username": "wronguser",
        "email": "test@example.ru",
        "password": "TestPassword123"
    }
    response = await auth_client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201 or response.status_code == 409

    login_response = await auth_client.post(
        "/api/auth/login",
        json={
            "login": user_data["username"],
            "password": user_data["password"]
        }
    )
    token = login_response.json().get("access")

    id = decode_jwt(original_token)['id']
    pid = 1

    response = await profile_client.get(
        f"/api/profile/{id}/project/{pid}",
        headers={"Authorization": f"Bearer {token}"}
    )

    print(response.json())
    assert response.status_code == status.HTTP_403_FORBIDDEN
