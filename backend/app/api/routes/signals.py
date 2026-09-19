"""ECHO Signals Query Endpoints."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Query

from backend.app.services.repository import echo_repository

router = APIRouter(prefix="/signals")


@router.get("")
async def list_signals(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    entity_id: Optional[str] = Query(default=None, description="Filter by entity / property_id"),
    signal_type: Optional[str] = Query(default=None, description="Filter by signal type (Silence, Gap, Contradiction)"),
) -> Dict[str, Any]:
    """Retrieve paginated signals catalog."""
    total = echo_repository.count_signals(entity_id=entity_id, signal_type=signal_type)
    records = echo_repository.list_signals(
        entity_id=entity_id,
        signal_type=signal_type,
        limit=limit,
        offset=offset,
    )

    items = []
    for s in records:
        items.append({
            "signal_id": s.signal_id,
            "signal_type": s.signal_type,
            "entity_id": s.entity_id,
            "severity": s.severity,
            "importance": s.importance,
            "description": s.description,
            "source_reference": s.source_reference,
            "evidence_reference": s.evidence_reference,
            "confidence": s.confidence,
            "status": s.status,
            "timestamp": s.timestamp.isoformat() if s.timestamp else None,
            "metadata": s.metadata_payload,
        })

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": items,
    }
