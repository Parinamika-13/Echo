import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bot, Eye, Activity, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import { listAgents, getAgentsTelemetrySummary } from '@/api/agents'
import { AgentConstellation } from '@/components/echo/AgentConstellation'
import { Skeleton, ErrorState } from '@/components/feedback/States'
import { formatNumber, formatTimestamp } from '@/lib/format'

export function AgentsPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>()

  const { data: agents, isLoading: loadingAgents, error: agentsError, refetch: refetchAgents } = useQuery({
    queryKey: ['agentsList'],
    queryFn: listAgents,
  })

  const { data: telemetry, isLoading: loadingTelemetry } = useQuery({
    queryKey: ['adminAgentsTelemetry'],
    queryFn: getAgentsTelemetrySummary,
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-hairline pb-5 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] tracking-[0.28em] text-signal uppercase font-semibold">
              Pipeline Architecture
            </span>
            <span className="font-mono text-[9px] px-1.5 py-0.2 border border-amber-500/40 bg-amber-500/10 text-amber-400 uppercase font-semibold">
              Admin Observability
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-strong font-medium">Autonomous Agents</h1>
          <p className="mt-1 text-sm text-muted">
            Inspect capability contracts, real PostgreSQL invocation telemetry, and execution logs for all 11 registered ECHO intelligence agents.
          </p>
        </div>
        <div className="font-mono text-xs text-muted">
          Active agents: <span className="text-strong font-semibold">{formatNumber(agents?.length)}</span>
        </div>
      </div>

      {/* Real Pipeline Telemetry Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-hairline bg-surface p-4 space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="font-mono text-[10px] tracking-wider uppercase">Logged Executions</span>
            <Activity size={14} className="text-signal" />
          </div>
          {loadingTelemetry ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <p className="font-mono text-2xl text-strong font-semibold">
              {formatNumber(telemetry?.total_runs)}
            </p>
          )}
          <p className="font-mono text-[10px] text-muted">PostgreSQL agent_runs records</p>
        </div>

        <div className="border border-hairline bg-surface p-4 space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="font-mono text-[10px] tracking-wider uppercase">Pipeline Success Rate</span>
            <CheckCircle2 size={14} className="text-emerald-400" />
          </div>
          {loadingTelemetry ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <p className="font-mono text-2xl text-emerald-400 font-semibold">
              {telemetry ? `${telemetry.success_rate}%` : '—'}
            </p>
          )}
          <p className="font-mono text-[10px] text-muted">Deterministic validation passes</p>
        </div>

        <div className="border border-hairline bg-surface p-4 space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="font-mono text-[10px] tracking-wider uppercase">Average Duration</span>
            <Clock size={14} className="text-signal" />
          </div>
          {loadingTelemetry ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <p className="font-mono text-2xl text-strong font-semibold">
              {telemetry ? `${formatNumber(telemetry.avg_duration_ms, 0)}ms` : '—'}
            </p>
          )}
          <p className="font-mono text-[10px] text-muted">Per agent execution</p>
        </div>
      </div>

      {/* Constellation Section */}
      <section className="space-y-3">
        <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Visual Constellation Topology</p>
        {loadingAgents ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <AgentConstellation
            agents={agents || []}
            selectedId={selectedAgentId}
            onSelect={setSelectedAgentId}
          />
        )}
      </section>

      {/* Table Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Agent Observability &amp; Invocations</p>
          <span className="font-mono text-[10px] text-muted italic">Read-only monitoring surface</span>
        </div>

        {agentsError ? (
          <ErrorState
            title="Failed to load agents"
            body={agentsError instanceof Error ? agentsError.message : 'Unknown network failure.'}
            onRetry={() => refetchAgents()}
          />
        ) : loadingAgents ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto border border-hairline bg-surface">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-surface-2 border-b border-hairline text-muted uppercase text-[10px]">
                <tr>
                  <th className="p-3">Agent ID</th>
                  <th className="p-3">Agent Name</th>
                  <th className="p-3">Version</th>
                  <th className="p-3">Invocations</th>
                  <th className="p-3">Avg Duration</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Run</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {(agents || []).map((agent) => {
                  const agentStat = telemetry?.by_agent?.[agent.agent_id]
                  return (
                    <tr key={agent.agent_id} className="hover:bg-surface-2/40 transition-colors">
                      <td className="p-3 font-semibold text-strong">
                        <Link to={`/admin/agents/${agent.agent_id}`} className="hover:text-signal text-signal">
                          {agent.agent_id}
                        </Link>
                      </td>
                      <td className="p-3 font-sans font-medium text-strong">{agent.name}</td>
                      <td className="p-3 text-muted">v{agent.version}</td>
                      <td className="p-3 text-strong">
                        {agentStat ? formatNumber(agentStat.runs) : '0'}
                      </td>
                      <td className="p-3 text-muted">
                        {agentStat ? `${agentStat.avg_duration_ms}ms` : '—'}
                      </td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px] uppercase">
                          {agentStat?.last_status || agent.status || 'READY'}
                        </span>
                      </td>
                      <td className="p-3 text-muted text-[11px]">
                        {agentStat?.last_run_at ? formatTimestamp(agentStat.last_run_at) : '—'}
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          to={`/admin/agents/${agent.agent_id}`}
                          className="inline-flex min-h-11 items-center gap-1 border border-hairline px-2.5 py-1 text-signal hover:border-signal"
                        >
                          <Eye size={12} />
                          <span>Dossier</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
