"""ECHO Agent 04: PSA Property Extraction & Normalization Agent."""

import re
import uuid
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from backend.app.agents.base_agent import BaseAgent
from backend.app.schemas.agent import (
    AgentExecutionStatus,
    AgentRequest,
    AgentResult,
)
from backend.app.schemas.evidence import EvidenceRecord, ProvenanceRecord
from backend.app.schemas.property import (
    PropertyCandidate,
    PropertyFinancials,
    PropertyIdentity,
    PropertyListing,
    PropertyLocation,
    PropertyProject,
    PropertyRegulatory,
    PropertySpecs,
)
from backend.app.utils.ids import generate_evidence_id
from backend.app.utils.timestamps import utc_now


class PropertyExtractor(ABC):
    """Abstract interface for extracting structured real estate assets from text."""

    @abstractmethod
    def extract(
        self,
        text: str,
        source_id: str,
        document_id: Optional[str] = None,
        source_url: Optional[str] = None,
    ) -> PropertyCandidate:
        pass


class RuleBasedPropertyExtractor(PropertyExtractor):
    """Baseline deterministic extractor leveraging regex patterns and heuristics."""

    def extract(
        self,
        text: str,
        source_id: str,
        document_id: Optional[str] = None,
        source_url: Optional[str] = None,
    ) -> PropertyCandidate:
        candidate_id = f"cand_{uuid.uuid4().hex[:12]}"
        evidence_list: List[EvidenceRecord] = []

        # 1. Identity Extraction
        prop_name: Optional[str] = None
        dev_name: Optional[str] = None

        name_match = re.search(r"(?:Project|Property|Community):\s*([A-Za-z0-9\s\-]+?)(?:\.|\n|,|$)", text, re.I)
        if name_match:
            prop_name = name_match.group(1).strip()
            evidence_list.append(EvidenceRecord(
                evidence_id=generate_evidence_id(),
                source_id=source_id,
                document_id=document_id,
                source_url=source_url,
                field_name="property_name",
                extracted_value=prop_name,
                context_snippet=name_match.group(0).strip(),
                confidence=0.85,
            ))

        dev_match = re.search(r"(?:Developer|Builder|By):\s*([A-Za-z0-9\s\-]+?)(?:\.|\n|,|$)", text, re.I)
        if dev_match:
            dev_name = dev_match.group(1).strip()
            evidence_list.append(EvidenceRecord(
                evidence_id=generate_evidence_id(),
                source_id=source_id,
                document_id=document_id,
                source_url=source_url,
                field_name="developer",
                extracted_value=dev_name,
                context_snippet=dev_match.group(0).strip(),
                confidence=0.85,
            ))

        # 2. Financial Extraction (Indian denomination normalization: Cr / Lakh)
        price_val: Optional[float] = None
        price_match = re.search(r"(?:₹|Rs\.?|INR)?\s*(\d+(?:\.\d+)?)\s*(Cr|Crore|L|Lakh|Lac)s?", text, re.I)
        if price_match:
            num = float(price_match.group(1))
            unit = price_match.group(2).lower()
            if "cr" in unit:
                price_val = num * 10_000_000.0
            elif "l" in unit:
                price_val = num * 100_000.0
            evidence_list.append(EvidenceRecord(
                evidence_id=generate_evidence_id(),
                source_id=source_id,
                document_id=document_id,
                source_url=source_url,
                field_name="price",
                extracted_value=price_val,
                context_snippet=price_match.group(0).strip(),
                confidence=0.90,
            ))

        # 3. Specs: Bedrooms (BHK) & Area
        bhk_val: Optional[float] = None
        bhk_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:BHK|bhk|bed|bedroom)", text, re.I)
        if bhk_match:
            bhk_val = float(bhk_match.group(1))
            evidence_list.append(EvidenceRecord(
                evidence_id=generate_evidence_id(),
                source_id=source_id,
                document_id=document_id,
                source_url=source_url,
                field_name="bedrooms",
                extracted_value=bhk_val,
                context_snippet=bhk_match.group(0).strip(),
                confidence=0.90,
            ))

        area_val: Optional[float] = None
        area_match = re.search(r"(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft|square\s*feet)", text, re.I)
        if area_match:
            area_str = area_match.group(1).replace(",", "")
            area_val = float(area_str)
            evidence_list.append(EvidenceRecord(
                evidence_id=generate_evidence_id(),
                source_id=source_id,
                document_id=document_id,
                source_url=source_url,
                field_name="area",
                extracted_value=area_val,
                context_snippet=area_match.group(0).strip(),
                confidence=0.90,
            ))

        # 4. Location: Pincode & Locality
        pincode_val: Optional[str] = None
        pin_match = re.search(r"\b([1-9][0-9]{5})\b", text)
        if pin_match:
            pincode_val = pin_match.group(1)
            evidence_list.append(EvidenceRecord(
                evidence_id=generate_evidence_id(),
                source_id=source_id,
                document_id=document_id,
                source_url=source_url,
                field_name="pincode",
                extracted_value=pincode_val,
                context_snippet=pin_match.group(0).strip(),
                confidence=0.95,
            ))

        loc_match = re.search(r"(?:Location|Locality|Address):\s*([A-Za-z0-9\s,]+?)(?:\.|\n|$)", text, re.I)
        locality_val = loc_match.group(1).strip() if loc_match else None

        # 5. Regulatory: RERA
        rera_val: Optional[str] = None
        rera_match = re.search(r"(?:RERA|rera\s*no\.?|registration\s*no\.?):\s*([A-Z0-9/\-]+)", text, re.I)
        if rera_match:
            rera_val = rera_match.group(1).strip()
            evidence_list.append(EvidenceRecord(
                evidence_id=generate_evidence_id(),
                source_id=source_id,
                document_id=document_id,
                source_url=source_url,
                field_name="rera_number",
                extracted_value=rera_val,
                context_snippet=rera_match.group(0).strip(),
                confidence=0.95,
            ))

        # Calculate price per sqft if both price and area are present
        price_per_sqft = None
        if price_val and area_val and area_val > 0:
            price_per_sqft = round(price_val / area_val, 2)

        return PropertyCandidate(
            candidate_id=candidate_id,
            source_id=source_id,
            document_id=document_id,
            identity=PropertyIdentity(
                property_name=prop_name,
                project_name=prop_name,
                developer=dev_name,
            ),
            location=PropertyLocation(
                address=locality_val,
                locality=locality_val,
                pincode=pincode_val,
            ),
            financials=PropertyFinancials(
                price=price_val,
                price_per_sqft=price_per_sqft,
            ),
            specs=PropertySpecs(
                area=area_val,
                bedrooms=bhk_val,
            ),
            regulatory=PropertyRegulatory(
                rera_number=rera_val,
            ),
            listing=PropertyListing(
                source_url=source_url,
                listing_date=utc_now(),
            ),
            evidence=evidence_list,
            confidence=0.85 if evidence_list else None,
            metadata={"extractor": "RuleBasedPropertyExtractor"},
        )


