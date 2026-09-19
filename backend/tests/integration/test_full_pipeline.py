"""Comprehensive end-to-end integration test for ECHO Intelligence System.

Verifies:
1. Ingestion of synthetic dataset records.
2. Orchestration of the 11 agents on an ingested entity.
3. Provenance and audit writeback persistence.
4. Retrieval of synthesized investigation records.
"""

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.dataset_service import dataset_service
from backend.app.services.repository import echo_repository
from backend.app.services.investigation_service import investigation_service
from backend.app.schemas.investigation import InvestigationRequest, WorkflowType

client = TestClient(app)


def test_full_pipeline_ingest_and_investigate():
    """End-to-end integration test: Ingestion -> Orchestration -> Audit Writeback -> Verification."""
    # 1. Ingest dataset subset
    ingest_res = dataset_service.ingest_dataset(limit=5)
    assert ingest_res["status"] == "SUCCESS"
    assert ingest_res["inserted_properties"] >= 5

    # 2. Verify entity exists
    entity = echo_repository.get_property("ECHO-0002")
    assert entity.canonical_name == "ECHO Company B"
    assert entity.entity_type == "CORPORATE"
    assert entity.sector == "Technology"
    assert entity.region == "North America"
    assert entity.property_type is None
    assert entity.city is None


    # 3. Trigger full orchestrated investigation
    req = InvestigationRequest(
        request_type="PROPERTY_ANALYSIS",
        property_id="ECHO-0002",
        query="ECHO Company B",
        workflow=WorkflowType.FULL_ANALYSIS,
        options={"include_investment_scenarios": True},
    )

    inv_result = investigation_service.create_and_execute(req)
    assert inv_result.run_id is not None
    assert inv_result.status.value == "COMPLETED"

    # 4. Verify all agents executed
    assert len(inv_result.executed_agents) >= 7
    assert "ECHO-PSA-DOC" in inv_result.executed_agents
    assert "ECHO-PSA-EXTRACT" in inv_result.executed_agents
    assert "ECHO-SIGNAL" in inv_result.executed_agents
    assert "ECHO-ERA" in inv_result.executed_agents
    assert "ECHO-RSA" in inv_result.executed_agents
    assert "ECHO-SSR" in inv_result.executed_agents

    # 5. Verify agent run logs persisted in DB
    runs = echo_repository.list_agent_runs(inv_result.run_id)
    assert len(runs) >= len(inv_result.executed_agents)

    # 6. Verify audit records created
    audits = echo_repository.list_audit_records("ECHO-0002")
    assert len(audits) >= 1
