"""Tests for ECHO Pydantic Schemas and Utilities."""

import pytest
from pydantic import ValidationError

from backend.app.schemas.agent import AgentExecutionStatus, AgentRequest, AgentResult
from backend.app.schemas.investigation import InvestigationRequest, WorkflowType
from backend.app.schemas.property import PropertyCandidate, PropertyRecord
from backend.app.schemas.signal import Signal, SignalSeverity, SignalStatus, SignalType
from backend.app.schemas.source import CollectionStatus, SourceRecord, SourceType
from backend.app.utils.ids import generate_entity_id, generate_run_id, generate_signal_id


def test_agent_result_schema_valid():
    res = AgentResult(
        success=True,
        status=AgentExecutionStatus.SUCCESS,
        agent_id="ECHO-TEST",
        agent_version="0.1.0",
        run_id="run_123",
        data={"key": "val"},
        confidence=0.95,
    )
    assert res.success is True
    assert res.status == AgentExecutionStatus.SUCCESS


def test_agent_result_schema_invalid():
    # Missing required field `success`
    with pytest.raises(ValidationError):
        AgentResult(
            status=AgentExecutionStatus.SUCCESS,
            agent_id="ECHO-TEST",
            run_id="run_123",
        )


def test_signal_schema_valid():
    sig = Signal(
        signal_id="sig_test_123",
        signal_type=SignalType.PRICE_DROP,
        entity_id="ent_test_456",
        severity=SignalSeverity.HIGH,
        importance=8.5,
        description="Price drop observed",
        status=SignalStatus.ACTIVE,
    )
    assert sig.signal_type == SignalType.PRICE_DROP
    assert sig.importance == 8.5


def test_signal_importance_bounds():
    # Importance must be between 0.0 and 10.0
    with pytest.raises(ValidationError):
        Signal(
            signal_id="sig_bad",
            signal_type=SignalType.PRICE_DROP,
            entity_id="ent_1",
            importance=15.0,  # exceeds max 10.0
            description="Invalid",
        )


def test_deterministic_ids():
    run_1 = generate_run_id("test")
    run_2 = generate_run_id("test")
    assert run_1 != run_2

    # Deterministic signal ID: same input gives same ID
    sig_a = generate_signal_id("PRICE_DROP", "ent_01", "100_90")
    sig_b = generate_signal_id("PRICE_DROP", "ent_01", "100_90")
    assert sig_a == sig_b

    # Deterministic entity ID
    ent_a = generate_entity_id("Prestige Falcon", "Whitefield")
    ent_b = generate_entity_id("Prestige Falcon", "Whitefield")
    assert ent_a == ent_b
