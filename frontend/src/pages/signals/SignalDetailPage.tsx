import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Radio, Building2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { getSignal } from '@/api/signals'
import { Skeleton, ErrorState } from '@/components/feedback/States'
import { formatTimestamp } from '@/lib/format'

export function SignalDetailPage() {
  const { id } = useParams<{ id: string }>()

  const {
    data: signal,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['signalDetail', id],
    queryFn: () => getSignal(id!),
    enabled: Boolean(id),
  })

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !signal) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Link to="/admin/signals" className="inline-flex items-center gap-1 font-mono text-xs text-signal hover:underline">
          <ArrowLeft size={14} /> Back to Signals
        </Link>
        <ErrorState
          title="Signal Record Not Found"
          body={error instanceof Error ? error.message : `Signal ${id} could not be retrieved.`}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        to="/admin/signals"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-signal hover:underline"
      >
        <ArrowLeft size={14} />
        Back to Signals Catalogue
      </Link>

      {/* 22. Header */}
      <div className="border border-hairline bg-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 border border-hairline bg-surface-2 text-signal">
                {signal.signal_id}
              </span>
              <span
                className={`font-mono text-xs px-2 py-0.5 border ${
                  signal.severity === 'HIGH'
                    ? 'border-risk/40 text-risk bg-risk/10'
                    : 'border-signal/40 text-signal bg-signal/10'
                }`}
              >
                {signal.severity}
              </span>
            </div>
            <h1 className="font-display mt-2 text-3xl text-strong font-medium">
              {signal.signal_type} Signal
            </h1>
            <p className="text-sm text-muted mt-1 leading-relaxed">{signal.description}</p>
          </div>

          <Link
            to={`/admin/entities/${signal.entity_id}`}
            className="flex min-h-11 items-center gap-1.5 border border-hairline bg-surface-2 px-3 py-1.5 font-mono text-xs text-strong hover:border-signal shrink-0"
          >
            <Building2 size={13} className="text-signal" />
            <span>Target: {signal.entity_id}</span>
          </Link>
        </div>

        {/* Telemetry metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs border-t border-hairline pt-4 text-muted">
          <div>
            <span className="text-faint text-[10px] uppercase block">Detected At</span>
            <span className="text-strong">{formatTimestamp(signal.timestamp)}</span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Importance Score</span>
            <span className="text-strong">{signal.importance || '—'}</span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Signal Status</span>
            <span className="text-strong">{signal.status}</span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Confidence</span>
            <span className="text-strong">
              {signal.confidence != null ? `${Math.round(signal.confidence * 100)}%` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* References & Metadata */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* References */}
        <div className="border border-hairline bg-surface p-5 space-y-3">
          <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Provenance Citations</p>
          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="text-faint text-[10px] uppercase block">Source Reference</span>
              <p className="text-strong mt-0.5">{signal.source_reference || 'Not specified in signal payload'}</p>
            </div>
            <div>
              <span className="text-faint text-[10px] uppercase block">Evidence Reference</span>
              <p className="text-strong mt-0.5">{signal.evidence_reference || 'Not specified in signal payload'}</p>
            </div>
          </div>
        </div>

        {/* Action context */}
        <div className="border border-hairline bg-surface p-5 space-y-3">
          <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Investigative Context</p>
          <p className="text-xs text-muted leading-relaxed">
            This signal was emitted during automated analysis. You can inspect the target entity dossier or trigger a fresh investigation to cross-reference updated filings.
          </p>
          <div className="pt-2">
            <Link
              to={`/admin/entities/${signal.entity_id}`}
              className="inline-flex min-h-11 items-center gap-2 border border-signal bg-surface px-4 py-2 font-mono text-xs uppercase tracking-wider text-strong hover:bg-surface-2"
            >
              Inspect Entity Dossier &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Raw Metadata Payload */}
      {signal.metadata && Object.keys(signal.metadata).length > 0 && (
        <div className="border border-hairline bg-surface p-5 space-y-2">
          <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Related Signal Metadata</p>
          <pre className="p-3 bg-surface-2 border border-hairline font-mono text-xs text-muted overflow-x-auto">
            {JSON.stringify(signal.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
