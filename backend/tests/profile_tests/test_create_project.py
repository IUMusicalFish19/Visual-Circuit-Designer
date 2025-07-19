import pytest
from fastapi import status
from backend.profile.utils import decode_jwt


@pytest.mark.asyncio
async def test_create_project(auth_client, registered_user, profile_client, test_project_data):
    user_data, token = registered_user

    id = decode_jwt(token)['id']

    response = await profile_client.post(
        f"/api/profile/{id}/project",
        json=test_project_data,
        headers={"Authorization": f"Bearer {token}"}
    )

    print(response.json()["project_id"])
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "project created"
