import pytest
from fastapi import status
from backend.profile.utils import decode_jwt


@pytest.mark.asyncio
async def test_update_name(auth_client, registered_user, profile_client):
    user_data, token = registered_user

    id = decode_jwt(token)['id']

    new_name = "Mikhail Viktorovich"
    update_response = await profile_client.patch(
        f"/api/profile/{id}/name",
        json={"name": new_name},
        headers={"Authorization": f"Bearer {token}"}
    )

    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["status"] == "name updated"

    profile_response = await profile_client.get(
        f"/api/profile/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert profile_response.status_code == status.HTTP_200_OK
    assert profile_response.json()["name"] == new_name