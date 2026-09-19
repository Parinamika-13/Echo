"""ECHO Provenance and Lineage Service."""

from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from backend.app.database.connection import SessionLocal
from backend.app.database.models import (
    AuditRecordModel,
    EvidenceModel,
    PropertyModel,
    SignalModel,
    SourceModel,
)


class ProvenanceService:
    """Service dedicated to interrogating and verifying data lineage across ECHO intelligence pipeline."""

    def trace_entity_lineage(self, entity_id: str) -> Dict[str, Any]:
        """Trace full evidentiary provenance: Source -> Document -> Entity -> Signal -> Audit."""
        db: Session = SessionLocal()
        try:
            property_record = db.query(PropertyModel).filter_by(property_id=entity_id).first()
            audit_records = db.query(AuditRecordModel).filter_by(entity_id=entity_id).all()
            signals = db.query(SignalModel).filter_by(entity_id=entity_id).all()

            lineage = {
                "entity_id": entity_id,
                "canonical_name": property_record.canonical_name if property_record else None,
                "version": property_record.version if property_record else None,
                "created_at": property_record.created_at.isoformat() if property_record and property_record.created_at else None,
                "audit_history": [
                    {
                        "record_id": a.record_id,
                        "record_version": a.record_version,
                        "payload_type": a.payload_type,
                        "agent_id": a.agent_id,
                        "agent_version": a.agent_version,
                        "run_id": a.run_id,
                        "timestamp": a.created_at.isoformat() if a.created_at else None,
                    }
                    for a in audit_records
                ],
                "signals": [
                    {
                        "signal_id": s.signal_id,
                        "signal_type": s.signal_type,
                        "severity": s.severity,
                        "description": s.description,
                        "timestamp": s.timestamp.isoformat() if s.timestamp else None,
                    }
                    for s in signals
                ],
            }
            return lineage
        finally:
            db.close()


provenance_service = ProvenanceService()
