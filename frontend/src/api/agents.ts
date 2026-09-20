import { apiFetch, toQuery } from './client'
import type { AgentMetadata } from './types'

export type AgentRunTrace = {
  id: number
  run_id: string
  agent_id: string
  agent_version: string
  status: string
  start_time: string | null
  end_time: string | null
  duration_ms: number | null
  errors: string[]
  warnings: string[]
}

export type AgentTelemetrySummary = {
  total_runs: number
  success_count: number
  failure_count: number
  success_rate: number
  avg_duration_ms: number
  by_agent: Record<
    string,
    {
      agent_id: string
      runs: number
      avg_duration_ms: number
      last_status: string
      last_run_at: string | null
      last_run_id: string | null
    }
  >
  recent_runs: AgentRunTrace[]
}

export function listAgents() {
  return apiFetch<AgentMetadata[]>('/agents')
}

export function getAgent(agentId: string) {
  return apiFetch<AgentMetadata>(`/agents/${encodeURIComponent(agentId)}`)
}

export function getAgentsTelemetrySummary() {
  return apiFetch<AgentTelemetrySummary>('/agents/telemetry/summary')
}

export function listAgentRuns(agentId: string, params?: { limit?: number; offset?: number }) {
  return apiFetch<AgentRunTrace[]>(`/agents/${encodeURIComponent(agentId)}/runs${toQuery(params || {})}`)
}
