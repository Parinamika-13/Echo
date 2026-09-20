import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, ArrowRight } from 'lucide-react'
import { listInvestigations, listSessionInvestigations } from '@/api/investigations'
import { Skeleton, EmptyState, ErrorState } from '@/components/feedback/States'

export function UserInvestigationsPage() {
  const { data: apiData, isLoading, error, refetch } = useQuery({
    queryKey: ['user-investigations-api-list'],
    queryFn: () => listInvestigations({ limit: 50 }),
  })

  const sessionRuns = useMemo(() => listSessionInvestigations(), [])

  const combinedRuns = useMemo(() => {
    const apiRuns = apiData?.items || []
    const seen = new Set<string>()
    const merged: any[] = []

    // Add session runs first (most recent in browser)
    for (const r of sessionRuns) {
      if (r.run_id && !seen.has(r.run_id)) {
        seen.add(r.run_id)
        merged.push({
          run_id: r.run_id,
          entity_id: (r as any).entity_id || (r.summary as any)?.entity_id || 'System Pipeline',
          status: r.status,
          workflow: r.workflow,
          created_at: r.created_at,
          executed_agents: r.executed_agents || [],
        })
      }
    }

    // Add backend persistent runs
    for (const r of apiRuns) {
      if (r.run_id && !seen.has(r.run_id)) {
        seen.add(r.run_id)
        merged.push({
          run_id: r.run_id,
          entity_id: r.entity_id || (r as any).topic || 'Pipeline Investigation',
          status: r.status,
          workflow: (r as any).workflow || (r as any).topic || 'full_pipeline',
          created_at: r.created_at,
          executed_agents: r.executed_agents || [],
        })
      }
    }

    return merged
  }, [apiData, sessionRuns])

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-strong">Investigations</h1>
          <p className="text-xs sm:text-sm text-muted">
            Follow the intelligence pipeline from source to decision-ready analysis.
          </p>
        </div>

        <Link
          to="/app/investigations/new"
          className="flex min-h-10 items-center gap-2 border border-signal bg-signal/15 hover:bg-signal/25 px-4 text-xs font-mono font-semibold uppercase tracking-wider text-strong transition-colors self-start sm:self-auto"
        >
          <Plus size={14} className="text-signal" />
          <span>New Investigation</span>
        </Link>
      </div>

      {/* Investigation Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error ? (
        <ErrorState message="Could not load investigations from database." onRetry={refetch} />
      ) : combinedRuns.length === 0 ? (
        <EmptyState
          title="No Active Investigations"
          message="Launch an autonomous multi-agent investigation workflow to evaluate an entity."
          actionLabel="Start Investigation"
          onAction={() => window.location.assign('/app/investigations/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {combinedRuns.map((run) => (
            <div
              key={run.run_id}
              className="border border-hairline bg-surface p-5 hover:border-signal/40 transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-strong">
                    {run.entity_id}
                  </span>
                  <span
                    className={`font-mono text-[9px] uppercase px-2 py-0.5 border font-semibold ${
                      run.status === 'COMPLETED'
                        ? 'border-gain bg-gain/15 text-gain'
                        : run.status === 'FAILED'
                        ? 'border-loss bg-loss/15 text-loss'
                        : 'border-signal bg-signal/15 text-signal animate-pulse'
                    }`}
                  >
                    Investigation {run.status.toLowerCase()}
                  </span>
                </div>

                <p className="text-xs font-mono text-signal">
                  {run.executed_agents.length > 0 ? `${run.executed_agents.length} agents coordinated` : 'Workflow initiated'} &bull; Workflow: {run.workflow || 'full_pipeline'}
                </p>

                <div className="pt-2 border-t border-hairline space-y-1 font-mono text-[11px] text-muted">
                  <div className="flex justify-between">
                    <span>Started:</span>
                    <span className="text-ink">
                      {run.created_at ? new Date(run.created_at).toLocaleTimeString() : 'Active'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Run ID:</span>
                    <span className="text-muted truncate max-w-[180px]">{run.run_id}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-hairline flex items-center justify-end">
                <Link
                  to={`/app/investigations/${run.run_id}`}
                  className="inline-flex items-center gap-1.5 border border-signal bg-signal/15 px-3.5 py-1.5 text-xs font-mono text-strong uppercase tracking-wider font-semibold hover:bg-signal/25 transition-colors"
                >
                  <span>View Investigation</span>
                  <ArrowRight size={13} className="text-signal" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

