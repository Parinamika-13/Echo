import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Radio, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { listSignals } from '@/api/signals'
import { Skeleton, ErrorState, EmptyState } from '@/components/feedback/States'
import { formatTimestamp, formatNumber } from '@/lib/format'

export function SignalsPage() {
  const [page, setPage] = useState(0)
  const pageSize = 25
  const [searchTerm, setSearchTerm] = useState('')
  const [signalTypeFilter, setSignalTypeFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['signals', page, signalTypeFilter],
    queryFn: () =>
      listSignals({
        limit: pageSize,
        offset: page * pageSize,
        signal_type: signalTypeFilter || undefined,
      }),
  })

  const items = (data?.items || []).filter((s) => {
    if (severityFilter && s.severity !== severityFilter) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      return (
        s.signal_id?.toLowerCase().includes(q) ||
        s.entity_id?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.signal_type?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const totalPages = Math.ceil((data?.total || 0) / pageSize)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 21. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-hairline pb-5 gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-[0.28em] text-signal uppercase">Anomaly Detection</p>
          <h1 className="font-display mt-1 text-3xl sm:text-4xl text-strong font-medium">Signals Intelligence</h1>
          <p className="mt-1 text-sm text-muted">
            Signal catalogue indexing disclosure silences, cross-document contradictions, and factual gaps.
          </p>
        </div>
        <div className="font-mono text-xs text-muted">
          Total active signals: <span className="text-strong font-semibold">{formatNumber(data?.total)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 border border-hairline bg-surface p-3">
        <div className="flex-1 flex items-center gap-2 border border-hairline bg-bg px-3 py-2">
          <Search size={16} className="text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search signals by keyword, description, or target entity ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-strong outline-none placeholder:text-muted"
          />
        </div>

        <select
          value={signalTypeFilter}
          onChange={(e) => {
            setSignalTypeFilter(e.target.value)
            setPage(0)
          }}
          aria-label="Filter by Signal Type"
          className="border border-hairline bg-bg px-3 py-2 text-xs font-mono text-strong outline-none"
        >
          <option value="">All Signal Types</option>
          <option value="Silence">Silence</option>
          <option value="Gap">Gap</option>
          <option value="Contradiction">Contradiction</option>
          <option value="Anomaly">Anomaly</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          aria-label="Filter by Severity"
          className="border border-hairline bg-bg px-3 py-2 text-xs font-mono text-strong outline-none"
        >
          <option value="">All Severities</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState
          title="Failed to load signals catalogue"
          body={error instanceof Error ? error.message : 'Unknown network failure.'}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No signals found"
          body="There are currently no signals matching your selected filters in the ECHO database."
        />
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto border border-hairline bg-surface">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-surface-2 border-b border-hairline text-muted uppercase text-[10px]">
                <tr>
                  <th className="p-3">Signal ID</th>
                  <th className="p-3">Target Entity</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Importance</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Created</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {items.map((sig) => (
                  <tr key={sig.signal_id} className="hover:bg-surface-2/40">
                    <td className="p-3">
                      <Link
                        to={`/admin/signals/${sig.signal_id}`}
                        className="font-medium text-strong hover:text-signal block"
                      >
                        {sig.signal_id}
                      </Link>
                    </td>
                    <td className="p-3">
                      <Link
                        to={`/admin/entities/${sig.entity_id}`}
                        className="text-signal hover:underline"
                      >
                        {sig.entity_id}
                      </Link>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-strong">{sig.signal_type}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-1.5 py-0.5 border text-[10px] ${
                          sig.severity === 'HIGH'
                            ? 'border-risk/40 text-risk bg-risk/10'
                            : sig.severity === 'MEDIUM'
                            ? 'border-signal/40 text-signal bg-signal/10'
                            : 'border-hairline text-muted'
                        }`}
                      >
                        {sig.severity}
                      </span>
                    </td>
                    <td className="p-3 text-muted">{sig.importance || '—'}</td>
                    <td className="p-3 text-muted max-w-xs truncate" title={sig.description}>
                      {sig.description}
                    </td>
                    <td className="p-3 text-muted">{formatTimestamp(sig.timestamp)}</td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/admin/signals/${sig.signal_id}`}
                        className="inline-flex min-h-11 items-center gap-1 border border-hairline px-2.5 py-1 text-signal hover:border-signal"
                      >
                        <Eye size={12} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-hairline pt-4 font-mono text-xs text-muted">
            <div>
              Page <span className="text-strong font-medium">{page + 1}</span> of{' '}
              <span className="text-strong font-medium">{Math.max(1, totalPages)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="flex min-h-11 items-center gap-1 border border-hairline px-3 py-1.5 text-strong hover:bg-surface-2 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex min-h-11 items-center gap-1 border border-hairline px-3 py-1.5 text-strong hover:bg-surface-2 disabled:opacity-30 disabled:pointer-events-none"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
