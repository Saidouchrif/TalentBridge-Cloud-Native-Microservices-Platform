def test_root_health(client):
    root_response = client.get("/")
    assert root_response.status_code == 200
    assert root_response.json()["status"] == "running"

    health_response = client.get("/health")
    assert health_response.status_code == 200
    assert health_response.json() == {"status": "ok"}
