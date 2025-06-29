import pytest
import pytest_asyncio
import subprocess
import time
import socketio


@pytest.fixture(scope="session")
def start_test_server():
    proc = subprocess.Popen([
        "uvicorn",
        "connect:socket_app",
        "--host", "127.0.0.1",
        "--port", "80"
    ])
    time.sleep(1.5)
    yield
    proc.terminate()
    proc.wait()


@pytest_asyncio.fixture
async def socketio_client(start_test_server):
    client = socketio.AsyncClient()
    await client.connect("http://127.0.0.1:80")
    yield client
    await client.disconnect()
