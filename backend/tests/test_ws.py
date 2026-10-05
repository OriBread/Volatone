from fastapi.testclient import TestClient


def test_websocket_sends_hello(client: TestClient) -> None:
    with client.websocket_connect("/ws") as websocket:
        assert websocket.receive_json() == {"type": "hello"}
