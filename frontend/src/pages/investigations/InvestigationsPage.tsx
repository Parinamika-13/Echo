import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Eye, Terminal, Filter } from 'lucide-react'
import { listInvestigations } from '@/api/investigations'
import { Skeleton, ErrorState, EmptyState } from '@/components/feedback/States'
import { formatTimestamp, formatNumber } from '@/lib/format'

export function InvestigationsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const {
    data: investigationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminInvestigationsList', statusFilter, priorityFilter, searchTerm],
    queryFn: () =>
      listInvestigations({
        limit: 50,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: searchTerm.trim() || undefined,
      }),
  })

  const investigations = investigationsData?.items || []
  const totalCount = investigationsData?.total || 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-hairline pb-5 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] tracking-[0.28em] text-signal uppercase font-semibold">
              Pipeline Operations
            </span>
            <span className="font-mono text-[9px] px-1.5 py-0.2 border border-amber-500/40 bg-amber-500/10 text-amber-400 uppercase font-semibold">
              Admin Console
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-strong font-medium">Investigation Pipeline</h1>
          <p className="mt-1 text-sm text-muted">
            Inspect all persistent multi-agent orchestration runs, execution traces, and synthesized findings across the platform.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="font-mono text-xs text-muted">
            Total in DB: <strong className="text-strong">{formatNumber(totalCount)}</strong>
          </span>
          <Link
            to="/admin/investigations/new"
            className="flex min-h-11 items-center gap-2 border border-signal bg-surface px-4 py-2 font-mono text-xs uppercase tracking-wider text-strong hover:bg-surface-2 transition-colors"
          >
            <Plus size={14} className="text-signal" />
            <span>New Investigation</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 border border-hairline bg-surface p-3">
        <div className="flex-1 flex items-center gap-2 border border-hairline bg-bg px-3 py-2">
          <Search size={16} className="text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search investigations by Run ID, Target Entity, or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-strong outline-none placeholder:text-muted"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by Status"
          className="border border-hairline bg-bg px-3 py-2 text-xs font-mono text-strong outline-none"
        >
          <option value="">All Statuses</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="NEW">NEW</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DISMISSED">DISMISSED</option>
          <option value="FAILED">FAILED</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          aria-label="Filter by Priority"
          className="border border-hairline bg-bg px-3 py-2 text-xs font-mono text-strong outline-none"
        >
          <option value="">All Priorities</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
      </div>

      {/* Investigations Table */}
      {error ? (
        <ErrorState
          title="Failed to query investigations"
          body={error instanceof Error ? error.message : 'Unknown database query error.'}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : investigations.length === 0 ? (
        <EmptyState
          title="No investigations match criteria"
          body={searchTerm || statusFilter ? 'Try clearing or adjusting search filters.' : 'No investigations recorded in PostgreSQL.'}
        />
      ) : (
        <div className="border border-hairline bg-surface overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-surface-2 border-b border-hairline text-muted uppercase text-[10px]">
              <tr>
                <th className="p-3">Run Identifier</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">Topic / Subject</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Executed At</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {investigations.map((run) => (
                <tr key={run.run_id} className="hover:bg-surface-2/40 transition-colors">
                  <td className="p-3 font-semibold text-signal">
                    <Link to={`/admin/investigations/${run.run_id}`} className="hover:underline">
                      {run.run_id}
                    </Link>
                  </td>
                  <td className="p-3 font-sans font-medium text-strong">
                    <Link to={`/admin/entities/${run.entity_id}`} className="hover:text-signal">
                      {run.entity_id}
                    </Link>
                  </td>
                  <td className="p-3 text-muted truncate max-w-xs">{run.topic || 'Corporate Inquiry'}</td>
                  <td className="p-3">
                    <span className="px-1.5 py-0.5 border border-hairline bg-surface-2 text-muted text-[10px] uppercase font-semibold">
                      {run.priority || 'MEDIUM'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-1.5 py-0.5 border text-[10px] uppercase font-semibold ${
                        run.status === 'COMPLETED'
                          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                          : 'border-signal/40 text-signal bg-signal/10'
                      }`}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td className="p-3 text-muted">{formatTimestamp(run.created_at)}</td>
                  <td className="p-3 text-right">
                    <Link
                      to={`/admin/investigations/${run.run_id}`}
                      className="inline-flex min-h-11 items-center gap-1 border border-hairline px-2.5 py-1 text-signal hover:border-signal"
                    >
                      <Eye size={12} />
                      <span>Pipeline</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
