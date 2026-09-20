import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, AlertTriangle, Building2, BarChart3, Radio, FileText } from 'lucide-react'
import { getRiskAssessment, getEntity } from '@/api/entities'
import { listSignals } from '@/api/signals'
import { Skeleton, ErrorState, EmptyState } from '@/components/feedback/States'
import { formatTimestamp } from '@/lib/format'

export function RiskDetailPage() {
  const { id } = useParams<{ id: string }>()

  const {
    data: risk,
    isLoading: loadingRisk,
    error: riskError,
  } = useQuery({
    queryKey: ['riskDetail', id],
    queryFn: () => getRiskAssessment(id!),
    enabled: Boolean(id),
  })

  const { data: entity } = useQuery({
    queryKey: ['riskEntity', id],
    queryFn: () => getEntity(id!),
    enabled: Boolean(id),
  })

  const { data: signalsData } = useQuery({
    queryKey: ['riskSignals', id],
    queryFn: () => listSignals({ entity_id: id }),
    enabled: Boolean(id),
  })

  if (loadingRisk) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (riskError || !risk) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Link to="/admin/risk" className="inline-flex items-center gap-1 font-mono text-xs text-signal hover:underline">
          <ArrowLeft size={14} /> Back to Risk
        </Link>
        <ErrorState
          title="Risk Assessment Not Found"
          body={riskError instanceof Error ? riskError.message : `No risk evaluation found for entity ${id}.`}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        to="/admin/risk"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-signal hover:underline"
      >
        <ArrowLeft size={14} />
        Back to Risk Catalogue
      </Link>

      {/* 24. Header */}
      <div className="border border-hairline bg-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 border border-hairline bg-surface-2 text-signal">
                {risk.assessment_id}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 border border-hairline bg-surface-2 text-muted">
                Target: {risk.entity_id}
              </span>
            </div>
            <h1 className="font-display mt-2 text-3xl text-strong font-medium">
              Risk Evaluation Profile
            </h1>
            {entity && (
              <p className="text-sm text-muted mt-1">
                {entity.canonical_name} {entity.company ? `(${entity.company})` : ''} &bull; {entity.sector || 'General'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/admin/analysis/${risk.entity_id}`}
              className="flex min-h-11 items-center gap-1.5 border border-hairline bg-surface-2 px-3 py-1.5 font-mono text-xs text-strong hover:border-signal"
            >
              <BarChart3 size={13} className="text-signal" />
              <span>Analysis View</span>
            </Link>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs border-t border-hairline pt-4 text-muted">
          <div>
            <span className="text-faint text-[10px] uppercase block">Overall Rating</span>
            <span className="text-strong text-base font-semibold">{risk.overall_rating}</span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Overall Confidence</span>
            <span className="text-strong text-base font-semibold">
              {risk.overall_confidence != null ? `${Math.round(risk.overall_confidence * 100)}%` : '—'}
            </span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Status</span>
            <span className="text-health text-base font-semibold">{risk.status}</span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Evaluated At</span>
            <span className="text-strong">{formatTimestamp(risk.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Primary Concerns & Factors */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Primary Concerns */}
        <div className="border border-hairline bg-surface p-5 space-y-3">
          <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Primary Concerns</p>
          {risk.primary_concerns?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted leading-relaxed">
              {risk.primary_concerns.map((concern, idx) => (
                <li key={idx}>{concern}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted italic">No specific primary concerns flagged for this entity.</p>
          )}
        </div>

        {/* Supporting Signals */}
        <div className="border border-hairline bg-surface p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Supporting Signals</p>
            <span className="font-mono text-[10px] text-muted">{signalsData?.items?.length || 0} discovered</span>
          </div>
          {signalsData?.items?.length ? (
            <div className="divide-y divide-hairline">
              {signalsData.items.slice(0, 3).map((sig) => (
                <div key={sig.signal_id} className="py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-semibold text-strong">{sig.signal_type}</span>
                    <p className="text-xs text-muted truncate">{sig.description}</p>
                  </div>
                  <Link to={`/admin/signals/${sig.signal_id}`} className="font-mono text-xs text-signal hover:underline shrink-0">
                    View &rarr;
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted italic">No supporting signals linked to this entity.</p>
          )}
        </div>
      </div>

      {/* Risk Factors Payload */}
      {risk.factors_payload?.length > 0 && (
        <div className="border border-hairline bg-surface p-5 space-y-2">
          <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Risk Factors Payload</p>
          <pre className="p-3 bg-surface-2 border border-hairline font-mono text-xs text-muted overflow-x-auto">
            {JSON.stringify(risk.factors_payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
