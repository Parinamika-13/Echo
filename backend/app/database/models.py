"""ECHO SQLAlchemy ORM Models."""

from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class PropertyModel(Base):
    """Canonical investigated entity & real-estate entity persistence.

    Represents both corporate financial/disclosure entities (where company, sector, region are populated)
    and physical real-estate listings (where property_type, city, locality, price, bedrooms, area are populated).
    """
    __tablename__ = "properties"

    property_id = Column(String(64), primary_key=True, index=True)
    canonical_name = Column(String(255), nullable=False, index=True)
    entity_type = Column(String(64), default="CORPORATE", index=True)  # 'CORPORATE' or 'REAL_ESTATE'
    company = Column(String(255), nullable=True, index=True)
    sector = Column(String(64), nullable=True, index=True)
    region = Column(String(128), nullable=True, index=True)

    # Physical Real-Estate Fields (strictly NULL for corporate disclosure entities)
    property_type = Column(String(64), nullable=True)
    developer = Column(String(255), nullable=True, index=True)
    city = Column(String(128), nullable=True, index=True)
    locality = Column(String(128), nullable=True, index=True)
    price = Column(Float, nullable=True)
    price_per_sqft = Column(Float, nullable=True)
    area = Column(Float, nullable=True)
    bedrooms = Column(Float, nullable=True)

    version = Column(Integer, default=1)
    confidence = Column(Float, nullable=True)
    attributes = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)



class SourceModel(Base):
    """Raw source registry model."""
    __tablename__ = "sources"

    source_id = Column(String(64), primary_key=True, index=True)
    source_name = Column(String(128), nullable=False)
    source_type = Column(String(32), default="WEB")
    source_url = Column(Text, nullable=True)
    content_type = Column(String(64), default="text/html")
    raw_reference = Column(Text, nullable=True)
    collection_status = Column(String(32), default="SUCCESS")
    retrieved_at = Column(DateTime(timezone=True), default=utc_now)
    published_at = Column(DateTime(timezone=True), nullable=True)
    metadata_payload = Column(JSON, default=dict)


class DocumentModel(Base):
    """Processed document records."""
    __tablename__ = "documents"

    document_id = Column(String(64), primary_key=True, index=True)
    source_id = Column(String(64), nullable=False, index=True)
    source_url = Column(Text, nullable=True)
    format = Column(String(32), default="HTML")
    title = Column(String(255), nullable=True)
    text_content = Column(Text, nullable=True)
    language = Column(String(16), default="en")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    metadata_payload = Column(JSON, default=dict)


class EvidenceModel(Base):
    """Atomic factual evidence records."""
    __tablename__ = "evidence"

    evidence_id = Column(String(64), primary_key=True, index=True)
    source_id = Column(String(64), nullable=False, index=True)
    document_id = Column(String(64), nullable=True, index=True)
    chunk_id = Column(String(64), nullable=True)
    source_url = Column(Text, nullable=True)
    field_name = Column(String(128), nullable=True)
    extracted_value = Column(JSON, nullable=True)
    context_snippet = Column(Text, nullable=True)
    retrieved_at = Column(DateTime(timezone=True), default=utc_now)
    confidence = Column(Float, nullable=True)
    metadata_payload = Column(JSON, default=dict)


class SignalModel(Base):
    """Minted signals catalog."""
    __tablename__ = "signals"

    signal_id = Column(String(64), primary_key=True, index=True)
    signal_type = Column(String(64), nullable=False, index=True)
    entity_id = Column(String(64), nullable=False, index=True)
    severity = Column(String(32), default="MEDIUM")
    importance = Column(Float, default=5.0)
    description = Column(Text, nullable=False)
    source_reference = Column(String(128), nullable=True)
    evidence_reference = Column(String(128), nullable=True)
    confidence = Column(Float, nullable=True)
    status = Column(String(32), default="ACTIVE")
    timestamp = Column(DateTime(timezone=True), default=utc_now)
    metadata_payload = Column(JSON, default=dict)


class AnalysisModel(Base):
    """Real estate analysis records from ERA."""
    __tablename__ = "analyses"

    analysis_id = Column(String(64), primary_key=True, index=True)
    entity_id = Column(String(64), nullable=False, index=True)
    status = Column(String(32), default="COMPLETED")
    confidence = Column(Float, nullable=True)
    metrics_payload = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utc_now)


class InvestmentScenarioModel(Base):
    """Investment projections from ISDAA."""
    __tablename__ = "investment_scenarios"

    investment_id = Column(String(64), primary_key=True, index=True)
    entity_id = Column(String(64), nullable=False, index=True)
    scenario_type = Column(String(32), default="BASE")
    purchase_price = Column(Float, nullable=False)
    down_payment = Column(Float, nullable=False)
    annual_cash_flow = Column(Float, nullable=True)
    total_investment = Column(Float, nullable=True)
    estimated_return = Column(Float, nullable=True)
    net_yield = Column(Float, nullable=True)
    roi = Column(Float, nullable=True)
    assumptions_payload = Column(JSON, default=list)
    breakdown_payload = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utc_now)


class RiskAssessmentModel(Base):
    """Risk profiles compiled by RSA."""
    __tablename__ = "risk_assessments"

    assessment_id = Column(String(64), primary_key=True, index=True)
    entity_id = Column(String(64), nullable=False, index=True)
    overall_rating = Column(String(32), default="NOT_CALCULATED")
    overall_confidence = Column(Float, nullable=True)
    status = Column(String(32), default="COMPLETED")
    factors_payload = Column(JSON, default=list)
    primary_concerns = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utc_now)


class AgentRunModel(Base):
    """Agent execution observability trail."""
    __tablename__ = "agent_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String(64), nullable=False, index=True)
    agent_id = Column(String(64), nullable=False, index=True)
    agent_version = Column(String(32), default="0.1.0")
    status = Column(String(32), nullable=False)
    start_time = Column(DateTime(timezone=True), default=utc_now)
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration_ms = Column(Float, nullable=True)
    parameters = Column(JSON, default=dict)
    warnings = Column(JSON, default=list)
    errors = Column(JSON, default=list)


class AuditRecordModel(Base):
    """Historical audit ledger entries committed by SSR."""
    __tablename__ = "audit_records"

    record_id = Column(String(64), primary_key=True, index=True)
    entity_id = Column(String(64), nullable=False, index=True)
    record_version = Column(Integer, default=1)
    payload_type = Column(String(64), nullable=False)
    agent_id = Column(String(64), default="ECHO-SSR")
    agent_version = Column(String(32), default="0.1.0")
    run_id = Column(String(64), nullable=False, index=True)
    confidence = Column(Float, nullable=True)
    evidence_reference = Column(String(128), nullable=True)
    payload = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now)


class InvestigationModel(Base):
    """Investigation workflow tracking records."""
    __tablename__ = "investigations"

    investigation_id = Column(String(64), primary_key=True, index=True)
    entity_id = Column(String(64), nullable=False, index=True)
    topic = Column(String(128), nullable=True)
    status = Column(String(64), default="NEW", index=True)
    priority = Column(String(32), default="MEDIUM", index=True)
    materiality = Column(String(64), nullable=True)
    exposure_value_usd_m = Column(Float, nullable=True)
    findings_summary = Column(Text, nullable=True)
    metadata_payload = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

