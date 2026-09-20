import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Radio,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Building2,
  ShieldAlert,
  Terminal,
  ExternalLink,
  Info,
} from 'lucide-react'
import { getSignal } from '@/api/signals'
import { Skeleton, ErrorState } from '@/components/feedback/States'
import { useWatchlist } from '@/hooks/useWatchlist'

export function UserSignalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isBookmarked, toggleBookmark } = useWatchlist()

  const { data: signal, isLoading, error } = useQuery({
    queryKey: ['user-signal-detail', id],
    queryFn: () => getSignal(id || ''),
    enabled: Boolean(id),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error || !signal) {
    return (
      <div className="space-y-4">
        <Link to="/app/signals" className="text-xs font-mono text-signal hover:underline inline-flex items-center gap-1">
          <ArrowLeft size={13} /> Back to Signals
        </Link>
        <ErrorState message={`Could not load signal '${id}'.`} />
      </div>
    )
  }

  const bookmarked = isBookmarked(signal.signal_id)

  return (
    <div className="space-y-6">
      {/* Back and Bookmark */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/signals"
          className="text-xs font-mono text-muted hover:text-strong transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={13} />
          <span>Back to Signals</span>
        </Link>

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
          className={`flex min-h-9 items-center gap-1.5 px-3 border text-xs font-mono transition-colors ${
            bookmarked
              ? 'border-signal bg-signal/15 text-strong font-semibold'
              : 'border-hairline bg-surface text-muted hover:text-strong'
          }`}
        >
          {bookmarked ? <BookmarkCheck size={13} className="text-signal" /> : <Bookmark size={13} />}
          <span>{bookmarked ? 'Saved in Watchlist' : 'Add to Watchlist'}</span>
        </button>
      </div>

      {/* Main Signal Card */}
      <div className="border border-hairline bg-surface p-6 space-y-4">
        <div className="flex items-center gap-2">
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
          <span className="font-mono text-xs text-signal font-semibold">{signal.signal_id}</span>
          <span className="font-mono text-xs text-muted border border-hairline px-2 py-0.5">
            {signal.signal_type}
          </span>
        </div>

        <h1 className="text-2xl font-display font-medium text-strong leading-snug">
          {signal.description}
        </h1>

        {/* Structured Data Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
          <div className="border border-hairline bg-bg p-3 space-y-1">
            <span className="text-[10px] text-muted uppercase block">Related Entity</span>
            <span className="text-strong font-semibold block">{signal.entity_id}</span>
          </div>
          <div className="border border-hairline bg-bg p-3 space-y-1">
            <span className="text-[10px] text-muted uppercase block">Detection Time</span>
            <span className="text-strong font-semibold block">
              {signal.timestamp ? new Date(signal.timestamp).toLocaleTimeString() : 'Recent'}
            </span>
          </div>
          <div className="border border-hairline bg-bg p-3 space-y-1">
            <span className="text-[10px] text-muted uppercase block">Confidence</span>
            <span className="text-strong font-semibold block">
              {signal.confidence ? `${Math.round(signal.confidence * 100)}%` : 'N/A'}
            </span>
          </div>
          <div className="border border-hairline bg-bg p-3 space-y-1">
            <span className="text-[10px] text-muted uppercase block">Status</span>
            <span className="text-gain font-semibold block">{signal.status || '—'}</span>
          </div>
        </div>
      </div>

      {/* Why it Matters (Section 9) */}
      <div className="border border-hairline bg-surface p-6 space-y-2">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-signal" />
          <h2 className="text-sm font-semibold font-display text-strong uppercase tracking-wider">
            Why It Matters
          </h2>
        </div>
        <p className="text-xs text-muted leading-relaxed font-mono">
          This signal indicates a disclosure anomaly detected across verified filings for{' '}
          <strong className="text-ink">{signal.entity_id}</strong>. Inconsistencies between filed statements and corroborating evidence can signify emerging financial distress, unreported lease expiries, or valuation variance.
        </p>
      </div>

      {/* Supporting Analysis & Metadata */}
      {(signal.metadata || (signal as any).metadata_payload) && Object.keys(signal.metadata || (signal as any).metadata_payload).length > 0 && (
        <div className="border border-hairline bg-surface p-6 space-y-3 font-mono text-xs">
          <h3 className="text-strong font-semibold text-sm uppercase tracking-wider font-display">
            Supporting Analysis &amp; Metadata
          </h3>
          <pre className="p-3 bg-bg border border-hairline overflow-x-auto text-[11px] text-muted">
            {JSON.stringify(signal.metadata || (signal as any).metadata_payload, null, 2)}
          </pre>
        </div>
      )}

      {/* Related Actions (Section 9) */}
      <div className="border border-hairline bg-surface p-5 space-y-3">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted">
          Connected Intelligence &amp; Actions
        </h3>
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <Link
            to={`/app/entities/${signal.entity_id}`}
            className="flex items-center gap-1.5 border border-hairline bg-surface-2 hover:bg-surface-3 px-3.5 py-2 text-strong transition-colors"
          >
            <Building2 size={13} className="text-signal" />
            <span>View Entity ({signal.entity_id})</span>
          </Link>

          <Link
            to={`/app/risk/${signal.entity_id}`}
            className="flex items-center gap-1.5 border border-hairline bg-surface-2 hover:bg-surface-3 px-3.5 py-2 text-strong transition-colors"
          >
            <ShieldAlert size={13} className="text-signal" />
            <span>View Risk Assessment</span>
          </Link>

          <Link
            to={`/app/investigations/new?entityId=${signal.entity_id}`}
            className="flex items-center gap-1.5 border border-signal bg-signal/15 hover:bg-signal/25 px-4 py-2 text-strong font-semibold uppercase tracking-wider transition-colors"
          >
            <Terminal size={13} className="text-signal" />
            <span>Investigate Entity</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
