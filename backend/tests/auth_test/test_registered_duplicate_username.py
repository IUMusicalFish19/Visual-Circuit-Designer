import pytest


@pytest.mark.asyncio
async def test_register_duplicate_username(test_client):
    await test_client.post("/auth/register", json={
        "email": "test@example.com",
        "name": "Test user",
        "username": "uniqueuser",
        "password": "password"
    })

    response = await test_client.post("/auth/register", json={
        "email": "new@example.com",
        "name": "New User",
        "username": "uniqueuser",
        "password": "password"
    })

    assert response.status_code == 400
    assert "username" in response.json()["detail"].lower()