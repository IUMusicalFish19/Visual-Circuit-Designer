import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_access_protected_route_without_token(test_client):
    response = await test_client.get("/users/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED