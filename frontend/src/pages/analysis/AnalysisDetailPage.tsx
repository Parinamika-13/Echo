import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, BarChart3, Building2, AlertTriangle, Radio } from 'lucide-react'
import { getAnalysis, getEntity } from '@/api/entities'
import { Skeleton, ErrorState } from '@/components/feedback/States'
import { formatTimestamp } from '@/lib/format'

export function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>()

  const {
    data: analysis,
    isLoading: loadingAnalysis,
    error: analysisError,
  } = useQuery({
    queryKey: ['analysisDetail', id],
    queryFn: () => getAnalysis(id!),
    enabled: Boolean(id),
  })

  const { data: entity } = useQuery({
    queryKey: ['analysisEntity', id],
    queryFn: () => getEntity(id!),
    enabled: Boolean(id),
  })

  if (loadingAnalysis) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (analysisError || !analysis) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Link to="/admin/analysis" className="inline-flex items-center gap-1 font-mono text-xs text-signal hover:underline">
          <ArrowLeft size={14} /> Back to Analysis
        </Link>
        <ErrorState
          title="Analysis Record Not Found"
          body={analysisError instanceof Error ? analysisError.message : `No analysis dossier available for entity ${id}.`}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        to="/admin/analysis"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-signal hover:underline"
      >
        <ArrowLeft size={14} />
        Back to Analysis Catalogue
      </Link>

      {/* 26. Header */}
      <div className="border border-hairline bg-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 border border-hairline bg-surface-2 text-signal">
                {analysis.analysis_id}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 border border-hairline bg-surface-2 text-muted">
                Target: {analysis.entity_id}
              </span>
            </div>
            <h1 className="font-display mt-2 text-3xl text-strong font-medium">
              Financial Analysis Dossier
            </h1>
            {entity && (
              <p className="text-sm text-muted mt-1">
                {entity.canonical_name} {entity.company ? `(${entity.company})` : ''} &bull; {entity.sector || 'General'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/admin/risk/${analysis.entity_id}`}
              className="flex min-h-11 items-center gap-1.5 border border-hairline bg-surface-2 px-3 py-1.5 font-mono text-xs text-strong hover:border-signal"
            >
              <AlertTriangle size={13} className="text-signal" />
              <span>Risk Evaluation</span>
            </Link>
          </div>
        </div>

        {/* Telemetry metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs border-t border-hairline pt-4 text-muted">
          <div>
            <span className="text-faint text-[10px] uppercase block">Analysis Status</span>
            <span className="text-health text-base font-semibold">{analysis.status}</span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Confidence</span>
            <span className="text-strong text-base font-semibold">
              {analysis.confidence != null ? `${Math.round(analysis.confidence * 100)}%` : '—'}
            </span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Generated At</span>
            <span className="text-strong">{formatTimestamp(analysis.created_at)}</span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Entity Dossier</span>
            <Link to={`/admin/entities/${analysis.entity_id}`} className="text-signal hover:underline">
              Inspect &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Payload */}
      <div className="border border-hairline bg-surface p-6 space-y-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Quantitative Findings</p>
          <h3 className="font-display text-lg text-strong font-medium mt-1">Financial & Valuation Metrics</h3>
          <p className="text-xs text-muted mt-0.5">
            Preserved structured metrics output computed by SVEA (Scenario Valuation Engine Agent).
          </p>
        </div>

        {analysis.metrics_payload && Object.keys(analysis.metrics_payload).length > 0 ? (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
              {Object.entries(analysis.metrics_payload).map(([key, val]) => (
                <div key={key} className="p-3 border border-hairline bg-surface-2 space-y-1">
                  <span className="text-faint text-[10px] uppercase block truncate" title={key}>
                    {key}
                  </span>
                  <p className="text-strong font-semibold text-sm truncate" title={String(val)}>
                    {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                  </p>
                </div>
              ))}
            </div>

            <details className="mt-4">
              <summary className="font-mono text-xs text-signal cursor-pointer uppercase tracking-wider">
                View Raw JSON Metrics Payload
              </summary>
              <pre className="mt-2 p-3 bg-surface-2 border border-hairline font-mono text-xs text-muted overflow-x-auto">
                {JSON.stringify(analysis.metrics_payload, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <p className="text-xs text-muted italic">No structured metrics payload was returned for this analysis.</p>
        )}
      </div>
    </div>
  )
}
