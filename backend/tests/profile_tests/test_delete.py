import pytest

from backend.profile.utils import decode_jwt
from fastapi import status


@pytest.mark.asyncio
async def test_create_project(auth_client, registered_user, profile_client, test_project_data):
    original_user, original_token = registered_user
    user_data = {
        "name": "some user",
        "username": "deleteuser",
        "email": "deleteme@yandex.ru",
        "password": "qwerty12345",
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
    id = decode_jwt(token)['id']

    creation_project_response = await profile_client.post(
        f"/api/profile/{id}/project",
        headers={"Authorization": f"Bearer {token}"},
        json=test_project_data
    )

    assert creation_project_response.status_code == 200
    pid = creation_project_response.json()["project_id"]

    delete_project_response = await profile_client.delete(
        f"/api/profile/{id}/project/{pid}",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert delete_project_response.status_code == status.HTTP_200_OK
    assert delete_project_response.status_code == 200

    delete_user_response = await profile_client.delete(
        f"/api/profile/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert delete_user_response.status_code == status.HTTP_200_OK
    assert delete_user_response.json()['status'] == 'deleted'

    response = await profile_client.get(
        f"/api/profile/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
