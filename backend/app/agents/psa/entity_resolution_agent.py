"""ECHO Agent 05: PSA Entity Resolution & Deduplication Agent."""

import re
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Tuple

from backend.app.agents.base_agent import BaseAgent
from backend.app.schemas.agent import (
    AgentExecutionStatus,
    AgentRequest,
    AgentResult,
)
from backend.app.schemas.property import (
    PropertyCandidate,
    PropertyRecord,
)
from backend.app.utils.ids import generate_entity_id
from backend.app.utils.timestamps import utc_now


def normalize_string(val: Optional[str]) -> str:
    """Normalize text by lowercasing, removing punctuation, and trimming extra spaces."""
    if not val:
        return ""
    cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", val.lower())
    # Remove common real estate suffix noise
    cleaned = re.sub(r"\b(apartments|residences|phase|tower|towers|project|homes|habitat)\b", " ", cleaned)
    return re.sub(r"\s+", " ", cleaned).strip()


class EntityMatcher(ABC):
    """Abstract interface for matching and linking disparate property records."""

    @abstractmethod
    def match(self, candidate_a: Dict[str, Any], candidate_b: Dict[str, Any]) -> Tuple[float, List[str], str]:
        """Returns (match_confidence, matching_features, explanation)."""
        pass


class RuleBasedEntityMatcher(EntityMatcher):
    """Deterministic entity matching using string normalization, locality overlap, and developer linkage."""

    def match(self, candidate_a: Dict[str, Any], candidate_b: Dict[str, Any]) -> Tuple[float, List[str], str]:
        ident_a = candidate_a.get("identity", {})
        ident_b = candidate_b.get("identity", {})
        loc_a = candidate_a.get("location", {})
        loc_b = candidate_b.get("location", {})

        score = 0.0
        features: List[str] = []

        # 1. Project Name similarity
        name_a = normalize_string(ident_a.get("project_name") or ident_a.get("property_name"))
        name_b = normalize_string(ident_b.get("project_name") or ident_b.get("property_name"))

        if name_a and name_b:
            if name_a == name_b:
                score += 0.50
                features.append("exact_project_name_match")
            elif name_a in name_b or name_b in name_a:
                score += 0.35
                features.append("substring_project_name_match")

        # 2. Pincode and Locality
        pin_a = loc_a.get("pincode")
        pin_b = loc_b.get("pincode")
        if pin_a and pin_b and pin_a == pin_b:
            score += 0.25
            features.append("exact_pincode_match")

        locality_a = normalize_string(loc_a.get("locality"))
        locality_b = normalize_string(loc_b.get("locality"))
        if locality_a and locality_b and (locality_a == locality_b or locality_a in locality_b or locality_b in locality_a):
            score += 0.15
            features.append("locality_match")

        # 3. Developer similarity
        dev_a = normalize_string(ident_a.get("developer"))
        dev_b = normalize_string(ident_b.get("developer"))
        if dev_a and dev_b and (dev_a == dev_b or dev_a in dev_b or dev_b in dev_a):
            score += 0.10
            features.append("developer_match")

        confidence = min(1.0, score)
        explanation = f"Matched on features: {', '.join(features)}" if features else "No shared identifying attributes found."
        return confidence, features, explanation


class PsaEntityResolutionAgent(BaseAgent):
    """Agent 05: Responsible for deduplicating listings and resolving them to canonical assets."""

    agent_id: str = "ECHO-PSA-ENTITY"
    name: str = "PSA Entity Resolution & Deduplication Agent"
    version: str = "0.1.0"
    description: str = (
        "Determines whether multiple candidate listings refer to the same real-world asset, "
        "mints canonical entity IDs, and produces explainable matching confidence."
    )
    capabilities: List[str] = [
        "entity_resolution",
        "deduplication",
        "fuzzy_matching",
        "canonical_id_generation",
        "explainable_linkage",
    ]

    def __init__(self):
        super().__init__()
        self._matcher = RuleBasedEntityMatcher()

    def validate_input(self, request: AgentRequest) -> bool:
        if not super().validate_input(request):
            return False
        candidates = request.parameters.get("candidates") or request.context.get("candidates")
        return bool(candidates is not None)

    def _run(self, request: AgentRequest) -> AgentResult:
        candidates: List[Dict[str, Any]] = (
            request.parameters.get("candidates")
            or request.context.get("candidates", [])
        )

        if not candidates:
            return AgentResult(
                success=True,
                status=AgentExecutionStatus.PARTIAL_SUCCESS,
                agent_id=self.agent_id,
                agent_version=self.version,
                run_id=request.run_id,
                data={"canonical_properties": [], "total_entities": 0},
                warnings=["No candidates were supplied for entity resolution."],
            )

        # Cluster candidates into canonical entities
        clusters: List[List[Dict[str, Any]]] = []
        for cand in candidates:
            assigned = False
            for cluster in clusters:
                # Compare with the representative of the cluster
                rep = cluster[0]
                conf, feats, _ = self._matcher.match(cand, rep)
                if conf >= 0.50:  # Threshold for clustering as same asset
                    cluster.append(cand)
                    assigned = True
                    break
            if not assigned:
                clusters.append([cand])

        canonical_properties: List[Dict[str, Any]] = []

        for cluster in clusters:
            rep = cluster[0]
            ident = rep.get("identity", {})
            loc = rep.get("location", {})
            fin = rep.get("financials", {})
            specs = rep.get("specs", {})

            proj_name = ident.get("project_name") or ident.get("property_name") or "Unnamed Property Asset"
            locality = loc.get("locality") or loc.get("city") or "Unknown"

            known_property_id = request.parameters.get("property_id") or request.context.get("property_id")
            canonical_id = (known_property_id if len(clusters) == 1 else None) or generate_entity_id(name=proj_name, locality=locality)
            matched_candidate_ids = [c.get("candidate_id", "unknown") for c in cluster]

            # Merge / best-known field consolidation
            canonical_record = PropertyRecord(
                property_id=canonical_id,
                canonical_name=proj_name,
                identity=ident,
                location=loc,
                financials=fin,
                specs=specs,
                project=rep.get("project", {}),
                regulatory=rep.get("regulatory", {}),
                matched_candidate_ids=matched_candidate_ids,
                version=1,
                confidence=0.90 if len(cluster) > 1 else 0.80,
                metadata={
                    "cluster_size": len(cluster),
                    "resolution_method": "RuleBasedEntityMatcher",
                },
            )
            canonical_properties.append(canonical_record.model_dump())

        return AgentResult(
            success=True,
            status=AgentExecutionStatus.SUCCESS,
            agent_id=self.agent_id,
            agent_version=self.version,
            run_id=request.run_id,
            data={
                "canonical_properties": canonical_properties,
                "total_entities": len(canonical_properties),
                "total_candidates_processed": len(candidates),
            },
            metadata={"clusters": len(clusters)},
        )
