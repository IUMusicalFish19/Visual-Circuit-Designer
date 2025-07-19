import pytest
from fastapi import status

from backend.auth.main import app


@pytest.mark.asyncio
async def test_login_success(test_client, registered_user):
    user_data, user = registered_user

    print("User in DB:", user)
    print("Attempting login with:", user_data["email"], user_data["password"])

    print("Registered routes:")
    for route in app.routes:
        if hasattr(route, "path"):
            print(f"{route.path}")

    response = await test_client.post(
        "/auth/login",
        data={
            "username": user_data["email"],
            "password": user_data["password"]
        }
    )

    print("Response:", response.status_code, response.text)


    assert response.status_code == status.HTTP_200_OK
    print("Response:", response.text)
    print("Cookies:", response.cookies)
    assert response.json()["access_token"]
    assert "refresh_token" in response.cookies
    assert response.cookies["refresh_token"] != response.json()["access_token"]
