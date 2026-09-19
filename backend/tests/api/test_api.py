"""Tests for ECHO FastAPI API Endpoints."""

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_get_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "ECHO backend"


def test_list_agents():
    response = client.get("/agents")
    assert response.status_code == 200
    agents = response.json()
    assert len(agents) == 11
    ids = [a["agent_id"] for a in agents]
    assert "ECHO-ORCH" in ids
    assert "ECHO-PSA-EXTRACT" in ids
    assert "ECHO-SSR" in ids


def test_get_agent_details():
    response = client.get("/agents/ECHO-ORCH")
    assert response.status_code == 200
    agent = response.json()
    assert agent["agent_id"] == "ECHO-ORCH"
    assert agent["name"] == "ECHO Orchestrator Agent"
    assert agent["version"] == "0.1.0"
    assert "workflow_orchestration" in agent["capabilities"]


def test_get_nonexistent_agent():
    response = client.get("/agents/ECHO-NON-EXISTENT")
    assert response.status_code == 404


def test_create_and_get_investigation():
    payload = {
        "request_type": "PROPERTY_ANALYSIS",
        "workflow": "PROPERTY_DISCOVERY",
        "options": {
            "raw_content": (
                "Project: Brigade Cornerstone. Developer: Brigade Group. "
                "Location: Whitefield, Bengaluru. Pincode: 560066. "
                "Price: 1.10 Cr. Specs: 2 BHK, 1200 sq ft."
            )
        },
    }
    response = client.post("/investigations", json=payload)
    assert response.status_code == 201
    res_data = response.json()
    assert "run_id" in res_data
    run_id = res_data["run_id"]
    assert res_data["status"] in ("COMPLETED", "PARTIAL_SUCCESS")

    # Retrieve status by run_id
    get_res = client.get(f"/investigations/{run_id}")
    assert get_res.status_code == 200
    fetched_data = get_res.json()
    assert fetched_data["run_id"] == run_id


def test_get_nonexistent_investigation():
    response = client.get("/investigations/non_existent_run_id")
    assert response.status_code == 404
