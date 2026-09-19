"""ECHO Agent 11: SSR — Structured Signal Record / Audit Writeback Agent."""

import uuid
from typing import Any, Dict, List, Optional

from backend.app.agents.base_agent import BaseAgent
from backend.app.database.connection import SessionLocal
from backend.app.database.models import (
    AnalysisModel,
    AuditRecordModel,
    EvidenceModel,
    InvestmentScenarioModel,
    PropertyModel,
    RiskAssessmentModel,
    SignalModel,
    SourceModel,
)
from backend.app.schemas.agent import (
    AgentExecutionStatus,
    AgentRequest,
    AgentResult,
)
from backend.app.schemas.audit import (
    AuditEvent,
    AuditRecord,
    HistoricalChangeRecord,
)
from backend.app.utils.ids import generate_audit_id
from backend.app.utils.serialization import to_dict
from backend.app.utils.timestamps import utc_now


class SsrAgent(BaseAgent):
    """Agent 11: Persists validated intelligence, mints audit records, and preserves immutable change lineage."""

    agent_id: str = "ECHO-SSR"
    name: str = "SSR — Structured Signal Record / Audit Writeback Agent"
    version: str = "0.1.0"
    description: str = (
        "Commits finalized intelligence to the audit store and database, ensuring versioned historical "
        "tracking without silent overwrites."
    )
    capabilities: List[str] = [
        "audit_writeback",
        "immutable_change_history",
        "database_persistence",
        "version_control",
        "provenance_archiving",
    ]

    def validate_input(self, request: AgentRequest) -> bool:
        if not super().validate_input(request):
            return False
        # Needs at least some intelligence payload to write back
        has_items = bool(
            request.parameters.get("canonical_properties")
            or request.context.get("canonical_properties")
            or request.parameters.get("property")
            or request.context.get("property")
            or request.parameters.get("signals")
            or request.context.get("signals")
            or request.parameters.get("analyses")
            or request.context.get("analyses")
            or request.parameters.get("risk_assessment")
            or request.context.get("risk_assessment")
            or request.parameters.get("investment_analysis")
            or request.context.get("investment_analysis")
            or request.parameters.get("sources")
            or request.context.get("sources")
        )
        return has_items

    def _run(self, request: AgentRequest) -> AgentResult:
        params = request.parameters
        ctx = request.context

        props: List[Dict[str, Any]] = list(params.get("canonical_properties") or ctx.get("canonical_properties") or [])
        single_prop = params.get("property") or ctx.get("property")
        if single_prop and isinstance(single_prop, dict):
            if not any(p.get("property_id") == single_prop.get("property_id") for p in props):
                props.append(single_prop)

        signals: List[Dict[str, Any]] = params.get("signals") or ctx.get("signals") or []
        analyses: List[Dict[str, Any]] = params.get("analyses") or ctx.get("analyses") or []
        inv_analysis = params.get("investment_analysis") or ctx.get("investment_analysis")
        risk_data = params.get("risk_assessment") or ctx.get("risk_assessment")
        sources: List[Dict[str, Any]] = params.get("sources") or ctx.get("sources") or []

        audit_records: List[Dict[str, Any]] = []
        change_records: List[Dict[str, Any]] = []
        persisted_counts = {
            "properties": 0,
            "sources": 0,
            "signals": 0,
            "analyses": 0,
            "audit_records": 0,
        }

        db = SessionLocal()
        try:
            # 1. Persist Sources
            for src in sources:
                src_id = src.get("source_id")
                if src_id:
                    existing = db.query(SourceModel).filter_by(source_id=src_id).first()
                    if not existing:
                        db_source = SourceModel(
                            source_id=src_id,
                            source_name=src.get("source_name", "Unknown Source"),
                            source_type=src.get("source_type", "WEB"),
                            source_url=src.get("source_url"),
                            content_type=src.get("content_type", "text/html"),
                            raw_reference=src.get("raw_reference"),
                            collection_status=src.get("collection_status", "SUCCESS"),
                            metadata_payload=src.get("metadata", {}),
                        )
                        db.add(db_source)
                        persisted_counts["sources"] += 1

            # 2. Persist Canonical Properties & Version History
            for prop in props:
                prop_id = prop.get("property_id")
                if not prop_id:
                    continue

                existing_prop = db.query(PropertyModel).filter_by(property_id=prop_id).first()
                fin = prop.get("financials", {})
                new_price = fin.get("price")
                specs = prop.get("specs", {})
                loc = prop.get("location", {})

                if existing_prop:
                    # Detect price changes and create HistoricalChangeRecord
                    if new_price and existing_prop.price and existing_prop.price != new_price:
                        chg = HistoricalChangeRecord(
                            entity_id=prop_id,
                            field_name="price",
                            old_value=existing_prop.price,
                            new_value=new_price,
                            run_id=request.run_id,
                        )
                        change_records.append(chg.model_dump())

                    existing_prop.version += 1
                    existing_prop.price = new_price
                    existing_prop.updated_at = utc_now()
                    existing_prop.attributes = to_dict(prop)
                else:
                    new_prop_model = PropertyModel(
                        property_id=prop_id,
                        canonical_name=prop.get("canonical_name", "Unknown Property"),
                        property_type=prop.get("identity", {}).get("property_type"),
                        developer=prop.get("identity", {}).get("developer"),
                        city=loc.get("city"),
                        locality=loc.get("locality"),
                        price=new_price,
                        price_per_sqft=fin.get("price_per_sqft"),
                        area=specs.get("area"),
                        bedrooms=specs.get("bedrooms"),
                        version=1,
                        confidence=prop.get("confidence"),
                        attributes=to_dict(prop),
                    )
                    db.add(new_prop_model)
                    db.flush()
                    persisted_counts["properties"] += 1

                # Audit record entry for property
                aud = AuditRecord(
                    record_id=generate_audit_id(),
                    entity_id=prop_id,
                    record_version=existing_prop.version if existing_prop else 1,
                    run_id=request.run_id,
                    payload_type="PROPERTY",
                    payload=to_dict(prop),
                )
                db_audit = AuditRecordModel(
                    record_id=aud.record_id,
                    entity_id=aud.entity_id,
                    record_version=aud.record_version,
                    payload_type=aud.payload_type,
                    agent_id=aud.agent_id,
                    agent_version=aud.agent_version,
                    run_id=aud.run_id,
                    payload=to_dict(aud.payload),
                )
                db.add(db_audit)
                audit_records.append(aud.model_dump())
                persisted_counts["audit_records"] += 1

            # Flush properties and audit records so foreign key dependencies are satisfied in PostgreSQL
            db.flush()

            # 3. Persist Minted Signals
            for sig in signals:
                sig_id = sig.get("signal_id")
                sig_ent_id = sig.get("entity_id") or request.parameters.get("property_id") or request.context.get("property_id")
                if sig_id and sig_ent_id:
                    # Ensure entity exists to satisfy foreign key
                    prop_exists = db.query(PropertyModel.property_id).filter_by(property_id=sig_ent_id).first()
                    if prop_exists:
                        existing_sig = db.query(SignalModel).filter_by(signal_id=sig_id).first()
                        if not existing_sig:
                            db_sig = SignalModel(
                                signal_id=sig_id,
                                signal_type=sig.get("signal_type"),
                                entity_id=sig_ent_id,
                                severity=sig.get("severity", "MEDIUM"),
                                importance=sig.get("importance", 5.0),
                                description=sig.get("description", ""),
                                source_reference=sig.get("source_reference"),
                                evidence_reference=sig.get("evidence_reference"),
                                confidence=sig.get("confidence"),
                                status=sig.get("status", "ACTIVE"),
                                metadata_payload=to_dict(sig.get("metadata", {})),
                            )
                            db.add(db_sig)
                            persisted_counts["signals"] += 1

            # 4. Persist Real Estate Analysis
            for ana in analyses:
                ana_id = ana.get("analysis_id")
                ana_ent_id = ana.get("entity_id") or request.parameters.get("property_id") or request.context.get("property_id")
                if ana_id and ana_ent_id:
                    # Ensure entity exists to satisfy foreign key
                    prop_exists = db.query(PropertyModel.property_id).filter_by(property_id=ana_ent_id).first()
                    if prop_exists:
                        existing_ana = db.query(AnalysisModel).filter_by(analysis_id=ana_id).first()
                        if not existing_ana:
                            db_ana = AnalysisModel(
                                analysis_id=ana_id,
                                entity_id=ana_ent_id,
                                status=ana.get("status", "COMPLETED"),
                                confidence=ana.get("confidence"),
                                metrics_payload=to_dict(ana),
                            )
                            db.add(db_ana)
                            persisted_counts["analyses"] += 1

            db.commit()

        except Exception as exc:
            db.rollback()
            self.logger.exception(f"Error during SSR writeback: {exc}")
            return AgentResult(
                success=False,
                status=AgentExecutionStatus.FAILED,
                agent_id=self.agent_id,
                agent_version=self.version,
                run_id=request.run_id,
                errors=[f"SSR writeback failure: {str(exc)}"],
            )
        finally:
            db.close()

        return AgentResult(
            success=True,
            status=AgentExecutionStatus.SUCCESS,
            agent_id=self.agent_id,
            agent_version=self.version,
            run_id=request.run_id,
            data={
                "persisted_counts": persisted_counts,
                "audit_records": audit_records,
                "change_records": change_records,
            },
            metadata={"writeback_status": "COMMITTED"},
        )
