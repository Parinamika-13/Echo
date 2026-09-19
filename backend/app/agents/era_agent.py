"""ECHO Agent 07: ERA — Real Estate Analysis Agent."""

import uuid
from typing import Any, Dict, List, Optional

from backend.app.agents.base_agent import BaseAgent
from backend.app.schemas.agent import (
    AgentExecutionStatus,
    AgentRequest,
    AgentResult,
)
from backend.app.schemas.analysis import (
    AnalysisMetric,
    MetricAssumption,
    RealEstateAnalysis,
)
from backend.app.utils.timestamps import utc_now


class EraAgent(BaseAgent):
    """Agent 07: Performs transparent real-estate valuations and financial metrics."""

    agent_id: str = "ECHO-ERA"
    name: str = "ERA — Real Estate Analysis Agent"
    version: str = "0.1.0"
    description: str = (
        "Calculates real-estate metrics (price/sqft, rental yield, appreciation) "
        "retaining full lineage of input values, calculation methods, and explicit assumptions."
    )
    capabilities: List[str] = [
        "price_per_sqft_analysis",
        "rental_yield_analysis",
        "locality_comparison_framework",
        "trend_analysis_framework",
        "transparent_assumptions",
    ]

    def validate_input(self, request: AgentRequest) -> bool:
        if not super().validate_input(request):
            return False
        # Needs property or canonical_properties in parameters or context
        prop = (
            request.parameters.get("property")
            or request.context.get("property")
            or request.parameters.get("canonical_properties")
            or request.context.get("canonical_properties")
        )
        return bool(prop is not None)

    def _run(self, request: AgentRequest) -> AgentResult:
        props: List[Dict[str, Any]] = []
        raw_props = (
            request.parameters.get("canonical_properties")
            or request.context.get("canonical_properties")
        )
        if raw_props and isinstance(raw_props, list):
            props.extend(raw_props)

        single_prop = request.parameters.get("property") or request.context.get("property")
        if single_prop and isinstance(single_prop, dict):
            props.append(single_prop)

        if not props:
            return AgentResult(
                success=False,
                status=AgentExecutionStatus.FAILED,
                agent_id=self.agent_id,
                agent_version=self.version,
                run_id=request.run_id,
                errors=["No property data provided for ERA analysis."],
            )

        analyses: List[Dict[str, Any]] = []

        for prop in props:
            entity_id = prop.get("property_id", f"ent_{uuid.uuid4().hex[:8]}")
            fin = prop.get("financials", {})
            specs = prop.get("specs", {})

            price = fin.get("price")
            area = specs.get("area") or specs.get("carpet_area") or specs.get("built_up_area")
            rental_price = fin.get("rental_price")

            # 1. Metric: Price Per SqFt
            price_per_sqft_metric: Optional[AnalysisMetric] = None
            if price and area and area > 0:
                calc_val = round(price / area, 2)
                price_per_sqft_metric = AnalysisMetric(
                    metric_name="price_per_sqft",
                    value=calc_val,
                    unit="INR/sqft",
                    calculation_method="price / area",
                    input_values={"price": price, "area": area},
                    input_sources={"price": "financials.price", "area": "specs.area"},
                    assumptions=[
                        MetricAssumption(
                            assumption_name="area_basis",
                            assumption_value="built_up_or_carpet",
                            assumption_source="Property record specs",
                        )
                    ],
                    confidence=0.95,
                )

            # 2. Metric: Rental Yield
            rental_yield_metric: Optional[AnalysisMetric] = None
            if price and price > 0:
                if rental_price and rental_price > 0:
                    annual_rent = rental_price * 12.0
                    calc_yield = round((annual_rent / price) * 100.0, 2)
                    rental_yield_metric = AnalysisMetric(
                        metric_name="gross_rental_yield",
                        value=calc_yield,
                        unit="%",
                        calculation_method="(monthly_rent * 12) / purchase_price * 100",
                        input_values={"monthly_rent": rental_price, "purchase_price": price},
                        input_sources={"monthly_rent": "financials.rental_price", "purchase_price": "financials.price"},
                        assumptions=[
                            MetricAssumption(
                                assumption_name="full_occupancy",
                                assumption_value=1.0,
                                assumption_source="Standard gross yield formulation",
                            )
                        ],
                        confidence=0.90,
                    )
                else:
                    # Explicitly do NOT fabricate rental price
                    rental_yield_metric = AnalysisMetric(
                        metric_name="gross_rental_yield",
                        value=None,
                        unit="%",
                        calculation_method="NOT_CALCULATED",
                        input_values={"price": price},
                        assumptions=[
                            MetricAssumption(
                                assumption_name="rental_data_status",
                                assumption_value="MISSING",
                                assumption_source="No rental price present in listing evidence",
                            )
                        ],
                        confidence=None,
                    )

            analysis_id = f"era_{uuid.uuid4().hex[:12]}"
            analysis = RealEstateAnalysis(
                analysis_id=analysis_id,
                entity_id=entity_id,
                price_per_sqft=price_per_sqft_metric,
                rental_yield=rental_yield_metric,
                comparables=[],
                locality_analysis={
                    "status": "NOT_IMPLEMENTED",
                    "message": "Locality trend and macro-market indices will be connected in next data ingestion phase.",
                },
                confidence=0.92 if (price_per_sqft_metric and price_per_sqft_metric.value) else None,
                status="COMPLETED",
            )
            analyses.append(analysis.model_dump())

        return AgentResult(
            success=True,
            status=AgentExecutionStatus.SUCCESS,
            agent_id=self.agent_id,
            agent_version=self.version,
            run_id=request.run_id,
            data={
                "analyses": analyses,
                "total_analyzed": len(analyses),
            },
            metadata={"analyzer": "EraAgent"},
        )
