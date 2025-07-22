import pytest
from fastapi import status
from backend.profile.utils import decode_jwt


@pytest.mark.asyncio
async def test_get_info(auth_client, registered_user, profile_client):
    user_data, token = registered_user

    verify_response = await auth_client.post(
        "/api/auth/verify",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert verify_response.status_code == status.HTTP_200_OK
    id = decode_jwt(token)['id']

    response = await profile_client.get(
        f"/api/profile/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )

    print(response.json())
    assert response.status_code == status.HTTP_200_OK
