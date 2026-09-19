"""ECHO Agent 08: ISDAA — Investment & Scenario Decision Analysis Agent."""

import uuid
from typing import Any, Dict, List, Optional

from backend.app.agents.base_agent import BaseAgent
from backend.app.schemas.agent import (
    AgentExecutionStatus,
    AgentRequest,
    AgentResult,
)
from backend.app.schemas.investment import (
    FinancialAssumption,
    InvestmentAnalysis,
    InvestmentScenario,
    ScenarioType,
)
from backend.app.utils.timestamps import utc_now


def compute_scenario(
    scenario_type: ScenarioType,
    purchase_price: float,
    equity_pct: float,
    interest_rate: float,
    loan_term_years: int,
    monthly_rent: float,
    capital_growth_rate: float,
    holding_period_years: int,
    stamp_duty_pct: float = 0.06,
    maintenance_pct: float = 0.01,
) -> InvestmentScenario:
    """Deterministic calculation of financial scenario preserving complete calculation lineage."""
    down_payment = purchase_price * equity_pct
    loan_amount = purchase_price * (1.0 - equity_pct)
    transaction_costs = purchase_price * stamp_duty_pct
    total_investment = down_payment + transaction_costs

    # Annual debt service (simplified standard amortization approximation)
    annual_mortgage = 0.0
    if loan_amount > 0 and interest_rate > 0:
        monthly_rate = (interest_rate / 100.0) / 12.0
        n_months = loan_term_years * 12
        monthly_payment = loan_amount * (monthly_rate * (1 + monthly_rate) ** n_months) / ((1 + monthly_rate) ** n_months - 1)
        annual_mortgage = monthly_payment * 12.0

    annual_gross_rent = monthly_rent * 12.0
    annual_operating_costs = purchase_price * maintenance_pct
    annual_cash_flow = annual_gross_rent - annual_mortgage - annual_operating_costs

    # Projected terminal value after holding period
    terminal_value = purchase_price * ((1.0 + capital_growth_rate / 100.0) ** holding_period_years)
    total_appreciation = terminal_value - purchase_price
    cumulative_cash_flow = annual_cash_flow * holding_period_years
    estimated_return = total_appreciation + cumulative_cash_flow

    roi = round((estimated_return / total_investment) * 100.0, 2) if total_investment > 0 else 0.0
    net_yield = round((annual_gross_rent / purchase_price) * 100.0, 2) if purchase_price > 0 else 0.0

    assumptions = [
        FinancialAssumption(name="stamp_duty_rate", value=stamp_duty_pct * 100, unit="%", source="Statutory state norm"),
        FinancialAssumption(name="annual_capital_growth", value=capital_growth_rate, unit="%", source=f"{scenario_type.value} market model"),
        FinancialAssumption(name="maintenance_allowance", value=maintenance_pct * 100, unit="%", source="Industry benchmark"),
        FinancialAssumption(name="mortgage_interest_rate", value=interest_rate, unit="%", source=f"{scenario_type.value} financing benchmark"),
    ]

    breakdown = {
        "formula_total_investment": "down_payment + transaction_costs",
        "formula_annual_cash_flow": "annual_gross_rent - annual_mortgage - annual_operating_costs",
        "formula_estimated_return": "terminal_appreciation + cumulative_cash_flow",
        "formula_roi": "(estimated_return / total_investment) * 100",
        "terminal_property_value": round(terminal_value, 2),
        "cumulative_cash_flow": round(cumulative_cash_flow, 2),
    }

    return InvestmentScenario(
        scenario_type=scenario_type,
        purchase_price=purchase_price,
        down_payment=round(down_payment, 2),
        loan_amount=round(loan_amount, 2),
        loan_rate=interest_rate,
        loan_term_years=loan_term_years,
        monthly_rent=monthly_rent,
        annual_growth_rate=capital_growth_rate,
        holding_period_years=holding_period_years,
        transaction_costs=round(transaction_costs, 2),
        annual_cash_flow=round(annual_cash_flow, 2),
        total_investment=round(total_investment, 2),
        estimated_return=round(estimated_return, 2),
        net_yield=net_yield,
        roi=roi,
        assumptions=assumptions,
        breakdown=breakdown,
    )


