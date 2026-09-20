import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Terminal,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Cpu,
  ArrowRight,
} from 'lucide-react'
import { getInvestigation } from '@/api/investigations'
import { Skeleton, ErrorState } from '@/components/feedback/States'

const PIPELINE_NODES = [
  { id: 'SOURCE', name: 'Source Discovery', agent: 'ECHO-PSA-SOURCE' },
  { id: 'DOCUMENT', name: 'Document Processing', agent: 'ECHO-PSA-DOC' },
  { id: 'EXTRACT', name: 'Fact Extraction', agent: 'ECHO-PSA-EXTRACT' },
  { id: 'ENTITY', name: 'Entity Resolution', agent: 'ECHO-PSA-ENTITY' },
  { id: 'SIGNAL', name: 'Signal Detection', agent: 'ECHO-SIGNAL' },
  { id: 'ERA', name: 'Real Estate Analysis', agent: 'ECHO-ERA' },
  { id: 'ISDAA', name: 'Investment Analysis', agent: 'ECHO-ISDAA' },
  { id: 'SVEA', name: 'Scenario Valuation', agent: 'ECHO-SVEA' },
  { id: 'RSA', name: 'Risk Synthesis', agent: 'ECHO-RSA' },
  { id: 'SSR', name: 'Reporting & Audit', agent: 'ECHO-SSR' },
]

export function UserInvestigationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  const { data: run, isLoading, error } = useQuery({
    queryKey: ['user-inv-detail', id],
    queryFn: () => getInvestigation(id || ''),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const current = query.state.data
      return current?.status === 'RUNNING' ? 2000 : false
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !run) {
    return (
      <div className="space-y-4">
        <Link to="/app/investigations" className="text-xs font-mono text-signal hover:underline inline-flex items-center gap-1">
          <ArrowLeft size={13} /> Back to Investigations
        </Link>
        <ErrorState message={`Could not load investigation '${id}'.`} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
        {/* Back and Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/investigations"
          className="text-xs font-mono text-muted hover:text-strong transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={13} />
          <span>Back to Investigations</span>
        </Link>

        {((run as any).entity_id || (run.summary as any)?.entity_id) && (
          <Link
            to={`/app/entities/${(run as any).entity_id || (run.summary as any)?.entity_id}`}
            className="text-xs font-mono text-signal hover:underline inline-flex items-center gap-1"
          >
            <span>Target Entity: {(run as any).entity_id || (run.summary as any)?.entity_id}</span> &rarr;
          </Link>
        )}
      </div>

      {/* Header */}
      <div className="border border-hairline bg-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-signal font-semibold">{run.run_id}</span>
              <span className="text-muted">&bull;</span>
              <span
                className={`uppercase px-2 py-0.5 border text-[10px] font-semibold ${
                  run.status === 'COMPLETED'
                    ? 'border-gain/30 bg-gain/10 text-gain'
                    : run.status === 'FAILED'
                    ? 'border-loss/30 bg-loss/10 text-loss'
                    : 'border-signal/40 bg-signal/10 text-signal animate-pulse'
                }`}
              >
                {run.status}
              </span>
            </div>
            <h1 className="text-2xl font-display font-medium text-strong mt-1">
              Autonomous Investigation &bull; {(run as any).entity_id || (run.summary as any)?.entity_id || run.workflow}
            </h1>
          </div>

          <div className="font-mono text-xs text-muted border border-hairline bg-bg p-2.5">
            <span>Started: {run.created_at ? new Date(run.created_at).toLocaleTimeString() : 'Active'}</span>
          </div>
        </div>
      </div>

      {/* Investigation Pipeline Visualizer (Section 16) */}
      <div className="border border-hairline bg-surface p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold font-display text-strong uppercase tracking-wider">
            Sequential Investigation Pipeline
          </h2>
          <p className="text-xs text-muted font-mono mt-0.5">
            Deterministic lineage execution through the 10 core analytical agents. Click any node to inspect role.
          </p>
        </div>

        {/* Orchestrator Root */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => setSelectedAgent('ECHO-ORCH')}
            className={`px-5 py-2.5 border font-mono text-xs uppercase font-semibold transition-colors ${
              selectedAgent === 'ECHO-ORCH'
                ? 'border-signal bg-signal/20 text-strong'
                : 'border-hairline bg-surface-2 text-strong hover:border-signal/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-signal" />
              <span>ORCHESTRATOR (ECHO-ORCH)</span>
            </div>
          </button>
          <div className="h-6 w-px bg-signal/50 my-1" />
        </div>

        {/* Pipeline Nodes Flow */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs">
          {PIPELINE_NODES.map((node, idx) => {
            const isSelected = selectedAgent === node.agent
            const hasRun = (run.executed_agents || []).includes(node.agent) || Boolean(run.agent_results?.[node.agent])
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedAgent(node.agent)}
                className={`p-3 border text-left flex flex-col justify-between transition-colors ${
                  isSelected
                    ? 'border-signal bg-signal/15 text-strong'
                    : 'border-hairline bg-bg text-muted hover:text-strong hover:border-signal/40'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] pb-1 border-b border-hairline">
                  <span className="font-semibold text-signal">{idx + 1}. {node.id}</span>
                  {hasRun && <span className="text-gain">&check;</span>}
                </div>
                <p className="text-xs font-semibold text-strong mt-2">{node.name}</p>
                <p className="text-[10px] text-muted mt-1 truncate">{node.agent}</p>
              </button>
            )
          })}
        </div>

        {/* Selected Agent Inspector Panel */}
        {selectedAgent && (
          <div className="p-4 border border-signal/40 bg-signal/10 font-mono text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-strong uppercase">Active Inspector: {selectedAgent}</span>
              <button
                type="button"
                onClick={() => setSelectedAgent(null)}
                className="text-muted hover:text-strong text-[11px]"
              >
                Close &times;
              </button>
            </div>
            <p className="text-muted text-[11px] leading-relaxed">
              Agent {selectedAgent} verified against the autonomous multi-agent registry. Execution telemetry and step output are logged in the cryptographic SSR audit trail.
            </p>
          </div>
        )}
      </div>

      {/* Execution Telemetry Steps */}
      <div className="border border-hairline bg-surface p-6 space-y-4">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-strong">
          Recorded Execution Steps
        </h3>

        {Object.keys(run.agent_results || {}).length === 0 && (run.executed_agents || []).length === 0 ? (
          <p className="text-xs font-mono text-muted">No discrete agent telemetry records logged for this run.</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(run.agent_results || {}).map(([agentKey, res]) => (
              <div
                key={agentKey}
                className="p-3 border border-hairline bg-bg flex items-center justify-between font-mono text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-signal font-semibold">{res.agent_id || agentKey}</span>
                  <span className="text-muted text-[11px]">
                    {res.duration_ms ? `${res.duration_ms.toFixed(0)}ms` : ''}
                    {res.confidence != null ? ` • ${(res.confidence * 100).toFixed(0)}% conf` : ''}
                  </span>
                </div>

                <span
                  className={`text-[10px] uppercase font-semibold px-2 py-0.5 border ${
                    res.status === 'COMPLETED' || res.success
                      ? 'border-gain/40 text-gain bg-gain/10'
                      : 'border-signal text-signal bg-signal/10'
                  }`}
                >
                  {res.status || (res.success ? 'COMPLETED' : 'PENDING')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
