import pytest
from fastapi import status

@pytest.mark.asyncio
async def test_verify_access_token(test_client, registered_user):
    user_data, user = registered_user

    login_response = await test_client.post(
        "/auth/login",
        data={
            "username": user_data["email"],
            "password": user_data["password"]
        }
    )

    response = await test_client.get(
        "/auth/verify",
        headers={"Authorization": f"Bearer {login_response.json()['access_token']}"}
    )
    assert response.status_code == status.HTTP_200_OK

    invalid_token = login_response.json()["access_token"][::-1]
    response = await test_client.get(
        "/auth/verify",
        headers={"Authorization": f"Bearer {invalid_token}"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
