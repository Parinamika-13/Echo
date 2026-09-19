"""ECHO Data Access & Repository Layer.

Isolates all agent and service logic from direct SQL/ORM engine operations,
providing clean, testable CRUD operations across both SQLite and PostgreSQL backends.
"""

from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.database.connection import SessionLocal
from backend.app.database.models import (
    AgentRunModel,
    AnalysisModel,
    AuditRecordModel,
    DocumentModel,
    EvidenceModel,
    InvestigationModel,
    InvestmentScenarioModel,
    PropertyModel,
    RiskAssessmentModel,
    SignalModel,
    SourceModel,
    utc_now,
)


class EchoRepository:
    """Consolidated repository managing persistence for all ECHO entities."""

    def __init__(self, session_factory=None):
        self.session_factory = session_factory or SessionLocal

    def _get_session(self, session: Optional[Session] = None) -> Session:
        return session if session is not None else self.session_factory()

    # -------------------------------------------------------------------------
    # Properties / Listings
    # -------------------------------------------------------------------------
    def upsert_property(
        self,
        prop_data: Dict[str, Any],
        session: Optional[Session] = None,
    ) -> PropertyModel:
        """Create or update a canonical property/listing record."""
        should_close = session is None
        db = self._get_session(session)
        try:
            prop_id = prop_data.get("property_id")
            existing = db.query(PropertyModel).filter_by(property_id=prop_id).first() if prop_id else None

            if existing:
                for key, val in prop_data.items():
                    if hasattr(existing, key) and key not in ("property_id", "created_at"):
                        setattr(existing, key, val)
                existing.updated_at = utc_now()
                target = existing
            else:
                target = PropertyModel(
                    property_id=prop_data.get("property_id"),
                    canonical_name=prop_data.get("canonical_name", "Unknown Entity"),
                    entity_type=prop_data.get("entity_type", "CORPORATE"),
                    company=prop_data.get("company") or prop_data.get("canonical_name"),
                    sector=prop_data.get("sector"),
                    region=prop_data.get("region"),
                    property_type=prop_data.get("property_type"),
                    developer=prop_data.get("developer"),
                    city=prop_data.get("city"),
                    locality=prop_data.get("locality"),
                    price=prop_data.get("price"),
                    price_per_sqft=prop_data.get("price_per_sqft"),
                    area=prop_data.get("area"),
                    bedrooms=prop_data.get("bedrooms"),
                    version=prop_data.get("version", 1),
                    confidence=prop_data.get("confidence"),
                    attributes=prop_data.get("attributes", {}),
                )
                db.add(target)

            db.commit()
            db.refresh(target)
            return target
        except Exception:
            db.rollback()
            raise
        finally:
            if should_close:
                db.close()

    def get_property(
        self,
        property_id: str,
        session: Optional[Session] = None,
    ) -> Optional[PropertyModel]:
        """Fetch single property by canonical ID."""
        should_close = session is None
        db = self._get_session(session)
        try:
            return db.query(PropertyModel).filter_by(property_id=property_id).first()
        finally:
            if should_close:
                db.close()

    def list_properties(
        self,
        limit: int = 50,
        offset: int = 0,
        sector: Optional[str] = None,
        region: Optional[str] = None,
        entity_type: Optional[str] = None,
        session: Optional[Session] = None,
    ) -> List[PropertyModel]:
        """Query properties/entities with sector, region, or entity_type filtering."""
        should_close = session is None
        db = self._get_session(session)
        try:
            q = db.query(PropertyModel)
            if entity_type:
                q = q.filter(PropertyModel.entity_type == entity_type)
            if sector:
                q = q.filter(PropertyModel.sector.ilike(f"%{sector}%"))
            if region:
                q = q.filter(PropertyModel.region.ilike(f"%{region}%"))
            return q.order_by(PropertyModel.property_id.asc()).offset(offset).limit(limit).all()
        finally:
            if should_close:
                db.close()

    def count_properties(
        self,
        sector: Optional[str] = None,
        region: Optional[str] = None,
        entity_type: Optional[str] = None,
        session: Optional[Session] = None,
    ) -> int:
        """Count total matching property/entity records."""
        should_close = session is None
        db = self._get_session(session)
        try:
            q = db.query(func.count(PropertyModel.property_id))
            if entity_type:
                q = q.filter(PropertyModel.entity_type == entity_type)
            if sector:
                q = q.filter(PropertyModel.sector.ilike(f"%{sector}%"))
            if region:
                q = q.filter(PropertyModel.region.ilike(f"%{region}%"))
            return q.scalar() or 0

        finally:
            if should_close:
                db.close()

    # -------------------------------------------------------------------------
    # Sources, Documents & Evidence
    # -------------------------------------------------------------------------
    def upsert_source(
        self,
        source_data: Dict[str, Any],
        session: Optional[Session] = None,
    ) -> SourceModel:
        """Persist disclosure/data source registry item."""
        should_close = session is None
        db = self._get_session(session)
        try:
            src_id = source_data.get("source_id")
            existing = db.query(SourceModel).filter_by(source_id=src_id).first() if src_id else None

            if existing:
                for key, val in source_data.items():
                    if hasattr(existing, key) and key not in ("source_id", "retrieved_at"):
                        setattr(existing, key, val)
                target = existing
            else:
                target = SourceModel(
                    source_id=src_id,
                    source_name=source_data.get("source_name", "Unknown Source"),
                    source_type=source_data.get("source_type", "WEB"),
                    source_url=source_data.get("source_url"),
                    content_type=source_data.get("content_type", "text/html"),
                    raw_reference=source_data.get("raw_reference"),
                    collection_status=source_data.get("collection_status", "SUCCESS"),
                    metadata_payload=source_data.get("metadata_payload") or source_data.get("metadata", {}),
                )
                db.add(target)

            db.commit()
            db.refresh(target)
            return target
        except Exception:
            db.rollback()
            raise
        finally:
            if should_close:
                db.close()

    def upsert_document(
        self,
        doc_data: Dict[str, Any],
        session: Optional[Session] = None,
    ) -> DocumentModel:
        """Persist processed document unit."""
        should_close = session is None
        db = self._get_session(session)
        try:
            doc_id = doc_data.get("document_id")
            existing = db.query(DocumentModel).filter_by(document_id=doc_id).first() if doc_id else None

            if existing:
                for key, val in doc_data.items():
                    if hasattr(existing, key) and key not in ("document_id", "created_at"):
                        setattr(existing, key, val)
                target = existing
            else:
                target = DocumentModel(
                    document_id=doc_id,
                    source_id=doc_data.get("source_id", "UNKNOWN"),
                    source_url=doc_data.get("source_url"),
                    format=doc_data.get("format", "HTML"),
                    title=doc_data.get("title"),
                    text_content=doc_data.get("text_content"),
                    language=doc_data.get("language", "en"),
                    metadata_payload=doc_data.get("metadata_payload") or doc_data.get("metadata", {}),
                )
                db.add(target)

            db.commit()
            db.refresh(target)
            return target
        except Exception:
            db.rollback()
            raise
        finally:
            if should_close:
                db.close()

    def upsert_evidence(
        self,
        evd_data: Dict[str, Any],
        session: Optional[Session] = None,
    ) -> EvidenceModel:
        """Persist atomic evidence record."""
        should_close = session is None
        db = self._get_session(session)
        try:
            evd_id = evd_data.get("evidence_id")
            existing = db.query(EvidenceModel).filter_by(evidence_id=evd_id).first() if evd_id else None

            if existing:
                for key, val in evd_data.items():
                    if hasattr(existing, key) and key not in ("evidence_id", "retrieved_at"):
                        setattr(existing, key, val)
                target = existing
            else:
                target = EvidenceModel(
                    evidence_id=evd_id,
                    source_id=evd_data.get("source_id", "UNKNOWN"),
                    document_id=evd_data.get("document_id"),
                    chunk_id=evd_data.get("chunk_id"),
                    source_url=evd_data.get("source_url"),
                    field_name=evd_data.get("field_name"),
                    extracted_value=evd_data.get("extracted_value"),
                    context_snippet=evd_data.get("context_snippet"),
                    confidence=evd_data.get("confidence"),
                    metadata_payload=evd_data.get("metadata_payload") or evd_data.get("metadata", {}),
                )
                db.add(target)

            db.commit()
            db.refresh(target)
            return target
        except Exception:
            db.rollback()
            raise
        finally:
            if should_close:
                db.close()

    # -------------------------------------------------------------------------
    # Signals
    # -------------------------------------------------------------------------
    def upsert_signal(
        self,
        sig_data: Dict[str, Any],
        session: Optional[Session] = None,
    ) -> SignalModel:
        """Persist minted signal item."""
        should_close = session is None
        db = self._get_session(session)
        try:
            sig_id = sig_data.get("signal_id")
            existing = db.query(SignalModel).filter_by(signal_id=sig_id).first() if sig_id else None

            if existing:
                for key, val in sig_data.items():
                    if hasattr(existing, key) and key not in ("signal_id", "timestamp"):
                        setattr(existing, key, val)
                target = existing
            else:
                target = SignalModel(
                    signal_id=sig_id,
                    signal_type=sig_data.get("signal_type", "GENERIC"),
                    entity_id=sig_data.get("entity_id") or sig_data.get("property_id", "UNKNOWN"),
                    severity=sig_data.get("severity", "MEDIUM"),
                    importance=sig_data.get("importance", 5.0),
                    description=sig_data.get("description", "Discovered signal"),
                    source_reference=sig_data.get("source_reference"),
                    evidence_reference=sig_data.get("evidence_reference"),
                    confidence=sig_data.get("confidence"),
                    status=sig_data.get("status", "ACTIVE"),
                    metadata_payload=sig_data.get("metadata_payload") or sig_data.get("metadata", {}),
                )
                db.add(target)

            db.commit()
            db.refresh(target)
            return target
        except Exception:
            db.rollback()
            raise
        finally:
            if should_close:
                db.close()

    def list_signals(
        self,
        entity_id: Optional[str] = None,
        signal_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
        session: Optional[Session] = None,
    ) -> List[SignalModel]:
        """Query signals with entity and type filtering."""
        should_close = session is None
        db = self._get_session(session)
        try:
            q = db.query(SignalModel)
            if entity_id:
                q = q.filter(SignalModel.entity_id == entity_id)
            if signal_type:
                q = q.filter(SignalModel.signal_type.ilike(f"%{signal_type}%"))
            return q.order_by(SignalModel.timestamp.desc()).offset(offset).limit(limit).all()
        finally:
            if should_close:
                db.close()

    def count_signals(
        self,
        entity_id: Optional[str] = None,
        signal_type: Optional[str] = None,
        session: Optional[Session] = None,
    ) -> int:
        """Count total matching signal records."""
        should_close = session is None
        db = self._get_session(session)
        try:
            q = db.query(func.count(SignalModel.signal_id))
            if entity_id:
                q = q.filter(SignalModel.entity_id == entity_id)
            if signal_type:
                q = q.filter(SignalModel.signal_type.ilike(f"%{signal_type}%"))
            return q.scalar() or 0
        finally:
            if should_close:
                db.close()

    # -------------------------------------------------------------------------
    # Analyses, Investments, Risk Profiles
    # -------------------------------------------------------------------------
    def upsert_analysis(
        self,
        analysis_data: Dict[str, Any],
        session: Optional[Session] = None,
    ) -> AnalysisModel:
        """Persist financial & real estate analysis record."""
        should_close = session is None
        db = self._get_session(session)
        try:
            ana_id = analysis_data.get("analysis_id")
            existing = db.query(AnalysisModel).filter_by(analysis_id=ana_id).first() if ana_id else None

            if existing:
                for key, val in analysis_data.items():
                    if hasattr(existing, key) and key not in ("analysis_id", "created_at"):
                        setattr(existing, key, val)
                target = existing
            else:
                target = AnalysisModel(
                    analysis_id=ana_id,
                    entity_id=analysis_data.get("entity_id") or analysis_data.get("property_id", "UNKNOWN"),
                    status=analysis_data.get("status", "COMPLETED"),
                    confidence=analysis_data.get("confidence"),
                    metrics_payload=analysis_data.get("metrics_payload") or analysis_data.get("metrics", {}),
                )
                db.add(target)

            db.commit()
            db.refresh(target)
            return target
        except Exception:
            db.rollback()
            raise
        finally:
            if should_close:
                db.close()

    def get_analysis(
        self,
        entity_id: str,
        session: Optional[Session] = None,
    ) -> Optional[AnalysisModel]:
        """Fetch latest analysis for entity."""
        should_close = session is None
        db = self._get_session(session)
        try:
            return db.query(AnalysisModel).filter_by(entity_id=entity_id).order_by(AnalysisModel.created_at.desc()).first()
        finally:
            if should_close:
                db.close()

    def upsert_risk_assessment(
        self,
        risk_data: Dict[str, Any],
        session: Optional[Session] = None,
    ) -> RiskAssessmentModel:
        """Persist risk profile compiled by RSA."""
        should_close = session is None
        db = self._get_session(session)
        try:
            risk_id = risk_data.get("assessment_id")
            existing = db.query(RiskAssessmentModel).filter_by(assessment_id=risk_id).first() if risk_id else None

            if existing:
                for key, val in risk_data.items():
                    if hasattr(existing, key) and key not in ("assessment_id", "created_at"):
                        setattr(existing, key, val)
                target = existing
            else:
                target = RiskAssessmentModel(
                    assessment_id=risk_id,
                    entity_id=risk_data.get("entity_id") or risk_data.get("property_id", "UNKNOWN"),
                    overall_rating=risk_data.get("overall_rating", "NOT_CALCULATED"),
                    overall_confidence=risk_data.get("overall_confidence") or risk_data.get("confidence"),
                    status=risk_data.get("status", "COMPLETED"),
                    factors_payload=risk_data.get("factors_payload") or risk_data.get("risk_factors", []),
                    primary_concerns=risk_data.get("primary_concerns", []),
                )
                db.add(target)

            db.commit()
            db.refresh(target)
            return target
        except Exception:
            db.rollback()
            raise
        finally:
            if should_close:
                db.close()

    def get_risk_assessment(
        self,
        entity_id: str,
        session: Optional[Session] = None,
    ) -> Optional[RiskAssessmentModel]:
        """Fetch latest risk assessment for entity."""
        should_close = session is None
        db = self._get_session(session)
        try:
            return db.query(RiskAssessmentModel).filter_by(entity_id=entity_id).order_by(RiskAssessmentModel.created_at.desc()).first()
        finally:
            if should_close:
                db.close()

    # -------------------------------------------------------------------------
    # Investigations
    # -------------------------------------------------------------------------
    def upsert_investigation(
        self,
        inv_data: Dict[str, Any],
        session: Optional[Session] = None,
    ) -> InvestigationModel:
        """Persist investigation tracking item."""
        should_close = session is None
        db = self._get_session(session)
        try:
            inv_id = inv_data.get("investigation_id")
            existing = db.query(InvestigationModel).filter_by(investigation_id=inv_id).first() if inv_id else None

            if existing:
                for key, val in inv_data.items():
                    if hasattr(existing, key) and key not in ("investigation_id", "created_at"):
                        setattr(existing, key, val)
                existing.updated_at = utc_now()
                target = existing
            else:
                target = InvestigationModel(
                    investigation_id=inv_id,
                    entity_id=inv_data.get("entity_id", "UNKNOWN"),
                    topic=inv_data.get("topic"),
                    status=inv_data.get("status", "NEW"),
                    priority=inv_data.get("priority", "MEDIUM"),
                    materiality=inv_data.get("materiality"),
                    exposure_value_usd_m=inv_data.get("exposure_value_usd_m"),
                    findings_summary=inv_data.get("findings_summary"),
                    metadata_payload=inv_data.get("metadata_payload") or inv_data.get("metadata", {}),
                )
                db.add(target)

            db.commit()
            db.refresh(target)
            return target
        except Exception:
            db.rollback()
            raise
        finally:
            if should_close:
                db.close()

    def get_investigation(
        self,
        investigation_id: str,
        session: Optional[Session] = None,
    ) -> Optional[InvestigationModel]:
        """Fetch single investigation by ID."""
        should_close = session is None
        db = self._get_session(session)
        try:
            return db.query(InvestigationModel).filter_by(investigation_id=investigation_id).first()
        finally:
            if should_close:
                db.close()

    def list_investigations(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
        session: Optional[Session] = None,
    ) -> List[InvestigationModel]:
        """List investigations with optional filters."""
        should_close = session is None
        db = self._get_session(session)
        try:
            q = db.query(InvestigationModel)
            if status:
                q = q.filter(InvestigationModel.status == status)
            if priority:
                q = q.filter(InvestigationModel.priority == priority)
            return q.order_by(InvestigationModel.created_at.desc()).offset(offset).limit(limit).all()
        finally:
            if should_close:
                db.close()

    # -------------------------------------------------------------------------
    # Agent Runs & Audit Records
    # -------------------------------------------------------------------------
    def record_agent_run(
        self,
        run_data: Dict[str, Any],
        session: Optional[Session] = None,
    ) -> AgentRunModel:
        """Record telemetry from an individual agent invocation."""
        should_close = session is None
        db = self._get_session(session)
        try:
            run_entry = AgentRunModel(
                run_id=run_data.get("run_id", "UNKNOWN"),
                agent_id=run_data.get("agent_id", "UNKNOWN"),
                agent_version=run_data.get("agent_version", "0.1.0"),
                status=run_data.get("status", "SUCCESS"),
                duration_ms=run_data.get("duration_ms", 0.0),
                parameters=run_data.get("parameters", {}),
                warnings=run_data.get("warnings", []),
                errors=run_data.get("errors", []),
            )
            db.add(run_entry)
            db.commit()
            db.refresh(run_entry)
            return run_entry
        except Exception:
            db.rollback()
            raise
        finally:
            if should_close:
                db.close()

    def list_agent_runs(
        self,
        run_id: str,
        session: Optional[Session] = None,
    ) -> List[AgentRunModel]:
        """Retrieve execution traces for a given orchestration run ID."""
        should_close = session is None
        db = self._get_session(session)
        try:
            return db.query(AgentRunModel).filter_by(run_id=run_id).order_by(AgentRunModel.id.asc()).all()
        finally:
            if should_close:
                db.close()

    def create_audit_record(
        self,
        audit_data: Dict[str, Any],
        session: Optional[Session] = None,
    ) -> AuditRecordModel:
        """Commit an immutable audit ledger entry."""
        should_close = session is None
        db = self._get_session(session)
        try:
            entry = AuditRecordModel(
                record_id=audit_data.get("record_id"),
                entity_id=audit_data.get("entity_id", "UNKNOWN"),
                record_version=audit_data.get("record_version", 1),
                payload_type=audit_data.get("payload_type", "RECORD"),
                agent_id=audit_data.get("agent_id", "ECHO-SSR"),
                agent_version=audit_data.get("agent_version", "0.1.0"),
                run_id=audit_data.get("run_id", "UNKNOWN"),
                confidence=audit_data.get("confidence"),
                evidence_reference=audit_data.get("evidence_reference"),
                payload=audit_data.get("payload", {}),
            )
            db.add(entry)
            db.commit()
            db.refresh(entry)
            return entry
        except Exception:
            db.rollback()
            raise
        finally:
            if should_close:
                db.close()

    def list_audit_records(
        self,
        entity_id: str,
        session: Optional[Session] = None,
    ) -> List[AuditRecordModel]:
        """List audit ledger trail for an entity."""
        should_close = session is None
        db = self._get_session(session)
        try:
            return db.query(AuditRecordModel).filter_by(entity_id=entity_id).order_by(AuditRecordModel.created_at.desc()).all()
        finally:
            if should_close:
                db.close()


echo_repository = EchoRepository()