class IsdaaAgent(BaseAgent):
    """Agent 08: Compiles multi-scenario investment projections with fully transparent formulas."""

    agent_id: str = "ECHO-ISDAA"
    name: str = "ISDAA — Investment & Scenario Decision Analysis Agent"
    version: str = "0.1.0"
    description: str = (
        "Calculates multi-scenario investment projections (Base, Conservative, Optimistic) "
        "exposing INPUT -> FORMULA -> ASSUMPTION -> RESULT."
    )
    capabilities: List[str] = [
        "scenario_modeling",
        "cash_flow_projection",
        "roi_calculation",
        "holding_period_analysis",
        "transparent_assumptions",
    ]

    def validate_input(self, request: AgentRequest) -> bool:
        if not super().validate_input(request):
            return False
        # Needs purchase_price or property data with price
        params = request.parameters
        ctx = request.context
        price = params.get("purchase_price") or params.get("price")
        if not price:
            prop = params.get("property") or ctx.get("property") or {}
            price = prop.get("financials", {}).get("price")
            if not price and (params.get("canonical_properties") or ctx.get("canonical_properties")):
                cands = params.get("canonical_properties") or ctx.get("canonical_properties")
                if cands and isinstance(cands, list):
                    price = cands[0].get("financials", {}).get("price")
        return bool(price is not None and float(price) > 0)

    def _run(self, request: AgentRequest) -> AgentResult:
        params = request.parameters
        ctx = request.context

        # Determine price
        price = params.get("purchase_price") or params.get("price")
        prop_id = params.get("property_id") or "ent_default"
        monthly_rent = params.get("monthly_rent", 0.0)

        if not price:
            prop = params.get("property") or ctx.get("property") or {}
            price = prop.get("financials", {}).get("price")
            prop_id = prop.get("property_id", prop_id)
            monthly_rent = prop.get("financials", {}).get("rental_price") or monthly_rent
            if not price and (params.get("canonical_properties") or ctx.get("canonical_properties")):
                props = params.get("canonical_properties") or ctx.get("canonical_properties")
                if props:
                    price = props[0].get("financials", {}).get("price")
                    prop_id = props[0].get("property_id", prop_id)
                    monthly_rent = props[0].get("financials", {}).get("rental_price") or monthly_rent

        purchase_price = float(price)
        rent = float(monthly_rent or (purchase_price * 0.0025))  # 3% annual rent benchmark fallback

        # 1. BASE SCENARIO
        base_scenario = compute_scenario(
            scenario_type=ScenarioType.BASE,
            purchase_price=purchase_price,
            equity_pct=0.20,
            interest_rate=8.5,
            loan_term_years=20,
            monthly_rent=rent,
            capital_growth_rate=5.0,
            holding_period_years=5,
        )

        # 2. CONSERVATIVE SCENARIO
        conservative_scenario = compute_scenario(
            scenario_type=ScenarioType.CONSERVATIVE,
            purchase_price=purchase_price,
            equity_pct=0.25,
            interest_rate=9.5,
            loan_term_years=20,
            monthly_rent=rent * 0.90,  # 10% rent discount / higher vacancy
            capital_growth_rate=3.0,
            holding_period_years=5,
        )

        # 3. OPTIMISTIC SCENARIO
        optimistic_scenario = compute_scenario(
            scenario_type=ScenarioType.OPTIMISTIC,
            purchase_price=purchase_price,
            equity_pct=0.20,
            interest_rate=8.0,
            loan_term_years=20,
            monthly_rent=rent * 1.10,
            capital_growth_rate=7.5,
            holding_period_years=5,
        )

        inv_analysis = InvestmentAnalysis(
            investment_id=f"inv_{uuid.uuid4().hex[:12]}",
            entity_id=prop_id,
            scenarios={
                ScenarioType.BASE.value: base_scenario,
                ScenarioType.CONSERVATIVE.value: conservative_scenario,
                ScenarioType.OPTIMISTIC.value: optimistic_scenario,
            },
            status="COMPLETED",
        )

        return AgentResult(
            success=True,
            status=AgentExecutionStatus.SUCCESS,
            agent_id=self.agent_id,
            agent_version=self.version,
            run_id=request.run_id,
            data=inv_analysis.model_dump(),
            metadata={"analyzer": "IsdaaAgent", "scenarios_computed": 3},
        )
