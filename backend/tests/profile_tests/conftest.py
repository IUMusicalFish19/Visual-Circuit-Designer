import os
import httpx
import pytest_asyncio
from fastapi import status
from backend.profile.main import app as profile_app


@pytest_asyncio.fixture
async def auth_client():
    auth_url = os.getenv("AUTH_SERVICE_URL", "http://localhost:8080")
    async with httpx.AsyncClient(base_url=auth_url) as client:
        yield client

@pytest_asyncio.fixture
async def profile_client():
    transport = httpx.ASGITransport(app=profile_app)
    return httpx.AsyncClient(transport=transport, base_url="http://test")

@pytest_asyncio.fixture
async def registered_user(auth_client):
    user_data = {
        "name": "Test User",
        "username": "unittest",
        "email": "test@example.com",
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
    assert login_response.status_code == status.HTTP_200_OK

    return user_data, token

@pytest_asyncio.fixture
async def test_project_data():
    return {
        "name": "Test Project",
        "circuit": {
          "nodes": [
            {
              "id": "andNode_1751219192609",
              "type": "andNode",
              "position": {
                "x": 130,
                "y": 220
              },
              "data": {
                "customId": "andNode_1751219192609"
              }
            },
            {
              "id": "inputNodeSwitch_1751219193704",
              "type": "inputNodeSwitch",
              "position": {
                "x": 10,
                "y": 370
              },
              "data": {
                "customId": "inputNodeSwitch_1751219193704"
              }
            }
          ],
          "edges": [
            {
              "id": "xy-edge__inputNodeSwitch_1751219193704output-1-andNode_1751219192609input-1",
              "source": "inputNodeSwitch_1751219193704",
              "target": "andNode_1751219192609",
              "sourceHandle": "output-1",
              "targetHandle": "input-1"
            }
          ]
        },
        # "custom_nodes": []
    }

@pytest_asyncio.fixture
async def test_custom_node_data():
    return {
        "name": "Test Project",
        "id": "1",
        "circuit": {
          "nodes": [
            {
              "id": "andNode_1751219192609",
              "type": "andNode",
              "position": {
                "x": 130,
                "y": 220
              },
              "data": {
                "customId": "andNode_1751219192609"
              }
            },
            {
              "id": "inputNodeSwitch_1751219193704",
              "type": "inputNodeSwitch",
              "position": {
                "x": 10,
                "y": 370
              },
              "data": {
                "customId": "inputNodeSwitch_1751219193704"
              }
            }
          ],
          "edges": [
            {
              "id": "xy-edge__inputNodeSwitch_1751219193704output-1-andNode_1751219192609input-1",
              "source": "inputNodeSwitch_1751219193704",
              "target": "andNode_1751219192609",
              "sourceHandle": "output-1",
              "targetHandle": "input-1"
            }
          ]
        },
        # "custom_nodes": []
    }