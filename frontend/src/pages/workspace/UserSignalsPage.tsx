import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Radio, Search, Bookmark, BookmarkCheck, ArrowRight } from 'lucide-react'
import { listSignals } from '@/api/signals'
import { Skeleton, ErrorState, EmptyState } from '@/components/feedback/States'
import { useWatchlist } from '@/hooks/useWatchlist'

export function UserSignalsPage() {
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const { isBookmarked, toggleBookmark } = useWatchlist()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-signals-feed'],
    queryFn: () => listSignals({ limit: 50 }),
  })

  const rawSignals = data?.items || (data as any)?.signals || []
  const signals = rawSignals.filter((s) => {
    const matchesSeverity = severityFilter === 'ALL' || s.severity === severityFilter
    if (!matchesSeverity) return false
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (
      s.description?.toLowerCase().includes(q) ||
      s.signal_id?.toLowerCase().includes(q) ||
      s.entity_id?.toLowerCase().includes(q) ||
      s.signal_type?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-strong">Signals</h1>
          <p className="text-xs sm:text-sm text-muted">Emerging patterns detected across tracked entities.</p>
        </div>
        <span className="font-mono text-xs text-muted border border-hairline bg-surface px-3 py-1.5 self-start sm:self-auto">
          Active Signals: <strong className="text-strong">{signals.length}</strong> / {rawSignals.length}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search signals by anomaly description, type, or entity ID..."
            className="min-h-10 w-full border border-hairline bg-surface px-3 pl-9 text-xs text-ink placeholder:text-muted/60 focus:border-signal focus:outline-none font-mono"
          />
          <Search size={14} className="text-muted absolute left-3 top-3" />
        </div>

        <div className="flex flex-wrap gap-1.5 font-mono text-[10px] uppercase">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-2 border transition-colors ${
                severityFilter === sev
                  ? 'border-signal bg-signal/15 text-strong font-semibold'
                  : 'border-hairline bg-surface text-muted hover:text-strong'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Signal Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : error ? (
        <ErrorState message="Failed to retrieve signals from API." onRetry={refetch} />
      ) : signals.length === 0 ? (
        <EmptyState
          title="No Signals Found"
          message="There are currently no signals matching your filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signals.map((signal) => {
            const bookmarked = isBookmarked(signal.signal_id)
            const timeAgo = signal.timestamp
              ? new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Recent'

            return (
              <div
                key={signal.signal_id}
                className="border border-hairline bg-surface p-5 hover:border-signal/40 transition-colors flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-[9px] uppercase px-2 py-0.5 border font-semibold ${
                        signal.severity === 'CRITICAL'
                          ? 'border-loss bg-loss/15 text-loss'
                          : signal.severity === 'HIGH'
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                          : 'border-hairline bg-surface-2 text-muted'
                      }`}
                    >
                      {signal.severity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        toggleBookmark({
                          id: signal.signal_id,
                          title: signal.description,
                          subtitle: `${signal.signal_type} (${signal.severity})`,
                          type: 'SIGNAL',
                        })
                      }
                      className={`p-1.5 border transition-colors ${
                        bookmarked
                          ? 'border-signal text-signal bg-signal/10'
                          : 'border-hairline text-muted hover:text-strong'
                      }`}
                    >
                      {bookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                    </button>
                  </div>

                  <h3 className="text-sm font-medium text-strong leading-snug">
                    {signal.description}
                  </h3>

                  <div className="font-mono text-xs text-muted space-y-0.5">
                    <p className="text-signal font-semibold">{signal.entity_id}</p>
                    <p className="text-[11px]">{signal.signal_type}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline flex items-center justify-between font-mono text-[11px]">
                  <span className="text-muted">Detected {timeAgo}</span>
                  <Link
                    to={`/app/signals/${signal.signal_id}`}
                    className="text-signal hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>View signal &rarr;</span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
