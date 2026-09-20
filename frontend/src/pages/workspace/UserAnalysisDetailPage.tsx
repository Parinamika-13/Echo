import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  ArrowLeft,
  Building2,
  FileText,
  ShieldAlert,
  Radio,
  Clock,
  Layers,
} from 'lucide-react'
import { getAnalysis, getEntity, getRiskAssessment } from '@/api/entities'
import { listSignals } from '@/api/signals'
import { Skeleton, ErrorState } from '@/components/feedback/States'

export function UserAnalysisDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: analysis, isLoading: analysisLoading, error: analysisError } = useQuery({
    queryKey: ['user-analysis-dossier', id],
    queryFn: () => getAnalysis(id || ''),
    enabled: Boolean(id),
  })

  const { data: entity } = useQuery({
    queryKey: ['user-analysis-entity-info', id],
    queryFn: () => getEntity(id || ''),
    enabled: Boolean(id),
  })

  const { data: risk } = useQuery({
    queryKey: ['user-analysis-risk-ctx', id],
    queryFn: () => getRiskAssessment(id || ''),
    enabled: Boolean(id),
  })

  const { data: signalsData } = useQuery({
    queryKey: ['user-analysis-supporting-signals', id],
    queryFn: () => listSignals({ limit: 50 }),
    enabled: Boolean(id),
  })

  if (analysisLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (analysisError || !analysis) {
    return (
      <div className="space-y-4">
        <Link to="/app/analysis" className="text-xs font-mono text-signal hover:underline inline-flex items-center gap-1">
          <ArrowLeft size={13} /> Back to Financial Analysis
        </Link>
        <ErrorState message={`Could not load quantitative valuation for '${id}'.`} />
      </div>
    )
  }

  const supportingSignals = (signalsData?.items || (signalsData as any)?.signals || []).filter((s: any) => s.entity_id === id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/analysis"
          className="text-xs font-mono text-muted hover:text-strong transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={13} />
          <span>Back to Financial Analysis</span>
        </Link>

        <span className="font-mono text-xs text-muted border border-hairline px-2.5 py-1">
          Institutional Research Note &bull; Confidential
        </span>
      </div>

      {/* Editorial Research Note Container */}
      <div className="border border-hairline bg-surface p-7 sm:p-10 space-y-8 shadow-xl">
        {/* Research Header */}
        <div className="border-b border-hairline pb-6 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs text-muted">
            <span className="text-signal font-semibold uppercase tracking-wider">
              ECHO-ERA / SVEA Quantitative Valuation Briefing
            </span>
            <span>
              Generated:{' '}
              {analysis.created_at ? new Date(analysis.created_at).toLocaleDateString() : 'Current Period'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-medium text-strong">
            {entity?.canonical_name || id} &mdash; Valuation &amp; Risk Context
          </h1>

          <p className="font-mono text-xs text-muted">
            Target Entity: <strong className="text-ink">{id}</strong> &bull; Sector:{' '}
            <strong className="text-ink">{entity?.sector || 'Unassigned'}</strong> &bull; Region:{' '}
            <strong className="text-ink">{entity?.region || 'Unspecified'}</strong>
          </p>
        </div>

        {/* Section: Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-signal">
            1. Executive Summary
          </h2>
          <p className="text-sm text-ink leading-relaxed font-sans">
            Comprehensive financial valuation model synthesized across verified regulatory filings and normalized disclosures. Valuation boundaries have been evaluated by ECHO&apos;s Scenario Valuation Engine under macro baseline conditions.
          </p>
        </div>

        {/* Section: Key Findings */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-signal">
            2. Key Valuation Findings &amp; Metrics
          </h2>

          {analysis.metrics_payload && Object.keys(analysis.metrics_payload).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              {Object.entries(analysis.metrics_payload).map(([k, v]) => (
                <div key={k} className="p-3 border border-hairline bg-bg space-y-1">
                  <span className="text-[10px] text-muted uppercase block">{k.replace(/_/g, ' ')}</span>
                  <span className="text-strong font-semibold text-sm">
                    {typeof v === 'number' ? v.toLocaleString() : String(v)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border border-hairline bg-bg font-mono text-xs text-muted">
              Model parameters compiled into canonical financial ledger.
            </div>
          )}
        </div>

        {/* Section: Supporting Signals */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-signal">
              3. Supporting Disclosure Signals
            </h2>
            <span className="font-mono text-[11px] text-muted">
              {supportingSignals.length} Active
            </span>
          </div>

          {supportingSignals.length === 0 ? (
            <p className="text-xs font-mono text-muted">No contradicting signals detected for this entity.</p>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {supportingSignals.map((s) => (
                <div
                  key={s.signal_id}
                  className="p-3 border border-hairline bg-bg flex items-center justify-between"
                >
                  <div>
                    <span className="text-signal font-semibold mr-2">{s.signal_id}</span>
                    <span className="text-ink">{s.description}</span>
                  </div>
                  <Link to={`/app/signals/${s.signal_id}`} className="text-signal hover:underline shrink-0 ml-2">
                    Inspect &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Risk Context */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-signal">
            4. Risk Context
          </h2>
          <div className="p-4 border border-hairline bg-bg font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">Assessed Risk Tier:</span>
              <span className="text-strong font-semibold">{risk?.overall_rating || '—'}</span>
            </div>
            {risk?.primary_concerns && risk.primary_concerns.length > 0 && (
              <div className="pt-2 border-t border-hairline space-y-1">
                <span className="text-muted block text-[10px] uppercase">Concerns:</span>
                <ul className="list-disc list-inside space-y-0.5 text-muted">
                  {risk.primary_concerns.map((c: string, idx: number) => (
                    <li key={idx} className="text-ink">{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Section: Evidence Ledger */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-signal">
            5. Evidence Ledger &amp; Provenance
          </h2>
          <p className="text-xs text-muted font-mono leading-relaxed bg-bg p-3 border border-hairline">
            All valuation and scenario assumptions have been committed to the deterministic audit ledger by ECHO-SSR. Raw extraction chunks remain anchored to filing timestamp records.
          </p>
        </div>
      </div>
    </div>
  )
}
