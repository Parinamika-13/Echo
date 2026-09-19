"""ECHO Properties and Entities Query Endpoints."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from backend.app.services.repository import echo_repository

router = APIRouter()


class PropertySummary(BaseModel):
    property_id: str
    canonical_name: str
    entity_type: str = "CORPORATE"
    company: Optional[str] = None
    sector: Optional[str] = None
    region: Optional[str] = None
    property_type: Optional[str] = None
    developer: Optional[str] = None
    city: Optional[str] = None
    locality: Optional[str] = None
    price: Optional[float] = None
    confidence: Optional[float] = None
    version: int = 1
    attributes: Dict[str, Any] = {}
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


@router.get("/properties")
async def list_properties(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    sector: Optional[str] = Query(default=None, description="Filter by corporate sector"),
    region: Optional[str] = Query(default=None, description="Filter by geographic region"),
    entity_type: Optional[str] = Query(default=None, description="Filter by entity type (CORPORATE or REAL_ESTATE)"),
) -> Dict[str, Any]:
    """Retrieve paginated canonical investigated entities / properties."""
    total = echo_repository.count_properties(sector=sector, region=region, entity_type=entity_type)
    records = echo_repository.list_properties(
        limit=limit,
        offset=offset,
        sector=sector,
        region=region,
        entity_type=entity_type,
    )

    items = []
    for r in records:
        items.append({
            "property_id": r.property_id,
            "canonical_name": r.canonical_name,
            "entity_type": r.entity_type,
            "company": r.company,
            "sector": r.sector,
            "region": r.region,
            "property_type": r.property_type,
            "developer": r.developer,
            "city": r.city,
            "locality": r.locality,
            "price": r.price,
            "confidence": r.confidence,
            "version": r.version,
            "attributes": r.attributes,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        })

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": items,
    }


@router.get("/properties/{property_id}")
async def get_property(property_id: str) -> Dict[str, Any]:
    """Retrieve single canonical investigated entity by ID."""
    prop = echo_repository.get_property(property_id=property_id)
    if not prop:
        raise HTTPException(status_code=404, detail=f"Property / Entity '{property_id}' not found")

    return {
        "property_id": prop.property_id,
        "canonical_name": prop.canonical_name,
        "entity_type": prop.entity_type,
        "company": prop.company,
        "sector": prop.sector,
        "region": prop.region,
        "property_type": prop.property_type,
        "developer": prop.developer,
        "city": prop.city,
        "locality": prop.locality,
        "price": prop.price,
        "confidence": prop.confidence,
        "version": prop.version,
        "attributes": prop.attributes,
        "created_at": prop.created_at.isoformat() if prop.created_at else None,
        "updated_at": prop.updated_at.isoformat() if prop.updated_at else None,
    }



@router.get("/properties/{property_id}/audit-trail")
async def get_property_audit_trail(property_id: str) -> List[Dict[str, Any]]:
    """Retrieve immutable audit records for a property/entity."""
    records = echo_repository.list_audit_records(entity_id=property_id)
    return [
        {
            "record_id": r.record_id,
            "entity_id": r.entity_id,
            "record_version": r.record_version,
            "payload_type": r.payload_type,
            "agent_id": r.agent_id,
            "run_id": r.run_id,
            "confidence": r.confidence,
            "payload": r.payload,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in records
    ]


@router.get("/risk-assessments/{property_id}")
async def get_risk_assessment(property_id: str) -> Dict[str, Any]:
    """Retrieve latest risk assessment for an entity."""
    risk = echo_repository.get_risk_assessment(entity_id=property_id)
    if not risk:
        raise HTTPException(status_code=404, detail=f"Risk assessment for '{property_id}' not found")

    return {
        "assessment_id": risk.assessment_id,
        "entity_id": risk.entity_id,
        "overall_rating": risk.overall_rating,
        "overall_confidence": risk.overall_confidence,
        "status": risk.status,
        "factors_payload": risk.factors_payload,
        "primary_concerns": risk.primary_concerns,
        "created_at": risk.created_at.isoformat() if risk.created_at else None,
    }


@router.get("/analyses/{property_id}")
async def get_analysis(property_id: str) -> Dict[str, Any]:
    """Retrieve latest financial/real estate analysis for an entity."""
    analysis = echo_repository.get_analysis(entity_id=property_id)
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Analysis for '{property_id}' not found")

    return {
        "analysis_id": analysis.analysis_id,
        "entity_id": analysis.entity_id,
        "status": analysis.status,
        "confidence": analysis.confidence,
        "metrics_payload": analysis.metrics_payload,
        "created_at": analysis.created_at.isoformat() if analysis.created_at else None,
    }
