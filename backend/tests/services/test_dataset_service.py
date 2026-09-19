"""Unit tests for Dataset Ingestion Service."""

import pytest
from backend.app.services.dataset_service import dataset_service
from backend.app.services.repository import echo_repository


def test_inspect_dataset_metadata():
    """Verify that dataset inspection correctly reads the sheets without errors."""
    metadata = dataset_service.inspect_dataset()
    assert "sheets" in metadata
    assert "Core_Data" in metadata["sheets"]
    assert "Enrichment_Data" in metadata["sheets"]
    assert "Parameter_Dictionary" in metadata["sheets"]
    assert "README" in metadata["sheets"]

    core_summary = metadata["summaries"]["Core_Data"]
    assert core_summary["rows"] == 550
    assert core_summary["columns"] == 20
    assert core_summary["missing_values"] == 0


def test_ingest_subset_and_semantic_fidelity():
    """Verify that ingesting records stores truthful semantics without fabricating real estate fields."""
    result = dataset_service.ingest_dataset(limit=3)
    assert result["status"] == "SUCCESS"
    assert result["total_rows_processed"] == 3
    assert result["inserted_properties"] == 3
    assert len(result["errors"]) == 0

    # Verify corporate entity semantics for ECHO-0001
    prop = echo_repository.get_property("ECHO-0001")
    assert prop is not None
    assert prop.canonical_name == "ECHO Company A"
    assert prop.entity_type == "CORPORATE"
    assert prop.company == "ECHO Company A"
    assert prop.sector == "Banking"
    assert prop.region == "India"
    assert prop.confidence == 0.74

    # Crucial semantic invariant: physical real-estate fields are NOT fabricated
    assert prop.property_type is None
    assert prop.city is None
    assert prop.developer is None
    assert prop.locality is None
    assert prop.price is None
    assert prop.price_per_sqft is None
    assert prop.area is None
    assert prop.bedrooms is None

    # Complete 31-field original source row must be preserved in attributes JSONB
    attrs = prop.attributes
    assert len(attrs) == 31
    expected_fields = [
        "Listing_ID", "Company", "Sector", "Region", "Document_Type",
        "Reporting_Year", "Topic", "Signal_Type", "Financial_Relevance",
        "Status", "Document_Page_Count", "Disclosure_Change_Magnitude",
        "Previous_Quantitative", "Current_Quantitative", "Contradiction_Type",
        "Source_Tier", "Evidence_Count", "Confidence", "Exposure_Probability",
        "Exposure_Value_USD_M", "Enrichment_Listing_ID", "Exposure_Channel",
        "Previous_Disclosure_Present", "Current_Disclosure_Present",
        "Evidence_Available", "Evidence_Strength", "Potential_Exposure_Value_USD_M",
        "Reference_Metric_USD_M", "Materiality_Result", "Temporal_Association",
        "Investigation_Priority",
    ]
    for field in expected_fields:
        assert field in attrs, f"Field '{field}' missing from attributes JSONB"

    assert attrs["Sector"] == "Banking"
    assert attrs["Region"] == "India"
    assert attrs["Exposure_Value_USD_M"] == 22.21


def test_ingestion_idempotency():
    """Verify that multiple ingestion runs do not create duplicate records."""
    re_result = dataset_service.ingest_dataset(limit=3)
    assert re_result["status"] == "SUCCESS"
    assert re_result["total_rows_processed"] == 3

    prop_after = echo_repository.get_property("ECHO-0001")
    assert prop_after.canonical_name == "ECHO Company A"
    assert prop_after.sector == "Banking"
    assert prop_after.region == "India"
