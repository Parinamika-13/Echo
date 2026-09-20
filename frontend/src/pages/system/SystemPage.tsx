import { useQuery } from '@tanstack/react-query'
import { Activity, ShieldCheck, Database, Bot, CheckCircle2, RotateCw, Server } from 'lucide-react'
import { getHealth } from '@/api/health'
import { inspectDataset } from '@/api/datasets'
import { listAgents } from '@/api/agents'
import { listEntities } from '@/api/entities'
import { StatusDot } from '@/components/feedback/StatusDot'
import { Skeleton } from '@/components/feedback/States'
import { formatNumber } from '@/lib/format'

export function SystemPage() {
  const { data: health, isLoading: loadingHealth, refetch: refetchHealth } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: getHealth,
  })

  const { data: dataset, isLoading: loadingDataset, refetch: refetchDataset } = useQuery({
    queryKey: ['systemDataset'],
    queryFn: () => inspectDataset(),
  })

  const { data: agents, isLoading: loadingAgents, refetch: refetchAgents } = useQuery({
    queryKey: ['systemAgents'],
    queryFn: listAgents,
  })

  const { data: entities, isLoading: loadingEntities, refetch: refetchEntities } = useQuery({
    queryKey: ['systemEntities'],
    queryFn: () => listEntities({ limit: 1 }),
  })

  const handleRefreshAll = () => {
    refetchHealth()
    refetchDataset()
    refetchAgents()
    refetchEntities()
  }

  // Safe non-secret client and environment configuration
  const safeEnvConfig = [
    { label: 'Application Mode', value: import.meta.env.MODE || 'development' },
    { label: 'API Prefix Base', value: import.meta.env.VITE_API_BASE_URL || '/api/v1 (proxied via Vite)' },
    { label: 'Client Framework', value: 'React 19.2 + Vite 8.3' },
    { label: 'Backend Architecture', value: 'FastAPI + SQLAlchemy + SQLite / Postgres BaaS' },
    { label: 'Styling & Tokens', value: 'Tailwind CSS v4 (Ledger Graphite & Brass)' },
    { label: 'State Management', value: '@tanstack/react-query v5' },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 33. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-hairline pb-5 gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-[0.28em] text-signal uppercase">Platform Architecture</p>
          <h1 className="font-display mt-1 text-3xl sm:text-4xl text-strong font-medium">System Telemetry</h1>
          <p className="mt-1 text-sm text-muted">
            Inspect operational health, backend service endpoints, dataset availability, and non-secret configuration.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefreshAll}
          className="flex min-h-11 items-center gap-2 border border-hairline bg-surface px-4 py-2 font-mono text-xs uppercase tracking-wider text-strong hover:border-signal transition-colors self-start sm:self-auto"
        >
          <RotateCw size={13} className="text-signal" />
          Poll Services
        </button>
      </div>

      {/* Grid of Technical Health Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* API Health */}
        <div className="border border-hairline bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
              <Server size={16} className="text-signal" />
              <h3 className="font-display text-lg text-strong">FastAPI Gateway</h3>
            </div>
            {loadingHealth ? (
              <Skeleton className="h-5 w-16" />
            ) : health?.status === 'healthy' ? (
              <span className="px-2 py-0.5 border border-health/40 text-health bg-health/10 font-mono text-[10px]">
                ONLINE
              </span>
            ) : (
              <span className="px-2 py-0.5 border border-risk/40 text-risk bg-risk/10 font-mono text-[10px]">
                UNREACHABLE
              </span>
            )}
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between py-1 border-b border-hairline/50">
              <span className="text-muted">Status Response</span>
              <span className="text-strong">{health?.status || 'Unavailable'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline/50">
              <span className="text-muted">Service Identifier</span>
              <span className="text-strong">{health?.service || 'ECHO backend'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline/50">
              <span className="text-muted">Health Endpoint</span>
              <span className="text-strong">GET /health</span>
            </div>
          </div>
        </div>

        {/* Database Health */}
        <div className="border border-hairline bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-signal" />
              <h3 className="font-display text-lg text-strong">Database Repository</h3>
            </div>
            {loadingEntities ? (
              <Skeleton className="h-5 w-16" />
            ) : entities ? (
              <span className="px-2 py-0.5 border border-health/40 text-health bg-health/10 font-mono text-[10px]">
                VERIFIED
              </span>
            ) : (
              <span className="px-2 py-0.5 border border-hairline text-muted font-mono text-[10px]">
                UNAVAILABLE
              </span>
            )}
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between py-1 border-b border-hairline/50">
              <span className="text-muted">Repository Type</span>
              <span className="text-strong">SQLAlchemy Unified Repository</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline/50">
              <span className="text-muted">Canonical Entities</span>
              <span className="text-strong">{entities ? formatNumber(entities.total) : '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline/50">
              <span className="text-muted">Persistence Engine</span>
              <span className="text-strong">SQLite / PostgreSQL</span>
            </div>
          </div>
        </div>

        {/* Dataset Ingestion Service */}
        <div className="border border-hairline bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-signal" />
              <h3 className="font-display text-lg text-strong">Disclosure Dataset</h3>
            </div>
            {loadingDataset ? (
              <Skeleton className="h-5 w-16" />
            ) : dataset?.sheets ? (
              <span className="px-2 py-0.5 border border-health/40 text-health bg-health/10 font-mono text-[10px]">
                AVAILABLE
              </span>
            ) : (
              <span className="px-2 py-0.5 border border-hairline text-muted font-mono text-[10px]">
                NOT FOUND
              </span>
            )}
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between py-1 border-b border-hairline/50">
              <span className="text-muted">Target Workbook</span>
              <span className="text-strong truncate max-w-[14rem]" title={dataset?.file_path}>
                {dataset?.file_path?.split('/').pop() || 'echo_synthetic_dataset.xlsx'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline/50">
              <span className="text-muted">Registered Sheets</span>
              <span className="text-strong">{dataset?.sheets?.length || 0} sheets</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline/50">
              <span className="text-muted">Endpoint</span>
              <span className="text-strong">GET /api/v1/datasets/inspect</span>
            </div>
          </div>
        </div>

        {/* Multi-Agent Pipeline */}
        <div className="border border-hairline bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-signal" />
              <h3 className="font-display text-lg text-strong">Pipeline Registry</h3>
            </div>
            {loadingAgents ? (
              <Skeleton className="h-5 w-16" />
            ) : agents?.length ? (
              <span className="px-2 py-0.5 border border-health/40 text-health bg-health/10 font-mono text-[10px]">
                {agents.length} AGENTS READY
              </span>
            ) : (
              <span className="px-2 py-0.5 border border-hairline text-muted font-mono text-[10px]">
                OFFLINE
              </span>
            )}
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between py-1 border-b border-hairline/50">
              <span className="text-muted">Orchestrator</span>
              <span className="text-strong">ECHO-ORCH (Active)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline/50">
              <span className="text-muted">Registered Agents</span>
              <span className="text-strong">{agents?.length || 0} agents</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline/50">
              <span className="text-muted">Endpoint</span>
              <span className="text-strong">GET /agents</span>
            </div>
          </div>
        </div>
      </div>

      {/* 33. Safe Non-Secret Environment Configuration */}
      <section className="border border-hairline bg-surface p-6 space-y-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Environment Telemetry</p>
          <h3 className="font-display text-lg text-strong font-medium mt-1">Safe Non-Secret Configuration</h3>
          <p className="text-xs text-muted mt-0.5">
            Public client build details and runtime modes. Sensitive API keys, database credentials, and secrets are strictly excluded from client telemetry.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs pt-2">
          {safeEnvConfig.map((item) => (
            <div key={item.label} className="p-3 border border-hairline bg-surface-2 space-y-1">
              <span className="text-faint text-[10px] uppercase block">{item.label}</span>
              <p className="text-strong text-xs font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
