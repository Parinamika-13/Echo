"""ECHO Agent 10: RSA — Risk & Signal Assessment Agent."""

import uuid
from typing import Any, Dict, List, Optional

from backend.app.agents.base_agent import BaseAgent
from backend.app.schemas.agent import (
    AgentExecutionStatus,
    AgentRequest,
    AgentResult,
)
from backend.app.schemas.risk import (
    RiskAssessment,
    RiskDimension,
    RiskFactor,
    RiskSeverity,
)
from backend.app.utils.ids import generate_risk_id
from backend.app.utils.timestamps import utc_now


class RsaAgent(BaseAgent):
    """Agent 10: Evaluates multi-dimensional risk from validated evidence and minted signals."""

    agent_id: str = "ECHO-RSA"
    name: str = "RSA — Risk & Signal Assessment Agent"
    version: str = "0.1.0"
    description: str = (
        "Assesses risk dimensions (Data Quality, Regulatory, Price, Market) with explainable "
        "reasons grounded in factual evidence and signals rather than arbitrary scores."
    )
    capabilities: [str] = [
        "risk_assessment",
        "data_quality_risk",
        "regulatory_risk",
        "signal_impact_assessment",
        "explainable_risk_factors",
    ]

    def validate_input(self, request: AgentRequest) -> bool:
        if not super().validate_input(request):
            return False
        # Needs validation result, signals, or property data
        has_data = (
            request.parameters.get("validation")
            or request.context.get("validation")
            or request.parameters.get("signals")
            or request.context.get("signals")
            or request.parameters.get("property")
            or request.context.get("property")
            or request.parameters.get("canonical_properties")
            or request.context.get("canonical_properties")
        )
        return bool(has_data is not None)

    def _run(self, request: AgentRequest) -> AgentResult:
        params = request.parameters
        ctx = request.context

        validation_data = params.get("validation") or ctx.get("validation") or {}
        signals: List[Dict[str, Any]] = params.get("signals") or ctx.get("signals") or []
        prop = params.get("property") or ctx.get("property") or {}
        if not prop:
            cands = params.get("canonical_properties") or ctx.get("canonical_properties") or []
            if cands:
                prop = cands[0]

        entity_id = prop.get("property_id") or validation_data.get("entity_id") or "ent_unknown"
        risk_factors: List[RiskFactor] = []
        primary_concerns: List[str] = []

        # 1. Evaluate DATA_QUALITY_RISK based on validation conflicts
        conflicts = validation_data.get("conflicts", [])
        if conflicts:
            conflict_fields = [c.get("field_name", "unknown") for c in conflicts]
            reason = f"Cross-source discrepancies detected for: {', '.join(conflict_fields)}."
            rf = RiskFactor(
                risk_id=generate_risk_id(RiskDimension.DATA_QUALITY_RISK.value, entity_id),
                risk_type=RiskDimension.DATA_QUALITY_RISK,
                severity=RiskSeverity.HIGH if "price" in conflict_fields else RiskSeverity.MEDIUM,
                reason=reason,
                evidence=[c.get("conflict_id", "cnf_unknown") for c in conflicts],
                confidence=0.95,
                calculation_method="cross_source_discrepancy_rule",
            )
            risk_factors.append(rf)
            primary_concerns.append(f"Data Quality Conflict: {reason}")

        # 2. Evaluate REGULATORY_RISK based on RERA filing
        reg = prop.get("regulatory", {})
        rera = reg.get("rera_number")
        if not rera:
            reason = "Property asset has no registered RERA certification on record."
            rf = RiskFactor(
                risk_id=generate_risk_id(RiskDimension.REGULATORY_RISK.value, entity_id),
                risk_type=RiskDimension.REGULATORY_RISK,
                severity=RiskSeverity.MEDIUM,
                reason=reason,
                confidence=0.85,
                calculation_method="statutory_filing_presence_check",
            )
            risk_factors.append(rf)
            primary_concerns.append("Regulatory: Missing RERA registration number.")

        # 3. Evaluate PRICE_RISK from minted signals
        for sig in signals:
            sig_type = sig.get("signal_type")
            if sig_type in ("PRICE_DROP", "PRICE_INCREASE"):
                reason = f"Market volatility indicated by signal: {sig.get('description')}"
                rf = RiskFactor(
                    risk_id=generate_risk_id(RiskDimension.PRICE_RISK.value, entity_id),
                    risk_type=RiskDimension.PRICE_RISK,
                    severity=RiskSeverity.MEDIUM,
                    reason=reason,
                    supporting_signals=[sig.get("signal_id")],
                    confidence=0.88,
                    calculation_method="signal_movement_heuristic",
                )
                risk_factors.append(rf)
                primary_concerns.append(f"Price Risk: {reason}")

        # Rating logic grounded in detected factors rather than arbitrary magic numbers
        if any(f.severity == RiskSeverity.CRITICAL for f in risk_factors):
            rating = "SEVERE"
        elif any(f.severity == RiskSeverity.HIGH for f in risk_factors):
            rating = "ELEVATED"
        elif risk_factors:
            rating = "MODERATE"
        else:
            rating = "LOW"

        assessment = RiskAssessment(
            assessment_id=f"rsa_{uuid.uuid4().hex[:12]}",
            entity_id=entity_id,
            factors=risk_factors,
            primary_concerns=primary_concerns,
            overall_risk_rating=rating,
            overall_confidence=0.90 if risk_factors else 0.80,
            status="COMPLETED",
        )

        return AgentResult(
            success=True,
            status=AgentExecutionStatus.SUCCESS,
            agent_id=self.agent_id,
            agent_version=self.version,
            run_id=request.run_id,
            data=assessment.model_dump(),
            metadata={"factors_count": len(risk_factors), "risk_rating": rating},
        )
