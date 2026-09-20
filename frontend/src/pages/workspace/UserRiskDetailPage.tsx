import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ShieldAlert,
  ArrowLeft,
  Building2,
  AlertTriangle,
  Radio,
  BarChart3,
  Terminal,
  Clock,
} from 'lucide-react'
import { getRiskAssessment, getEntity } from '@/api/entities'
import { listSignals } from '@/api/signals'
import { Skeleton, ErrorState } from '@/components/feedback/States'

export function UserRiskDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: risk, isLoading: riskLoading, error: riskError } = useQuery({
    queryKey: ['user-risk-detail-view', id],
    queryFn: () => getRiskAssessment(id || ''),
    enabled: Boolean(id),
  })

  const { data: entity } = useQuery({
    queryKey: ['user-risk-entity-profile', id],
    queryFn: () => getEntity(id || ''),
    enabled: Boolean(id),
  })

  const { data: signalsData } = useQuery({
    queryKey: ['user-risk-related-signals', id],
    queryFn: () => listSignals({ entity_id: id, limit: 50 }),
    enabled: Boolean(id),
  })

  if (riskLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (riskError || !risk) {
    return (
      <div className="space-y-4">
        <Link to="/app/risk" className="text-xs font-mono text-signal hover:underline inline-flex items-center gap-1">
          <ArrowLeft size={13} /> Back to Risk Register
        </Link>
        <ErrorState message={`Could not load risk assessment for '${id}'.`} />
      </div>
    )
  }

  const supportingSignals = (signalsData?.items || []).filter((s) => s.entity_id === (risk.entity_id || id))

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/risk"
          className="text-xs font-mono text-muted hover:text-strong transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={13} />
          <span>Back to Risk Register</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="border border-hairline bg-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-signal font-semibold">Entity: {id}</span>
              <span className="text-muted">&bull;</span>
              <span className="text-muted">{entity?.sector || 'Unassigned'}</span>
            </div>
            <h1 className="text-2xl font-display font-medium text-strong mt-1">
              {entity?.canonical_name || `Risk Dossier · ${id}`}
            </h1>
          </div>

          <div className="font-mono text-xs">
            <span className="px-3 py-1.5 border border-signal/40 bg-signal/10 text-strong font-semibold uppercase">
              [{risk.overall_rating || 'UNRATED'}]
            </span>
          </div>
        </div>

        {/* Assessment Details & Timestamp */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
          <div className="border border-hairline bg-bg p-3 space-y-1">
            <span className="text-[10px] text-muted uppercase block">Classification</span>
            <span className="text-strong font-semibold">{risk.overall_rating || '—'}</span>
          </div>
          <div className="border border-hairline bg-bg p-3 space-y-1">
            <span className="text-[10px] text-muted uppercase block">Supporting Signals</span>
            <span className="text-signal font-semibold">{supportingSignals.length} Active</span>
          </div>
          <div className="border border-hairline bg-bg p-3 space-y-1">
            <span className="text-[10px] text-muted uppercase block">Assessed At</span>
            <span className="text-strong font-semibold">
              {risk.created_at ? new Date(risk.created_at).toLocaleDateString() : 'Active'}
            </span>
          </div>
          <div className="border border-hairline bg-bg p-3 space-y-1">
            <span className="text-[10px] text-muted uppercase block">Lineage</span>
            <span className="text-gain font-semibold">ECHO-RSA Engine</span>
          </div>
        </div>
      </div>

      {/* Risk Factors Section */}
      <div className="border border-hairline bg-surface p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-hairline pb-3">
          <AlertTriangle size={16} className="text-signal" />
          <h2 className="text-sm font-semibold font-display text-strong uppercase tracking-wider">
            Primary Risk Factors
          </h2>
        </div>

        {risk.primary_concerns && risk.primary_concerns.length > 0 ? (
          <div className="grid gap-2 font-mono text-xs">
            {risk.primary_concerns.map((concern: string, idx: number) => (
              <div
                key={idx}
                className="p-3 border border-hairline bg-bg flex items-start gap-2.5 text-ink"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                <span>{concern}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted font-mono">No acute risk flags recorded in this assessment.</p>
        )}

        {risk.factors_payload && (
          <div className="pt-2 font-mono text-xs">
            <h3 className="font-semibold text-strong uppercase tracking-wider mb-2">
              Detailed Factor Payload
            </h3>
            <pre className="p-3 bg-bg border border-hairline overflow-x-auto text-[11px] text-muted">
              {JSON.stringify(risk.factors_payload, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Supporting Signals */}
      <div className="border border-hairline bg-surface p-6 space-y-3">
        <div className="flex items-center gap-2 border-b border-hairline pb-3">
          <Radio size={16} className="text-signal" />
          <h2 className="text-sm font-semibold font-display text-strong uppercase tracking-wider">
            Supporting Signals ({supportingSignals.length})
          </h2>
        </div>

        {supportingSignals.length === 0 ? (
          <p className="text-xs font-mono text-muted">No associated anomaly signals detected.</p>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {supportingSignals.map((s) => (
              <div
                key={s.signal_id}
                className="p-3 border border-hairline bg-bg flex items-center justify-between"
              >
                <div>
                  <span className="text-signal font-semibold mr-2">{s.signal_id}</span>
                  <span className="text-strong">{s.description}</span>
                </div>
                <Link to={`/app/signals/${s.signal_id}`} className="text-signal hover:underline">
                  Inspect &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connected Navigation (Section 11) */}
      <div className="border border-hairline bg-surface p-5 space-y-3">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted">
          Connected Intelligence
        </h3>
        <div className="flex flex-wrap gap-3 font-mono text-xs">
          <Link
            to={`/app/entities/${id}`}
            className="flex items-center gap-1.5 border border-hairline bg-surface-2 hover:bg-surface-3 px-3.5 py-2 text-strong transition-colors"
          >
            <Building2 size={13} className="text-signal" />
            <span>Entity Dossier</span>
          </Link>

          <Link
            to={`/app/analysis/${id}`}
            className="flex items-center gap-1.5 border border-hairline bg-surface-2 hover:bg-surface-3 px-3.5 py-2 text-strong transition-colors"
          >
            <BarChart3 size={13} className="text-signal" />
            <span>Related Analysis</span>
          </Link>

          <Link
            to={`/app/investigations/new?entityId=${id}`}
            className="flex items-center gap-1.5 border border-signal bg-signal/15 hover:bg-signal/25 px-4 py-2 text-strong font-semibold uppercase tracking-wider transition-colors"
          >
            <Terminal size={13} className="text-signal" />
            <span>Related Investigation</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