class LlmPropertyExtractor(PropertyExtractor):
    """Placeholder interface for future LLM-based structured extraction."""

    def extract(
        self,
        text: str,
        source_id: str,
        document_id: Optional[str] = None,
        source_url: Optional[str] = None,
    ) -> PropertyCandidate:
        candidate_id = f"cand_{uuid.uuid4().hex[:12]}"
        return PropertyCandidate(
            candidate_id=candidate_id,
            source_id=source_id,
            document_id=document_id,
            metadata={
                "extractor": "LlmPropertyExtractor",
                "status": "NOT_IMPLEMENTED",
                "message": "LLM-based structured property extraction will be implemented in subsequent phase.",
            },
        )


class PsaPropertyExtractionAgent(BaseAgent):
    """Agent 04: Responsible for extracting structured property candidates from unstructured text."""

    agent_id: str = "ECHO-PSA-EXTRACT"
    name: str = "PSA Property Extraction & Normalization Agent"
    version: str = "0.1.0"
    description: str = (
        "Extracts typed, structured property attributes (financials, specs, location, "
        "regulatory) and builds atomic evidence records."
    )
    capabilities: List[str] = [
        "property_extraction",
        "field_normalization",
        "financial_normalization",
        "evidence_generation",
    ]

    def __init__(self):
        super().__init__()
        self._rule_extractor = RuleBasedPropertyExtractor()
        self._llm_extractor = LlmPropertyExtractor()

    def validate_input(self, request: AgentRequest) -> bool:
        if not super().validate_input(request):
            return False
        # Needs documents, chunks, or raw_text in parameters or context
        docs = request.parameters.get("documents") or request.context.get("documents")
        chunks = request.parameters.get("chunks") or request.context.get("chunks")
        raw_text = request.parameters.get("raw_text") or request.context.get("raw_text")
        raw_content = request.parameters.get("raw_content") or request.context.get("raw_content")
        return bool(docs or chunks or raw_text or raw_content)

    def _run(self, request: AgentRequest) -> AgentResult:
        docs = request.parameters.get("documents") or request.context.get("documents", [])
        chunks = request.parameters.get("chunks") or request.context.get("chunks", [])
        raw_text = request.parameters.get("raw_text") or request.context.get("raw_text") or request.parameters.get("raw_content") or request.context.get("raw_content")

        candidates: List[Dict[str, Any]] = []
        all_evidence: List[Dict[str, Any]] = []

        # 1. If structured documents are passed
        if docs:
            for doc in docs:
                text = doc.get("text_content") or ""
                if text:
                    candidate = self._rule_extractor.extract(
                        text=text,
                        source_id=doc.get("source_id", "src_unknown"),
                        document_id=doc.get("document_id"),
                        source_url=doc.get("source_url"),
                    )
                    candidates.append(candidate.model_dump())
                    for ev in candidate.evidence:
                        all_evidence.append(ev.model_dump())

        # 2. If no docs, but raw text available
        elif raw_text:
            candidate = self._rule_extractor.extract(
                text=raw_text,
                source_id=f"src_{request.run_id[:8]}",
            )
            candidates.append(candidate.model_dump())
            for ev in candidate.evidence:
                all_evidence.append(ev.model_dump())

        status = AgentExecutionStatus.SUCCESS if candidates else AgentExecutionStatus.PARTIAL_SUCCESS
        warnings = [] if candidates else ["No property candidates were extracted from inputs."]

        return AgentResult(
            success=True,
            status=status,
            agent_id=self.agent_id,
            agent_version=self.version,
            run_id=request.run_id,
            data={
                "candidates": candidates,
                "total_candidates": len(candidates),
            },
            evidence=all_evidence,
            warnings=warnings,
            metadata={"extractor": "RuleBasedPropertyExtractor"},
        )
