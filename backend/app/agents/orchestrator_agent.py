"""ECHO Agent 01: ECHO Orchestrator Agent."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from backend.app.agents.base_agent import BaseAgent
from backend.app.agents.registry import registry
from backend.app.schemas.agent import (
    AgentExecutionStatus,
    AgentRequest,
    AgentResult,
)
from backend.app.schemas.investigation import (
    InvestigationRequest,
    InvestigationResult,
    InvestigationStatus,
    WorkflowType,
)
from backend.app.utils.ids import generate_run_id
from backend.app.utils.timestamps import duration_ms, utc_now


# Workflow pipelines specifying ordered agent execution stages
WORKFLOW_PIPELINES: Dict[WorkflowType, List[str]] = {
    WorkflowType.PROPERTY_DISCOVERY: [
        "ECHO-PSA-SOURCE",
        "ECHO-PSA-DOC",
        "ECHO-PSA-EXTRACT",
        "ECHO-PSA-ENTITY",
        "ECHO-SVEA",
        "ECHO-SSR",
    ],
    WorkflowType.INVESTMENT_ANALYSIS: [
        "ECHO-ERA",
        "ECHO-ISDAA",
        "ECHO-SVEA",
        "ECHO-RSA",
        "ECHO-SSR",
    ],
    WorkflowType.SIGNAL_ANALYSIS: [
        "ECHO-PSA-SOURCE",
        "ECHO-PSA-DOC",
        "ECHO-PSA-EXTRACT",
        "ECHO-SIGNAL",
        "ECHO-SVEA",
        "ECHO-RSA",
        "ECHO-SSR",
    ],
    WorkflowType.PROPERTY_ANALYSIS: [
        "ECHO-PSA-EXTRACT",
        "ECHO-PSA-ENTITY",
        "ECHO-ERA",
        "ECHO-SVEA",
        "ECHO-RSA",
        "ECHO-SSR",
    ],
    WorkflowType.RISK_ANALYSIS: [
        "ECHO-SVEA",
        "ECHO-RSA",
        "ECHO-SSR",
    ],
    WorkflowType.FULL_ANALYSIS: [
        "ECHO-PSA-SOURCE",
        "ECHO-PSA-DOC",
        "ECHO-PSA-EXTRACT",
        "ECHO-PSA-ENTITY",
        "ECHO-SIGNAL",
        "ECHO-ERA",
        "ECHO-ISDAA",
        "ECHO-SVEA",
        "ECHO-RSA",
        "ECHO-SSR",
    ],
}


class EchoOrchestratorAgent(BaseAgent):
    """Agent 01: Master Orchestrator coordinating all ECHO intelligence agents and workflows."""

    agent_id: str = "ECHO-ORCH"
    name: str = "ECHO Orchestrator Agent"
    version: str = "0.1.0"
    description: str = (
        "Coordinates multi-agent workflows, dispatches tasks in dependency order, passes typed "
        "evidence/data contexts, and monitors pipeline execution health."
    )
    capabilities: List[str] = [
        "workflow_orchestration",
        "conditional_dispatch",
        "context_propagation",
        "fault_tolerance",
        "pipeline_aggregation",
    ]

    def validate_input(self, request: AgentRequest) -> bool:
        if not super().validate_input(request):
            return False
        # Valid if parameters contain workflow specification or request options
        return True

    def _run(self, request: AgentRequest) -> AgentResult:
        """Standard AgentResult wrapper if called directly via BaseAgent.execute()."""
        raw_inv_req = request.parameters.get("investigation_request")
        if raw_inv_req:
            inv_req = InvestigationRequest(**raw_inv_req)
        else:
            inv_req = InvestigationRequest(
                workflow=WorkflowType(request.parameters.get("workflow", WorkflowType.FULL_ANALYSIS.value)),
                source_urls=request.parameters.get("source_urls", []),
                query=request.parameters.get("query"),
                options=request.parameters.get("options", {}),
            )

        inv_result = self.execute_workflow(inv_req, run_id=request.run_id)
        return AgentResult(
            success=inv_result.status != InvestigationStatus.FAILED,
            status=(
                AgentExecutionStatus.SUCCESS
                if inv_result.status == InvestigationStatus.COMPLETED
                else AgentExecutionStatus.PARTIAL_SUCCESS
            ),
            agent_id=self.agent_id,
            agent_version=self.version,
            run_id=request.run_id,
            data=inv_result.model_dump(),
            metadata={"workflow": inv_result.workflow.value},
        )

    def execute_workflow(
        self,
        investigation: InvestigationRequest,
        run_id: Optional[str] = None,
    ) -> InvestigationResult:
        """Executes a multi-agent pipeline workflow end-to-end with typed data passing."""
        active_run_id = run_id or generate_run_id("echo_inv")
        start_time = utc_now()
        workflow_type = investigation.workflow

        pipeline = WORKFLOW_PIPELINES.get(workflow_type, WORKFLOW_PIPELINES[WorkflowType.FULL_ANALYSIS])
        executed_agents: List[str] = []
        agent_results: Dict[str, AgentResult] = {}
        shared_context: Dict[str, Any] = {
            "run_id": active_run_id,
            "workflow": workflow_type.value,
            "query": investigation.query,
            "options": investigation.options,
        }

        # Seed initial parameters into context
        if investigation.source_urls:
            shared_context["source_urls"] = investigation.source_urls
        if investigation.property_id:
            shared_context["property_id"] = investigation.property_id
        if "raw_content" in investigation.options:
            shared_context["raw_content"] = investigation.options["raw_content"]

        all_warnings: List[str] = []
        all_errors: List[str] = []

        self.logger.info(f"Orchestrator starting {workflow_type.value} pipeline [{active_run_id}] with {len(pipeline)} agents.")

        for agent_id in pipeline:
            agent = registry.get_agent(agent_id)
            if not agent:
                err_msg = f"Required agent {agent_id} is not registered in AgentRegistry."
                self.logger.error(err_msg)
                all_errors.append(err_msg)
                continue

            # Build typed AgentRequest with current accumulated pipeline context
            agent_req = AgentRequest(
                run_id=active_run_id,
                agent_id=agent_id,
                parameters=dict(shared_context),
                context=dict(shared_context),
            )

            # Execute agent safely
            res = agent.execute(agent_req)
            executed_agents.append(agent_id)
            agent_results[agent_id] = res

            if res.warnings:
                all_warnings.extend([f"[{agent_id}] {w}" for w in res.warnings])
            if res.errors:
                all_errors.extend([f"[{agent_id}] {e}" for e in res.errors])

            # Conditional pipeline decision: Stop if critical early stage completely failed
            if not res.success and agent_id in ("ECHO-PSA-SOURCE", "ECHO-PSA-DOC") and not shared_context.get("raw_content"):
                self.logger.warning(f"Early stage {agent_id} failed; continuing with partial context.")

            # Accumulate typed outputs into shared pipeline context for downstream agents
            if res.data:
                for k, v in res.data.items():
                    shared_context[k] = v

        # Determine overall investigation status
        status = InvestigationStatus.COMPLETED
        if all_errors and not any(r.success for r in agent_results.values()):
            status = InvestigationStatus.FAILED
        elif all_errors or any(r.status == AgentExecutionStatus.PARTIAL_SUCCESS for r in agent_results.values()):
            status = InvestigationStatus.PARTIAL_SUCCESS

        end_time = utc_now()
        total_duration = duration_ms(start_time, end_time)

        # Build final rollup summary
        summary = {
            "total_agents_run": len(executed_agents),
            "canonical_properties_count": len(shared_context.get("canonical_properties", [])),
            "signals_minted_count": len(shared_context.get("signals", [])),
            "analyses_count": len(shared_context.get("analyses", [])),
            "validation_status": shared_context.get("status", "NOT_PERFORMED"),
            "risk_rating": (shared_context.get("overall_risk_rating") or "NOT_CALCULATED"),
        }

        return InvestigationResult(
            run_id=active_run_id,
            workflow=workflow_type,
            status=status,
            created_at=start_time,
            completed_at=end_time,
            duration_ms=total_duration,
            executed_agents=executed_agents,
            agent_results=agent_results,
            summary=summary,
            warnings=all_warnings,
            errors=all_errors,
        )
