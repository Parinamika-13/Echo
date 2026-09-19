"""ECHO Agent 06: Signal Classification & Signal Minting Agent."""

from typing import Any, Dict, List, Optional

from backend.app.agents.base_agent import BaseAgent
from backend.app.schemas.agent import (
    AgentExecutionStatus,
    AgentRequest,
    AgentResult,
)
from backend.app.schemas.signal import (
    Signal,
    SignalSeverity,
    SignalStatus,
    SignalType,
)
from backend.app.utils.ids import generate_signal_id
from backend.app.utils.timestamps import utc_now


class SignalAgent(BaseAgent):
    """Agent 06: Detects and mints structured, explainable signals from factual data changes."""

    agent_id: str = "ECHO-SIGNAL"
    name: str = "Signal Classification & Signal Minting Agent"
    version: str = "0.1.0"
    description: str = (
        "Classifies and mints deterministic real-estate and financial signals from verified changes "
        "and market observations without hallucinating unevidenced events."
    )
    capabilities: List[str] = [
        "signal_minting",
        "price_change_detection",
        "event_classification",
        "duplicate_prevention",
        "evidence_linking",
    ]

    def validate_input(self, request: AgentRequest) -> bool:
        if not super().validate_input(request):
            return False
        # Needs at least one entity or properties list in parameters or context
        props = (
            request.parameters.get("canonical_properties")
            or request.context.get("canonical_properties")
            or request.parameters.get("property")
            or request.context.get("property")
            or request.parameters.get("changes")
        )
        return bool(props is not None)

    def _run(self, request: AgentRequest) -> AgentResult:
        props: List[Dict[str, Any]] = (
            request.parameters.get("canonical_properties")
            or request.context.get("canonical_properties", [])
        )
        single_prop = request.parameters.get("property") or request.context.get("property")
        if single_prop:
            props.append(single_prop)

        changes: List[Dict[str, Any]] = request.parameters.get("changes", [])
        minted_signals: List[Dict[str, Any]] = []
        seen_signal_ids = set()

        # 1. Evaluate explicit changes passed to agent
        for chg in changes:
            field = chg.get("field")
            entity_id = chg.get("entity_id", "ent_unknown")
            old_v = chg.get("old_value")
            new_v = chg.get("new_value")

            if field == "price" and old_v is not None and new_v is not None:
                diff = float(new_v) - float(old_v)
                s_type = SignalType.PRICE_DROP if diff < 0 else SignalType.PRICE_INCREASE
                sig_id = generate_signal_id(s_type.value, entity_id, f"{old_v}_{new_v}")

                if sig_id not in seen_signal_ids:
                    seen_signal_ids.add(sig_id)
                    sig = Signal(
                        signal_id=sig_id,
                        signal_type=s_type,
                        entity_id=entity_id,
                        severity=SignalSeverity.HIGH if abs(diff) > 500_000 else SignalSeverity.MEDIUM,
                        importance=8.0 if s_type == SignalType.PRICE_DROP else 6.5,
                        description=f"Price moved from {old_v:,.2f} to {new_v:,.2f} (delta: {diff:+,.2f})",
                        source_reference=chg.get("source_id"),
                        evidence_reference=chg.get("evidence_id"),
                        confidence=0.95,
                        status=SignalStatus.ACTIVE,
                    )
                    minted_signals.append(sig.model_dump())

        # 2. Evaluate newly identified properties
        for prop in props:
            entity_id = prop.get("property_id") or "ent_unknown"
            name = prop.get("canonical_name", "Asset")

            # MINT: LISTING_NEW
            sig_id = generate_signal_id(SignalType.LISTING_NEW.value, entity_id, "discovery")
            if sig_id not in seen_signal_ids:
                seen_signal_ids.add(sig_id)
                sig = Signal(
                    signal_id=sig_id,
                    signal_type=SignalType.LISTING_NEW,
                    entity_id=entity_id,
                    severity=SignalSeverity.LOW,
                    importance=5.0,
                    description=f"New property asset indexed: {name}",
                    confidence=prop.get("confidence") or 0.85,
                    status=SignalStatus.ACTIVE,
                )
                minted_signals.append(sig.model_dump())

            # MINT: REGULATORY_UPDATE if RERA available
            reg = prop.get("regulatory", {})
            rera = reg.get("rera_number")
            if rera:
                rera_sig_id = generate_signal_id(SignalType.REGULATORY_UPDATE.value, entity_id, rera)
                if rera_sig_id not in seen_signal_ids:
                    seen_signal_ids.add(rera_sig_id)
                    sig = Signal(
                        signal_id=rera_sig_id,
                        signal_type=SignalType.REGULATORY_UPDATE,
                        entity_id=entity_id,
                        severity=SignalSeverity.LOW,
                        importance=6.0,
                        description=f"RERA registration recorded: {rera}",
                        confidence=0.98,
                        status=SignalStatus.ACTIVE,
                    )
                    minted_signals.append(sig.model_dump())

        return AgentResult(
            success=True,
            status=AgentExecutionStatus.SUCCESS,
            agent_id=self.agent_id,
            agent_version=self.version,
            run_id=request.run_id,
            data={
                "signals": minted_signals,
                "total_signals": len(minted_signals),
            },
            evidence=[{"signal_id": s["signal_id"], "entity_id": s["entity_id"]} for s in minted_signals],
            metadata={"minted_count": len(minted_signals)},
        )
