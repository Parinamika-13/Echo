"""Tests for Agent 11: SSR — Structured Signal Record / Audit Writeback Agent."""

import pytest
from backend.app.agents.base_agent import BaseAgent
from backend.app.agents.registry import registry
from backend.app.agents.ssr_agent import SsrAgent
from backend.app.schemas.agent import AgentExecutionStatus, AgentRequest, AgentResult


def test_ssr_contract():
    agent = SsrAgent()
    assert isinstance(agent, BaseAgent)
    assert agent.agent_id == "ECHO-SSR"
    assert agent.version == "0.1.0"
    assert "ECHO-SSR" in registry.list_agent_ids()


import uuid


def test_ssr_persistence_and_version_tracking():
    agent = SsrAgent()
    prop_id = f"ent_ssr_test_{uuid.uuid4().hex[:8]}"
    property_data = {
        "property_id": prop_id,
        "canonical_name": "Sobha Dream Acres",
        "identity": {"developer": "Sobha"},
        "location": {"city": "Bengaluru", "locality": "Panathur"},
        "financials": {"price": 9500000.0, "price_per_sqft": 7916.0},
        "specs": {"area": 1200.0, "bedrooms": 2.0},
    }

    try:
        # First writeback
        req1 = AgentRequest(
            run_id="run_ssr_01",
            agent_id="ECHO-SSR",
            parameters={"canonical_properties": [property_data]},
        )
        res1 = agent.execute(req1)
        assert res1.success is True
        assert res1.status == AgentExecutionStatus.SUCCESS
        assert res1.data["persisted_counts"]["properties"] == 1
        assert len(res1.data["audit_records"]) == 1

        # Second writeback with price change: should record HistoricalChangeRecord
        property_data_updated = dict(property_data)
        property_data_updated["financials"] = {"price": 9800000.0, "price_per_sqft": 8166.0}

        req2 = AgentRequest(
            run_id="run_ssr_02",
            agent_id="ECHO-SSR",
            parameters={"canonical_properties": [property_data_updated]},
        )
        res2 = agent.execute(req2)
        assert res2.success is True
        assert len(res2.data["change_records"]) == 1
        chg = res2.data["change_records"][0]
        assert chg["old_value"] == 9500000.0
        assert chg["new_value"] == 9800000.0
        assert chg["field_name"] == "price"
    finally:
        from backend.app.database.connection import SessionLocal
        from backend.app.database.models import PropertyModel, AuditRecordModel
        db = SessionLocal()
        try:
            db.query(AuditRecordModel).filter_by(entity_id=prop_id).delete()
            db.query(PropertyModel).filter_by(property_id=prop_id).delete()
            db.commit()
        finally:
            db.close()
