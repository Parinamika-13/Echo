"""API integration tests for datasets, properties, and signals routes."""

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_api_inspect_dataset():
    """Verify GET /api/v1/datasets/inspect returns sheet metadata."""
    resp = client.get("/api/v1/datasets/inspect")
    assert resp.status_code == 200
    data = resp.json()
    assert "sheets" in data
    assert "Core_Data" in data["sheets"]


def test_api_ingest_subset():
    """Verify POST /api/v1/datasets/ingest ingests records."""
    resp = client.post("/api/v1/datasets/ingest", json={"limit": 5})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert data["inserted_properties"] == 5


def test_api_list_and_get_properties():
    """Verify GET /api/v1/properties and GET /api/v1/properties/{property_id}."""
    resp = client.get("/api/v1/properties?limit=10")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert data["total"] >= 5

    # Get single property
    single_resp = client.get("/api/v1/properties/ECHO-0001")
    assert single_resp.status_code == 200
    prop = single_resp.json()
    assert prop["property_id"] == "ECHO-0001"
    assert prop["canonical_name"] == "ECHO Company A"


def test_api_list_signals():
    """Verify GET /api/v1/signals."""
    resp = client.get("/api/v1/signals?entity_id=ECHO-0001")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert len(data["items"]) >= 1
    assert data["items"][0]["entity_id"] == "ECHO-0001"


def test_api_get_risk_and_analysis():
    """Verify GET /api/v1/risk-assessments/{property_id} and analyses."""
    risk_resp = client.get("/api/v1/risk-assessments/ECHO-0001")
    assert risk_resp.status_code == 200
    risk = risk_resp.json()
    assert risk["entity_id"] == "ECHO-0001"
    assert "overall_rating" in risk

    ana_resp = client.get("/api/v1/analyses/ECHO-0001")
    assert ana_resp.status_code == 200
    ana = ana_resp.json()
    assert ana["entity_id"] == "ECHO-0001"
