import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  RotateCw,
  Server,
  Database,
  Bot,
  Terminal,
  Fingerprint,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Activity,
  Layers,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react'
import { getHealth } from '@/api/health'
import { listAgents, getAgentsTelemetrySummary } from '@/api/agents'
import { inspectDataset } from '@/api/datasets'
import { listInvestigations } from '@/api/investigations'
import { listAuditRecords } from '@/api/audit'
import { listUsers } from '@/api/users'
import { AgentConstellation } from '@/components/echo/AgentConstellation'
import { Skeleton, ErrorState } from '@/components/feedback/States'
import { formatNumber, formatTimestamp } from '@/lib/format'

export function DashboardPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>()

  // 1. Health & Database Connectivity
  const {
    data: healthData,
    isLoading: loadingHealth,
    dataUpdatedAt: healthUpdatedAt,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: getHealth,
    staleTime: 30_000,
  })

  // 2. Agent Telemetry Summary (Aggregated across PostgreSQL agent_runs table)
  const {
    data: telemetryData,
    isLoading: loadingTelemetry,
    dataUpdatedAt: telemetryUpdatedAt,
    refetch: refetchTelemetry,
  } = useQuery({
    queryKey: ['adminAgentsTelemetry'],
    queryFn: getAgentsTelemetrySummary,
    staleTime: 30_000,
  })

  // 3. Registered Agents Catalogue
  const {
    data: agentsData = [],
    isLoading: loadingAgents,
    refetch: refetchAgents,
  } = useQuery({
    queryKey: ['adminRegisteredAgents'],
    queryFn: listAgents,
    staleTime: 60_000,
  })

  // 4. Investigations Throughput (PostgreSQL investigations table)
  const {
    data: investigationsData,
    isLoading: loadingInvestigations,
    dataUpdatedAt: investigationsUpdatedAt,
    refetch: refetchInvestigations,
  } = useQuery({
    queryKey: ['adminInvestigationsThroughput'],
    queryFn: () => listInvestigations({ limit: 10 }),
    staleTime: 30_000,
  })

  // 5. Ingestion & Dataset State
  const {
    data: datasetData,
    isLoading: loadingDataset,
    refetch: refetchDataset,
  } = useQuery({
    queryKey: ['adminDatasetInspect'],
    queryFn: () => inspectDataset(),
    staleTime: 60_000,
  })

  // 6. Audit Records Ledger (PostgreSQL audit_records table)
  const {
    data: auditData,
    isLoading: loadingAudit,
    dataUpdatedAt: auditUpdatedAt,
    refetch: refetchAudit,
  } = useQuery({
    queryKey: ['adminAuditRecent'],
    queryFn: () => listAuditRecords({ limit: 8 }),
    staleTime: 30_000,
  })

  // 7. System User Roster (PostgreSQL users table)
  const {
    data: usersData = [],
    isLoading: loadingUsers,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['adminUsersList'],
    queryFn: listUsers,
    staleTime: 60_000,
  })

  const latestTimestamp = Math.max(
    healthUpdatedAt || 0,
    telemetryUpdatedAt || 0,
    investigationsUpdatedAt || 0,
    auditUpdatedAt || 0,
  )

  const formattedLastUpdated = useMemo(() => {
    if (!latestTimestamp) return null
    return new Date(latestTimestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }, [latestTimestamp])

  const handleRefreshAll = () => {
    refetchHealth()
    refetchTelemetry()
    refetchAgents()
    refetchInvestigations()
    refetchDataset()
    refetchAudit()
    refetchUsers()
  }

  // User breakdown
  const adminCount = usersData.filter((u) => u.role === 'ADMIN').length
  const analystCount = usersData.filter((u) => u.role === 'USER').length

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-hairline pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] tracking-[0.28em] text-signal uppercase font-semibold">
              Platform Administration
            </span>
            <span className="font-mono text-[9px] px-1.5 py-0.2 border border-amber-500/40 bg-amber-500/10 text-amber-400 font-semibold uppercase">
              Operator Console
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-strong font-medium">
            System Operations
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-muted max-w-3xl">
            Real-time platform diagnostics, multi-agent pipeline telemetry, audit ledger activity, and system throughput.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {formattedLastUpdated && (
            <span className="font-mono text-xs text-muted">
              Live telemetry: <span className="text-strong">{formattedLastUpdated}</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleRefreshAll}
            className="flex min-h-11 items-center gap-2 border border-hairline bg-surface px-4 py-2 text-xs font-mono tracking-wider uppercase text-strong hover:border-signal transition-colors"
          >
            <RotateCw size={13} className="text-signal" />
            <span>Poll Telemetry</span>
          </button>
        </div>
      </div>

      {/* 1. Infrastructure Diagnostics Pulse */}
      <section aria-label="Platform Infrastructure Health" className="border border-hairline bg-surface p-5">
        <div className="flex items-center justify-between border-b border-hairline pb-3 mb-4">
          <p className="font-mono text-[11px] tracking-[0.22em] text-signal uppercase font-semibold flex items-center gap-2">
            <Server size={14} />
            <span>Operational Infrastructure Pulse</span>
          </p>
          <span className="font-mono text-[10px] text-muted">
            Environment: <strong className="text-strong uppercase">{healthData?.environment || 'development'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-hairline">
          {/* API Gateway */}
          <div className="pt-2 md:pt-0 md:px-3">
            <span className="font-mono text-[10px] text-muted uppercase block mb-1">FastAPI Gateway</span>
            {loadingHealth ? (
              <Skeleton className="h-6 w-20" />
            ) : healthData?.status === 'healthy' ? (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-xs text-emerald-400 font-semibold">ONLINE (200 OK)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="font-mono text-xs text-rose-400 font-semibold">DEGRADED</span>
              </div>
            )}
            <span className="font-mono text-[10px] text-muted/80 block mt-1">v{healthData?.version || '0.1.0'}</span>
          </div>

          {/* Database Engine */}
          <div className="pt-2 md:pt-0 md:px-3">
            <span className="font-mono text-[10px] text-muted uppercase block mb-1">Database Engine</span>
            {loadingHealth ? (
              <Skeleton className="h-6 w-28" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-mono text-xs text-strong font-medium">
                  {healthData?.database || 'PostgreSQL'}
                </span>
              </div>
            )}
            <span className="font-mono text-[10px] text-muted/80 block mt-1">InsForge BaaS (Dedicated)</span>
          </div>

          {/* Autonomous Agents */}
          <div className="pt-2 md:pt-0 md:px-3">
            <span className="font-mono text-[10px] text-muted uppercase block mb-1">Intelligence Agents</span>
            {loadingAgents ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="flex items-center gap-2">
                <Bot size={14} className="text-signal" />
                <span className="font-mono text-xs text-strong font-semibold">
                  {agentsData.length} Registered
                </span>
              </div>
            )}
            <span className="font-mono text-[10px] text-muted/80 block mt-1">100% Deterministic Engine</span>
          </div>

          {/* Pipeline Telemetry */}
          <div className="pt-2 md:pt-0 md:px-3">
            <span className="font-mono text-[10px] text-muted uppercase block mb-1">Pipeline Telemetry</span>
            {loadingTelemetry ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-signal" />
                <span className="font-mono text-xs text-strong font-semibold">
                  {formatNumber(telemetryData?.total_runs)} Runs Logged
                </span>
              </div>
            )}
            <span className="font-mono text-[10px] text-muted/80 block mt-1">
              {telemetryData ? `${telemetryData.success_rate}% Success Rate` : 'Telemetry active'}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Operational Metrics Cards (100% Real PostgreSQL Data) */}
      <section aria-label="Operational Metrics" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Investigations */}
        <div className="border border-hairline bg-surface p-4 space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Investigations</span>
            <Terminal size={14} className="text-signal" />
          </div>
          {loadingInvestigations ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="font-mono text-2xl text-strong font-semibold">
              {formatNumber(investigationsData?.total)}
            </p>
          )}
          <p className="font-mono text-[10px] text-muted">PostgreSQL ledger</p>
        </div>

        {/* Agent Runs */}
        <div className="border border-hairline bg-surface p-4 space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Agent Runs</span>
            <Bot size={14} className="text-signal" />
          </div>
          {loadingTelemetry ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="font-mono text-2xl text-strong font-semibold">
              {formatNumber(telemetryData?.total_runs)}
            </p>
          )}
          <p className="font-mono text-[10px] text-muted">Execution traces</p>
        </div>

        {/* Avg Duration */}
        <div className="border border-hairline bg-surface p-4 space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Avg Duration</span>
            <Clock size={14} className="text-signal" />
          </div>
          {loadingTelemetry ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="font-mono text-2xl text-strong font-semibold">
              {telemetryData ? `${formatNumber(telemetryData.avg_duration_ms, 0)}ms` : '—'}
            </p>
          )}
          <p className="font-mono text-[10px] text-muted">Per invocation</p>
        </div>

        {/* Audit Records */}
        <div className="border border-hairline bg-surface p-4 space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Audit Ledger</span>
            <Fingerprint size={14} className="text-signal" />
          </div>
          {loadingAudit ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="font-mono text-2xl text-strong font-semibold">
              {formatNumber(auditData?.total)}
            </p>
          )}
          <p className="font-mono text-[10px] text-muted">Immutable events</p>
        </div>

        {/* System Users */}
        <div className="border border-hairline bg-surface p-4 space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Accounts</span>
            <Users size={14} className="text-signal" />
          </div>
          {loadingUsers ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="font-mono text-2xl text-strong font-semibold">
              {formatNumber(usersData.length)}
            </p>
          )}
          <p className="font-mono text-[10px] text-muted">{adminCount} Admin &bull; {analystCount} Analyst</p>
        </div>

        {/* Dataset Status */}
        <div className="border border-hairline bg-surface p-4 space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Datasets</span>
            <FileSpreadsheet size={14} className="text-signal" />
          </div>
          {loadingDataset ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="font-mono text-2xl text-strong font-semibold">
              {datasetData?.sheets ? Object.keys(datasetData.sheets).length : 1}
            </p>
          )}
          <p className="font-mono text-[10px] text-muted">Ingested workbooks</p>
        </div>
      </section>

      {/* 3. Pipeline Agent Topology & Observability */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-2">
          <p className="font-mono text-xs font-semibold tracking-wider text-signal uppercase flex items-center gap-2">
            <Bot size={14} />
            <span>Autonomous Pipeline Topology &amp; Execution Telemetry</span>
          </p>
          <Link
            to="/admin/agents"
            className="font-mono text-xs text-signal hover:underline inline-flex items-center gap-1"
          >
            <span>View Full Agent Registry</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {loadingAgents ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <AgentConstellation
            agents={agentsData}
            selectedId={selectedAgentId}
            onSelect={setSelectedAgentId}
          />
        )}

        {/* Agent Telemetry Rollup Table */}
        <div className="border border-hairline bg-surface overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-surface-2 border-b border-hairline text-muted uppercase text-[10px]">
              <tr>
                <th className="p-3">Agent Identifier</th>
                <th className="p-3">Agent Name</th>
                <th className="p-3">Version</th>
                <th className="p-3">Total Invocations</th>
                <th className="p-3">Avg Duration</th>
                <th className="p-3">Operational Status</th>
                <th className="p-3 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {agentsData.map((agent) => {
                const telemetry = telemetryData?.by_agent?.[agent.agent_id]
                return (
                  <tr key={agent.agent_id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="p-3 font-semibold text-signal">
                      <Link to={`/admin/agents/${agent.agent_id}`} className="hover:underline">
                        {agent.agent_id}
                      </Link>
                    </td>
                    <td className="p-3 font-sans text-strong font-medium">{agent.name}</td>
                    <td className="p-3 text-muted">v{agent.version}</td>
                    <td className="p-3 text-strong">
                      {telemetry?.runs != null ? formatNumber(telemetry.runs) : '—'}
                    </td>
                    <td className="p-3 text-muted">
                      {telemetry?.avg_duration_ms != null ? `${telemetry.avg_duration_ms}ms` : '—'}
                    </td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase">
                        {telemetry?.last_status || agent.status || 'READY'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/admin/agents/${agent.agent_id}`}
                        className="text-signal hover:underline inline-flex items-center gap-1 text-[11px]"
                      >
                        <span>Telemetry</span>
                        <ArrowRight size={10} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Investigation Throughput & Audit Activity Dual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Investigation Runs (PostgreSQL) */}
        <section className="border border-hairline bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-signal" />
              <h3 className="font-display text-base text-strong font-medium">Investigation Pipeline Throughput</h3>
            </div>
            <Link
              to="/admin/investigations"
              className="font-mono text-xs text-signal hover:underline inline-flex items-center gap-1"
            >
              <span>All ({investigationsData?.total || 0})</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {loadingInvestigations ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !investigationsData?.items?.length ? (
            <p className="font-mono text-xs text-muted italic p-4 text-center">No investigations recorded in PostgreSQL.</p>
          ) : (
            <div className="divide-y divide-hairline border border-hairline bg-bg">
              {investigationsData.items.slice(0, 6).map((inv) => (
                <div key={inv.run_id} className="p-3 flex items-center justify-between text-xs font-mono hover:bg-surface-2/60 transition-colors">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-signal">{inv.run_id}</span>
                      <span className="text-[10px] px-1.5 py-0.2 border border-hairline bg-surface-2 text-muted">
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted truncate mt-0.5">
                      Target: <strong className="text-strong">{inv.entity_id}</strong> &bull; {inv.findings_summary || 'Pipeline execution completed'}
                    </p>
                  </div>
                  <Link
                    to={`/admin/investigations/${inv.run_id}`}
                    className="text-signal hover:underline inline-flex items-center gap-1 shrink-0 text-[11px]"
                  >
                    <span>Trace</span>
                    <ArrowRight size={10} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Audit Ledger Events (PostgreSQL) */}
        <section className="border border-hairline bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
              <Fingerprint size={16} className="text-signal" />
              <h3 className="font-display text-base text-strong font-medium">Cryptographic Audit Ledger</h3>
            </div>
            <Link
              to="/admin/audit"
              className="font-mono text-xs text-signal hover:underline inline-flex items-center gap-1"
            >
              <span>All ({auditData?.total || 0})</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {loadingAudit ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !auditData?.items?.length ? (
            <p className="font-mono text-xs text-muted italic p-4 text-center">No audit records logged.</p>
          ) : (
            <div className="divide-y divide-hairline border border-hairline bg-bg">
              {auditData.items.slice(0, 6).map((rec) => (
                <div key={rec.record_id} className="p-3 flex items-center justify-between text-xs font-mono hover:bg-surface-2/60 transition-colors">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-semibold">{rec.record_id}</span>
                      <span className="text-[10px] px-1.5 py-0.2 border border-hairline bg-surface-2 text-muted">
                        {rec.payload_type}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted truncate mt-0.5">
                      Entity: <strong className="text-strong">{rec.entity_id}</strong> &bull; Actor: {rec.agent_id} &bull; {formatTimestamp(rec.created_at)}
                    </p>
                  </div>
                  <Link
                    to={`/admin/audit`}
                    className="text-signal hover:underline inline-flex items-center gap-1 shrink-0 text-[11px]"
                  >
                    <span>Ledger</span>
                    <ArrowRight size={10} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 5. Ingestion Operations & Platform Controls */}
      <section className="border border-hairline bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-signal" />
            <h3 className="font-display text-base text-strong font-medium">Dataset Ingestion &amp; Storage</h3>
          </div>
          <Link
            to="/admin/datasets"
            className="font-mono text-xs text-signal hover:underline inline-flex items-center gap-1"
          >
            <span>Data Operations</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3 border border-hairline bg-bg space-y-1">
            <span className="text-[10px] text-muted uppercase block">Active Dataset Source</span>
            <span className="text-strong font-semibold truncate block">
              {datasetData?.file_path?.split('/').pop() || 'echo_synthetic_dataset.xlsx'}
            </span>
          </div>

          <div className="p-3 border border-hairline bg-bg space-y-1">
            <span className="text-[10px] text-muted uppercase block">Worksheet Structure</span>
            <span className="text-strong font-semibold">
              {datasetData?.sheets ? `${Object.keys(datasetData.sheets).join(', ')}` : 'Core_Data'}
            </span>
          </div>

          <div className="p-3 border border-hairline bg-bg space-y-1">
            <span className="text-[10px] text-muted uppercase block">Remote Ingestion API</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>POST /api/v1/datasets/ingest</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
