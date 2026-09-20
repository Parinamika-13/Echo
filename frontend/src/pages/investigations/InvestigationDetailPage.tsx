import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, AlertTriangle, Clock, Bot, Sparkles, FileText, ChevronRight } from 'lucide-react'
import { getInvestigationRun, getStoredInvestigation } from '@/api/investigations'
import { Skeleton, ErrorState } from '@/components/feedback/States'
import { formatTimestamp, formatNumber } from '@/lib/format'
import { AGENT_FLOW } from '@/lib/constants'

export function InvestigationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'results' | 'telemetry'>('overview')

  const {
    data: investigation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['investigationRun', id],
    queryFn: async () => {
      try {
        return await getInvestigationRun(id!)
      } catch (err) {
        // Fallback to locally stored session investigation if available
        const local = getStoredInvestigation(id!)
        if (local) return local
        throw err
      }
    },
    enabled: Boolean(id),
  })

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !investigation) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Link to="/admin/investigations" className="inline-flex items-center gap-1 font-mono text-xs text-signal hover:underline">
          <ArrowLeft size={14} /> Back to Investigations
        </Link>
        <ErrorState
          title="Investigation Run Not Found"
          body={error instanceof Error ? error.message : `Run ID ${id} was not found.`}
        />
      </div>
    )
  }

  const executedSet = new Set(investigation.executed_agents || [])

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button */}
      <Link
        to="/admin/investigations"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-signal hover:underline"
      >
        <ArrowLeft size={14} />
        Back to Investigations
      </Link>

      {/* 20. Header */}
      <div className="border border-hairline bg-surface p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 border border-hairline bg-surface-2 text-signal">
                {investigation.run_id}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 border border-hairline bg-surface-2 text-muted">
                {investigation.workflow}
              </span>
            </div>
            <h1 className="font-display mt-2 text-3xl text-strong font-medium">Investigation Workspace</h1>
            <p className="text-sm text-muted mt-1">
              Coordinated multi-agent execution results, agent telemetry, and synthesized intelligence findings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 font-mono text-xs border ${
                investigation.status === 'COMPLETED'
                  ? 'border-health/40 text-health bg-health/10'
                  : 'border-signal/40 text-signal bg-signal/10'
              }`}
            >
              {investigation.status}
            </span>
          </div>
        </div>

        {/* Telemetry metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs border-t border-hairline pt-4 text-muted">
          <div>
            <span className="text-faint text-[10px] uppercase block">Started</span>
            <span className="text-strong">{formatTimestamp(investigation.created_at)}</span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Completed</span>
            <span className="text-strong">{formatTimestamp(investigation.completed_at)}</span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Pipeline Duration</span>
            <span className="text-strong">
              {investigation.duration_ms != null ? `${formatNumber(investigation.duration_ms / 1000, 2)}s` : '—'}
            </span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Agents Executed</span>
            <span className="text-strong">{investigation.executed_agents?.length || 0} agents</span>
          </div>
        </div>
      </div>

      {/* 20. Pipeline Flow Visual */}
      <div className="border border-hairline bg-surface p-5">
        <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase mb-3">
          Coordinated Pipeline Architecture
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {AGENT_FLOW.map((agentId, index) => {
            const isExecuted = executedSet.has(agentId)
            const isLast = index === AGENT_FLOW.length - 1
            return (
              <div key={agentId} className="flex items-center gap-2">
                <div
                  className={`px-2.5 py-1 border text-xs flex items-center gap-1.5 transition-colors ${
                    isExecuted
                      ? 'border-signal bg-signal/10 text-strong font-medium'
                      : 'border-hairline bg-surface-2 text-muted opacity-50'
                  }`}
                >
                  <Bot size={12} className={isExecuted ? 'text-signal' : 'text-faint'} />
                  <span>{agentId.replace('ECHO-', '')}</span>
                </div>
                {!isLast && <ChevronRight size={12} className="text-hairline shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-hairline flex gap-2">
        {[
          { key: 'overview', label: 'Summary Overview' },
          { key: 'pipeline', label: `Agent Executions (${investigation.executed_agents?.length || 0})` },
          { key: 'results', label: 'Synthesized Intelligence' },
          { key: 'telemetry', label: 'Warnings & Errors' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex min-h-11 items-center px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-signal text-strong font-medium bg-surface'
                : 'border-transparent text-muted hover:text-strong'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Section */}
      <div className="border border-hairline bg-surface p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-lg text-strong mb-1">Executive Summary</h3>
              <p className="text-sm text-muted">
                Synthesized intelligence rollup compiled upon completion of all pipeline stages.
              </p>
            </div>

            {Object.keys(investigation.summary || {}).length > 0 ? (
              <pre className="p-4 border border-hairline bg-surface-2 font-mono text-xs text-strong overflow-x-auto">
                {JSON.stringify(investigation.summary, null, 2)}
              </pre>
            ) : (
              <p className="text-xs text-muted font-mono italic">No structured rollup summary returned by this workflow.</p>
            )}
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg text-strong mb-1">Agent Telemetry & Outputs</h3>
              <p className="text-sm text-muted">
                Execution status, elapsed time, and structured payloads per participating agent.
              </p>
            </div>

            <div className="space-y-3">
              {Object.entries(investigation.agent_results || {}).map(([agentId, res]) => (
                <div key={agentId} className="border border-hairline bg-surface-2 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-strong">{agentId}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 border border-hairline text-muted">
                        v{res.agent_version}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-muted">{formatNumber(res.duration_ms, 1)}ms</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] border ${
                          res.success ? 'border-health/40 text-health' : 'border-risk/40 text-risk'
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>
                  </div>

                  {res.data && (
                    <details className="mt-2 text-xs">
                      <summary className="font-mono text-[10px] text-signal cursor-pointer uppercase tracking-wider">
                        Inspect Agent Output Payload
                      </summary>
                      <pre className="mt-2 p-3 bg-bg border border-hairline font-mono text-[11px] text-muted overflow-x-auto">
                        {JSON.stringify(res.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg text-strong mb-1">Synthesized Results</h3>
              <p className="text-sm text-muted">
                Actionable findings produced across the intelligence cycle.
              </p>
            </div>
            <pre className="p-4 border border-hairline bg-surface-2 font-mono text-xs text-strong overflow-x-auto">
              {JSON.stringify(
                {
                  workflow: investigation.workflow,
                  summary: investigation.summary,
                  warnings_count: investigation.warnings?.length || 0,
                  errors_count: investigation.errors?.length || 0,
                },
                null,
                2,
              )}
            </pre>
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg text-strong mb-1">Pipeline Warnings & Errors</h3>
              <p className="text-sm text-muted">
                Runtime anomalies, rate limits, or verification flags raised by pipeline agents.
              </p>
            </div>

            {investigation.warnings?.length === 0 && investigation.errors?.length === 0 ? (
              <p className="text-xs text-health font-mono py-4">No warnings or errors were logged for this run.</p>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {investigation.warnings?.map((w, i) => (
                  <div key={`w-${i}`} className="p-2.5 border border-signal/40 bg-signal/10 text-signal flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
                {investigation.errors?.map((err, i) => (
                  <div key={`e-${i}`} className="p-2.5 border border-risk/40 bg-risk/10 text-risk flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
