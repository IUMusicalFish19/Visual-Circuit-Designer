import pytest
from fastapi import status

from backend.profile.utils import decode_jwt


@pytest.mark.asyncio
async def test_update_email(auth_client, registered_user, profile_client, test_custom_node_data):
    user_data, token = registered_user

    id = decode_jwt(token)['id']

    pid = 1
    update_response = await profile_client.patch(
        f"/api/profile/{id}/project/{pid}/custom_nodes",
        json={"custom_nodes": test_custom_node_data},
        headers={"Authorization": f"Bearer {token}"}
    )

    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["status"] == "custom_nodes updated"

    profile_response = await profile_client.get(
        f"/api/profile/{id}/project/{pid}",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert profile_response.status_code == status.HTTP_200_OK
    assert profile_response.json()["custom_nodes"]