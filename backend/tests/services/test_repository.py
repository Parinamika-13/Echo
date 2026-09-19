"""Unit tests for EchoRepository data access layer."""

import pytest
from backend.app.services.repository import echo_repository


def test_repository_property_crud():
    """Verify property upsert, retrieval, and listing."""
    prop_data = {
        "property_id": "TEST-PROP-001",
        "canonical_name": "Test Real Estate Holding",
        "entity_type": "REAL_ESTATE",
        "sector": "Commercial Real Estate",
        "region": "Maharashtra",
        "property_type": "Commercial",
        "developer": "Test Builders",
        "city": "Mumbai",
        "price": 50000000.0,
        "confidence": 0.95,
        "attributes": {"test_flag": True},
    }

    try:
        created = echo_repository.upsert_property(prop_data)
        assert created.property_id == "TEST-PROP-001"
        assert created.canonical_name == "Test Real Estate Holding"
        assert created.sector == "Commercial Real Estate"
        assert created.region == "Maharashtra"

        fetched = echo_repository.get_property("TEST-PROP-001")
        assert fetched is not None
        assert fetched.city == "Mumbai"
        assert fetched.sector == "Commercial Real Estate"
        assert fetched.region == "Maharashtra"
        assert fetched.attributes.get("test_flag") is True

        # Count & filter by sector and region
        count = echo_repository.count_properties(sector="Commercial")
        assert count >= 1
        region_count = echo_repository.count_properties(region="Maharashtra")
        assert region_count >= 1
    finally:
        from backend.app.database.connection import SessionLocal
        from backend.app.database.models import PropertyModel
        db = SessionLocal()
        try:
            db.query(PropertyModel).filter_by(property_id="TEST-PROP-001").delete()
            db.commit()
        finally:
            db.close()


def test_repository_signals_and_investigation_crud():
    """Verify signals and investigation CRUD operations."""
    prop_data = {
        "property_id": "TEST-PROP-002",
        "canonical_name": "Test Real Estate Holding 2",
        "entity_type": "REAL_ESTATE",
    }
    sig_data = {
        "signal_id": "TEST-SIG-001",
        "signal_type": "Contradiction",
        "entity_id": "TEST-PROP-002",
        "severity": "HIGH",
        "importance": 8.0,
        "description": "Contradiction in reported emissions",
        "confidence": 0.88,
    }
    inv_data = {
        "investigation_id": "TEST-INV-001",
        "entity_id": "TEST-PROP-002",
        "topic": "Emissions Discrepancy",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
    }

    try:
        echo_repository.upsert_property(prop_data)
        sig = echo_repository.upsert_signal(sig_data)
        assert sig.signal_id == "TEST-SIG-001"

        signals = echo_repository.list_signals(entity_id="TEST-PROP-002")
        assert any(s.signal_id == "TEST-SIG-001" for s in signals)

        inv = echo_repository.upsert_investigation(inv_data)
        assert inv.investigation_id == "TEST-INV-001"

        fetched_inv = echo_repository.get_investigation("TEST-INV-001")
        assert fetched_inv is not None
        assert fetched_inv.status == "IN_PROGRESS"
    finally:
        from backend.app.database.connection import SessionLocal
        from backend.app.database.models import PropertyModel, SignalModel, InvestigationModel
        db = SessionLocal()
        try:
            db.query(SignalModel).filter_by(signal_id="TEST-SIG-001").delete()
            db.query(InvestigationModel).filter_by(investigation_id="TEST-INV-001").delete()
            db.query(PropertyModel).filter_by(property_id="TEST-PROP-002").delete()
            db.commit()
        finally:
            db.close()
