import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Bot, CheckCircle2, ShieldCheck, Cpu, Terminal, Clock, Activity, AlertCircle } from 'lucide-react'
import { getAgent, listAgentRuns } from '@/api/agents'
import { Skeleton, ErrorState, EmptyState } from '@/components/feedback/States'
import { AGENT_FLOW } from '@/lib/constants'
import { formatTimestamp, formatNumber } from '@/lib/format'

export function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()

  const {
    data: agent,
    isLoading: loadingAgent,
    error: agentError,
  } = useQuery({
    queryKey: ['agentDetail', id],
    queryFn: () => getAgent(id!),
    enabled: Boolean(id),
  })

  const {
    data: runs = [],
    isLoading: loadingRuns,
  } = useQuery({
    queryKey: ['agentRuns', id],
    queryFn: () => listAgentRuns(id!, { limit: 20 }),
    enabled: Boolean(id),
  })

  if (loadingAgent) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (agentError || !agent) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Link to="/admin/agents" className="inline-flex items-center gap-1 font-mono text-xs text-signal hover:underline">
          <ArrowLeft size={14} /> Back to Agents
        </Link>
        <ErrorState
          title="Agent Not Found"
          body={agentError instanceof Error ? agentError.message : `Agent with ID '${id}' is not registered.`}
        />
      </div>
    )
  }

  const pipelineIndex = AGENT_FLOW.indexOf(agent.agent_id as any)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        to="/admin/agents"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-signal hover:underline"
      >
        <ArrowLeft size={14} />
        Back to Agents Registry
      </Link>

      {/* Header */}
      <div className="border border-hairline bg-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 border border-hairline bg-surface-2 text-signal font-semibold">
                {agent.agent_id}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 border border-hairline bg-surface-2 text-muted">
                v{agent.version}
              </span>
            </div>
            <h1 className="font-display mt-2 text-3xl text-strong font-medium">{agent.name}</h1>
            <p className="text-sm text-muted mt-2 leading-relaxed max-w-2xl">{agent.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 font-mono text-xs border border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
              {agent.status}
            </span>
          </div>
        </div>

        {/* Pipeline position */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs border-t border-hairline pt-4 text-muted">
          <div>
            <span className="text-faint text-[10px] uppercase block">Pipeline Sequence</span>
            <span className="text-strong">
              {pipelineIndex >= 0 ? `Stage ${pipelineIndex + 1} of ${AGENT_FLOW.length}` : 'Orchestration'}
            </span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Registered Capabilities</span>
            <span className="text-strong">{agent.capabilities?.length || 0} contracts</span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Logged Runs</span>
            <span className="text-strong font-semibold">{runs.length} recent in DB</span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Execution Mode</span>
            <span className="text-strong">Deterministic</span>
          </div>
        </div>
      </div>

      {/* Responsibilities & Capabilities */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Capabilities List */}
        <div className="border border-hairline bg-surface p-5 space-y-3">
          <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase font-semibold">
            Registered Capabilities
          </p>
          <ul className="space-y-2 font-mono text-xs">
            {agent.capabilities?.map((cap, i) => (
              <li key={i} className="flex items-center gap-2 text-strong bg-surface-2 p-2 border border-hairline">
                <CheckCircle2 size={13} className="text-signal shrink-0" />
                <span>{cap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pipeline Placement */}
        <div className="border border-hairline bg-surface p-5 space-y-3">
          <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase font-semibold">
            Pipeline Orchestration Context
          </p>
          <p className="text-xs text-muted leading-relaxed">
            {agent.agent_id} executes within the deterministic ECHO intelligence pipeline. Individual agent invocations are triggered automatically by the orchestration engine. Manual standalone invocation is not exposed via the current API.
          </p>
          <div className="p-3 border border-hairline bg-bg font-mono text-xs text-muted space-y-1">
            <div className="flex justify-between">
              <span>Execution Trigger:</span>
              <span className="text-strong">ECHO-ORCHESTRATOR</span>
            </div>
            <div className="flex justify-between">
              <span>Target Persistence:</span>
              <span className="text-strong">PostgreSQL (agent_runs)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real Invocations & Execution Traces from PostgreSQL */}
      <div className="border border-hairline bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h3 className="font-display text-lg text-strong font-medium">Recent Invocation Traces</h3>
            <p className="text-xs text-muted">Chronological execution telemetry recorded in PostgreSQL for this agent.</p>
          </div>
          <span className="font-mono text-xs text-muted">
            {runs.length} invocations logged
          </span>
        </div>

        {loadingRuns ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : runs.length === 0 ? (
          <EmptyState
            title="No Invocations Recorded"
            body={`No execution runs for agent '${agent.agent_id}' have been committed yet.`}
          />
        ) : (
          <div className="overflow-x-auto border border-hairline bg-bg">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-surface-2 border-b border-hairline text-muted uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Investigation Run ID</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Duration</th>
                  <th className="p-2.5">Executed At</th>
                  <th className="p-2.5 text-right">Investigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {runs.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-2/60 transition-colors">
                    <td className="p-2.5 text-signal font-semibold">
                      <Link to={`/admin/investigations/${r.run_id}`} className="hover:underline">
                        {r.run_id}
                      </Link>
                    </td>
                    <td className="p-2.5">
                      <span className={`px-1.5 py-0.5 text-[10px] uppercase border ${
                        r.status === 'SUCCESS'
                          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                          : 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-muted">
                      {r.duration_ms != null ? `${r.duration_ms}ms` : '—'}
                    </td>
                    <td className="p-2.5 text-muted">
                      {r.start_time ? formatTimestamp(r.start_time) : '—'}
                    </td>
                    <td className="p-2.5 text-right">
                      <Link
                        to={`/admin/investigations/${r.run_id}`}
                        className="text-signal hover:underline inline-flex items-center gap-1 text-[11px]"
                      >
                        <span>View Pipeline</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
