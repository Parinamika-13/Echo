"""ECHO Investment Analysis (ISDAA) Schemas."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from backend.app.utils.timestamps import utc_now


class ScenarioType(str, Enum):
    """Scenario types for investment models."""
    BASE = "BASE"
    CONSERVATIVE = "CONSERVATIVE"
    OPTIMISTIC = "OPTIMISTIC"


class FinancialAssumption(BaseModel):
    """Explicit financial modeling assumption."""
    name: str = Field(..., description="Assumption name, e.g. vacancy_rate")
    value: Any = Field(..., description="Assumed numeric or rate value")
    unit: str = Field(default="", description="Unit, e.g. %, years, INR")
    source: str = Field(default="MARKET_BENCHMARK", description="Source or rationale for assumption")
    rationale: Optional[str] = None


class InvestmentScenario(BaseModel):
    """Scenario-based financial projections with explicit parameter tracing."""
    scenario_type: ScenarioType = Field(..., description="Scenario classification")
    purchase_price: float = Field(..., description="Acquisition purchase price")
    down_payment: float = Field(..., description="Initial equity capital deployed")
    loan_amount: float = Field(default=0.0, description="Financed mortgage capital")
    loan_rate: float = Field(default=0.0, description="Annual interest rate percentage")
    loan_term_years: int = Field(default=20, description="Mortgage tenure in years")
    monthly_rent: float = Field(default=0.0, description="Projected monthly rental revenue")
    annual_growth_rate: float = Field(default=0.0, description="Expected annual capital appreciation %")
    holding_period_years: int = Field(default=5, description="Investment horizon in years")
    transaction_costs: float = Field(default=0.0, description="Stamp duty, registration, legal fees")
    annual_cash_flow: Optional[float] = Field(default=None, description="Net operating annual cashflow")
    total_investment: Optional[float] = Field(default=None, description="Total capital deployed")
    estimated_return: Optional[float] = Field(default=None, description="Total projected net profit")
    net_yield: Optional[float] = Field(default=None, description="Net rental yield percentage")
    roi: Optional[float] = Field(default=None, description="Return on investment percentage")
    assumptions: List[FinancialAssumption] = Field(default_factory=list)
    breakdown: Dict[str, Any] = Field(default_factory=dict, description="Step-by-step calculation trace")


class InvestmentAnalysis(BaseModel):
    """Complete investment scenario package compiled by ISDAA."""
    investment_id: str = Field(..., description="Unique investment analysis ID")
    entity_id: str = Field(..., description="Target property ID")
    scenarios: Dict[str, InvestmentScenario] = Field(default_factory=dict)
    break_even_years: Optional[float] = Field(default=None)
    sensitivity_analysis: Dict[str, Any] = Field(default_factory=dict)
    status: str = Field(default="COMPLETED")
    created_at: datetime = Field(default_factory=utc_now)
    metadata: Dict[str, Any] = Field(default_factory=dict)
