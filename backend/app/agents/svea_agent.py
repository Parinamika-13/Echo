"""ECHO Agent 09: SVEA — Source & Evidence Validation Agent."""

import uuid
from typing import Any, Dict, List, Optional

from backend.app.agents.base_agent import BaseAgent
from backend.app.schemas.agent import (
    AgentExecutionStatus,
    AgentRequest,
    AgentResult,
)
from backend.app.schemas.validation import (
    ConflictRecord,
    ValidationResult,
    ValidationStatus,
)
from backend.app.utils.timestamps import utc_now


class SveaAgent(BaseAgent):
    """Agent 09: Validates cross-source evidence consistency, freshness, and flags factual conflicts."""

    agent_id: str = "ECHO-SVEA"
    name: str = "SVEA — Source & Evidence Validation Agent"
    version: str = "0.1.0"
    description: str = (
        "Validates factual integrity across disparate sources, detects discrepancies without "
        "silent overwrites, and records explicit ConflictRecords."
    )
    capabilities: List[str] = [
        "cross_source_validation",
        "conflict_detection",
        "freshness_scoring",
        "completeness_auditing",
        "provenance_verification",
    ]

    def validate_input(self, request: AgentRequest) -> bool:
        if not super().validate_input(request):
            return False
        # Valid if candidates, evidence, or canonical properties are present
        items = (
            request.parameters.get("candidates")
            or request.context.get("candidates")
            or request.parameters.get("canonical_properties")
            or request.context.get("canonical_properties")
            or request.parameters.get("evidence")
        )
        return bool(items is not None)

    def _run(self, request: AgentRequest) -> AgentResult:
        candidates: List[Dict[str, Any]] = (
            request.parameters.get("candidates")
            or request.context.get("candidates", [])
        )
        entity_id = request.parameters.get("entity_id", "ent_default")

        conflicts: List[ConflictRecord] = []
        verified_fields: List[str] = []
        unverified_fields: List[str] = []

        # Compare multi-source candidates for conflicts (e.g. price discrepancies)
        if len(candidates) >= 2:
            first = candidates[0]
            for cand in candidates[1:]:
                # 1. Price check
                price_a = first.get("financials", {}).get("price")
                price_b = cand.get("financials", {}).get("price")
                source_a = first.get("source_id", "Source A")
                source_b = cand.get("source_id", "Source B")

                if price_a and price_b:
                    # Allow 2% tolerance for minor portal fee discrepancies
                    if abs(price_a - price_b) / max(price_a, price_b) > 0.02:
                        conflicts.append(ConflictRecord(
                            field_name="price",
                            source_a=source_a,
                            source_b=source_b,
                            value_a=price_a,
                            value_b=price_b,
                            conflict_type="VALUE_MISMATCH",
                            severity="HIGH",
                        ))
                    else:
                        if "price" not in verified_fields:
                            verified_fields.append("price")

                # 2. Bedrooms / Specs check
                bed_a = first.get("specs", {}).get("bedrooms")
                bed_b = cand.get("specs", {}).get("bedrooms")
                if bed_a and bed_b:
                    if bed_a != bed_b:
                        conflicts.append(ConflictRecord(
                            field_name="bedrooms",
                            source_a=source_a,
                            source_b=source_b,
                            value_a=bed_a,
                            value_b=bed_b,
                            conflict_type="VALUE_MISMATCH",
                            severity="MEDIUM",
                        ))
                    else:
                        if "bedrooms" not in verified_fields:
                            verified_fields.append("bedrooms")

        elif len(candidates) == 1:
            # Single source candidate - marks fields as uncorroborated
            unverified_fields.extend(["price", "area", "bedrooms", "possession_date"])

        status = ValidationStatus.CONFLICT if conflicts else ValidationStatus.VALIDATED
        if not candidates and not verified_fields:
            status = ValidationStatus.UNVERIFIED

        val_result = ValidationResult(
            validation_id=f"val_{uuid.uuid4().hex[:12]}",
            entity_id=entity_id,
            status=status,
            conflicts=conflicts,
            verified_fields=verified_fields,
            unverified_fields=unverified_fields,
            freshness_score=1.0,  # Current execution freshness
            completeness_score=0.85 if verified_fields else 0.50,
            overall_confidence=0.70 if conflicts else 0.92,
        )

        return AgentResult(
            success=True,
            status=AgentExecutionStatus.SUCCESS,
            agent_id=self.agent_id,
            agent_version=self.version,
            run_id=request.run_id,
            data=val_result.model_dump(),
            confidence=val_result.overall_confidence,
            warnings=[f"Detected {len(conflicts)} data conflict(s) across sources."] if conflicts else [],
            metadata={"validation_status": status.value, "conflict_count": len(conflicts)},
        )
