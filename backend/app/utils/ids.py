"""ECHO Identifier Generation Utilities."""

import hashlib
import uuid
from typing import Optional


def generate_run_id(prefix: str = "run") -> str:
    """Generate a unique run ID for orchestrator and agent executions."""
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def generate_entity_id(name: Optional[str] = None, locality: Optional[str] = None) -> str:
    """Generate canonical entity ID. Deterministic if name and locality provided, otherwise UUID."""
    if name and locality:
        normalized = f"{name.strip().lower()}|{locality.strip().lower()}"
        digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:16]
        return f"ent_{digest}"
    return f"ent_{uuid.uuid4().hex[:12]}"


def generate_signal_id(signal_type: str, entity_id: str, context_key: Optional[str] = None) -> str:
    """Generate deterministic signal ID to avoid creating duplicate signals for the same event."""
    key = f"{signal_type}|{entity_id}|{context_key or ''}".lower()
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()[:16]
    return f"sig_{digest}"


def generate_source_id(source_name: str, source_url: Optional[str] = None) -> str:
    """Generate source identifier, deterministic based on URL or name."""
    raw = (source_url or source_name).strip().lower()
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:12]
    return f"src_{digest}"


def generate_evidence_id() -> str:
    """Generate evidence record ID."""
    return f"evi_{uuid.uuid4().hex[:12]}"


def generate_risk_id(risk_type: str, entity_id: str) -> str:
    """Generate risk assessment ID."""
    key = f"{risk_type}|{entity_id}".lower()
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()[:12]
    return f"risk_{digest}"


def generate_audit_id() -> str:
    """Generate audit entry ID."""
    return f"aud_{uuid.uuid4().hex[:12]}"
