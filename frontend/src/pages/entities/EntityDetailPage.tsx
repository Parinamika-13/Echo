import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Building2,
  Radio,
  AlertTriangle,
  BarChart3,
  FileText,
  Search,
  Fingerprint,
  Info,
} from 'lucide-react'
import {
  getEntity,
  getEntityAuditTrail,
  getRiskAssessment,
  getAnalysis,
} from '@/api/entities'
import { listSignals } from '@/api/signals'
import { Skeleton, ErrorState, EmptyState } from '@/components/feedback/States'
import { formatTimestamp, formatNumber } from '@/lib/format'

type TabKey =
  | 'overview'
  | 'attributes'
  | 'signals'
  | 'risk'
  | 'analysis'
  | 'evidence'
  | 'sources'
  | 'investigation'
  | 'audit'

export function EntityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const {
    data: entity,
    isLoading: loadingEntity,
    error: entityError,
  } = useQuery({
    queryKey: ['entity', id],
    queryFn: () => getEntity(id!),
    enabled: Boolean(id),
  })

  const { data: signalsData, isLoading: loadingSignals } = useQuery({
    queryKey: ['entitySignals', id],
    queryFn: () => listSignals({ entity_id: id }),
    enabled: Boolean(id) && activeTab === 'signals',
  })

  const { data: riskData, isLoading: loadingRisk } = useQuery({
    queryKey: ['entityRisk', id],
    queryFn: () => getRiskAssessment(id!),
    enabled: Boolean(id) && activeTab === 'risk',
    retry: false,
  })

  const { data: analysisData, isLoading: loadingAnalysis } = useQuery({
    queryKey: ['entityAnalysis', id],
    queryFn: () => getAnalysis(id!),
    enabled: Boolean(id) && activeTab === 'analysis',
    retry: false,
  })

  const { data: auditData, isLoading: loadingAudit } = useQuery({
    queryKey: ['entityAudit', id],
    queryFn: () => getEntityAuditTrail(id!),
    enabled: Boolean(id) && activeTab === 'audit',
    retry: false,
  })

  if (entityError) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <Link to="/admin/entities" className="inline-flex items-center gap-1 font-mono text-xs text-signal hover:underline">
          <ArrowLeft size={14} /> Back to Entities
        </Link>
        <ErrorState
          title="Entity Dossier Not Found"
          body={entityError instanceof Error ? entityError.message : 'Unable to load entity.'}
        />
      </div>
    )
  }

  if (loadingEntity) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!entity) return null

  const tabs: Array<{ key: TabKey; label: string; icon: typeof Building2 }> = [
    { key: 'overview', label: 'Overview', icon: Building2 },
    { key: 'attributes', label: 'Attributes', icon: Info },
    { key: 'signals', label: 'Signals', icon: Radio },
    { key: 'risk', label: 'Risk', icon: AlertTriangle },
    { key: 'analysis', label: 'Analysis', icon: BarChart3 },
    { key: 'evidence', label: 'Evidence', icon: FileText },
    { key: 'sources', label: 'Sources', icon: FileText },
    { key: 'investigation', label: 'Investigation', icon: Search },
    { key: 'audit', label: 'Audit', icon: Fingerprint },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Navigation back */}
      <Link
        to="/admin/entities"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-signal hover:underline"
      >
        <ArrowLeft size={14} />
        Back to Entities Catalogue
      </Link>

      {/* 17. Header & Metadata */}
      <div className="border border-hairline bg-surface p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 border border-hairline bg-surface-2 text-signal">
                {entity.property_id}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 border border-hairline bg-surface-2 text-muted">
                {entity.entity_type}
              </span>
            </div>
            <h1 className="font-display mt-2 text-3xl sm:text-4xl text-strong font-medium">
              {entity.canonical_name}
            </h1>
            {entity.company && <p className="text-sm text-muted mt-1">{entity.company}</p>}
          </div>

          <div className="flex gap-2">
            <Link
              to={`/admin/investigations/new?entity=${entity.property_id}`}
              className="flex min-h-11 items-center gap-2 border border-signal bg-surface px-4 py-2 font-mono text-xs uppercase tracking-wider text-strong hover:bg-surface-2 transition-colors"
            >
              <Search size={14} className="text-signal" />
              Launch Investigation
            </Link>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs border-t border-hairline pt-4">
          <div>
            <span className="text-muted block text-[10px] uppercase">Sector</span>
            <span className="text-strong">{entity.sector || 'Unassigned'}</span>
          </div>
          <div>
            <span className="text-muted block text-[10px] uppercase">Region</span>
            <span className="text-strong">{entity.region || 'Global'}</span>
          </div>
          <div>
            <span className="text-muted block text-[10px] uppercase">Confidence</span>
            <span className="text-strong">
              {entity.confidence != null ? `${Math.round(entity.confidence * 100)}%` : '—'}
            </span>
          </div>
          <div>
            <span className="text-muted block text-[10px] uppercase">Last Updated</span>
            <span className="text-strong">{formatTimestamp(entity.updated_at || entity.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-hairline flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex min-h-11 items-center gap-1.5 px-3 py-2 text-xs font-mono tracking-wider uppercase transition-colors border-b-2 -mb-px ${
                isActive
                  ? 'border-signal text-strong font-semibold bg-surface'
                  : 'border-transparent text-muted hover:text-strong'
              }`}
            >
              <Icon size={13} className={isActive ? 'text-signal' : 'text-muted'} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content Display */}
      <div className="border border-hairline bg-surface p-6">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-lg text-strong mb-2">Canonical Intelligence Profile</h3>
              <p className="text-sm text-muted">
                Canonical identity synthesized across all ingestions, entity resolution agents, and corporate registry sources.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-3 border border-hairline bg-surface-2 space-y-1">
                <span className="text-faint text-[10px] uppercase">Canonical Name</span>
                <p className="text-strong text-sm">{entity.canonical_name}</p>
              </div>
              <div className="p-3 border border-hairline bg-surface-2 space-y-1">
                <span className="text-faint text-[10px] uppercase">Associated Corporation</span>
                <p className="text-strong text-sm">{entity.company || '—'}</p>
              </div>
              <div className="p-3 border border-hairline bg-surface-2 space-y-1">
                <span className="text-faint text-[10px] uppercase">City / Locality</span>
                <p className="text-strong text-sm">
                  {[entity.city, entity.locality].filter(Boolean).join(', ') || '—'}
                </p>
              </div>
              <div className="p-3 border border-hairline bg-surface-2 space-y-1">
                <span className="text-faint text-[10px] uppercase">Valuation / Price</span>
                <p className="text-strong text-sm">
                  {entity.price != null ? `$${formatNumber(entity.price, 2)}` : '—'}
                </p>
              </div>
              <div className="p-3 border border-hairline bg-surface-2 space-y-1">
                <span className="text-faint text-[10px] uppercase">Dossier Version</span>
                <p className="text-strong text-sm">v{entity.version}</p>
              </div>
              <div className="p-3 border border-hairline bg-surface-2 space-y-1">
                <span className="text-faint text-[10px] uppercase">Created In Repository</span>
                <p className="text-strong text-sm">{formatTimestamp(entity.created_at)}</p>
              </div>
            </div>
          </div>
        )}

        {/* ATTRIBUTES */}
        {activeTab === 'attributes' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg text-strong mb-1">Entity Attributes</h3>
              <p className="text-sm text-muted">
                Structured attribute payload extracted from filings, contracts, and verified disclosures.
              </p>
            </div>

            {Object.keys(entity.attributes || {}).length === 0 ? (
              <EmptyState title="No attributes recorded" body="This entity does not have an attributes payload stored." />
            ) : (
              <div className="overflow-x-auto border border-hairline">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-surface-2 border-b border-hairline text-muted uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Attribute</th>
                      <th className="p-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {Object.entries(entity.attributes).map(([key, val]) => (
                      <tr key={key} className="hover:bg-surface-2/40">
                        <td className="p-3 font-medium text-strong">{key}</td>
                        <td className="p-3 text-muted">
                          {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SIGNALS */}
        {activeTab === 'signals' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg text-strong mb-1">Signals Detected</h3>
              <p className="text-sm text-muted">
                Contradictions, silences, gaps, and alerts discovered for this entity by ECHO-SIGNAL.
              </p>
            </div>

            {loadingSignals ? (
              <Skeleton className="h-32 w-full" />
            ) : signalsData?.items?.length ? (
              <div className="divide-y divide-hairline border border-hairline">
                {signalsData.items.map((s) => (
                  <div key={s.signal_id} className="p-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-strong">{s.signal_type}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 border border-hairline text-muted">
                          {s.severity}
                        </span>
                        <span className="font-mono text-[10px] text-faint">
                          {formatTimestamp(s.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted mt-1.5">{s.description}</p>
                    </div>
                    <Link
                      to={`/admin/signals/${s.signal_id}`}
                      className="font-mono text-xs text-signal shrink-0 hover:underline"
                    >
                      Inspect &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No signals discovered"
                body="No active signals or anomalies currently detected for this corporate entity."
              />
            )}
          </div>
        )}

        {/* RISK */}
        {activeTab === 'risk' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg text-strong mb-1">Risk Assessment</h3>
              <p className="text-sm text-muted">
                Synthesized risk evaluation compiled by ECHO-RSA (Risk Synthesis Agent).
              </p>
            </div>

            {loadingRisk ? (
              <Skeleton className="h-40 w-full" />
            ) : riskData ? (
              <div className="space-y-4 font-mono text-xs">
                <div className="grid sm:grid-cols-3 gap-3 border border-hairline bg-surface-2 p-4">
                  <div>
                    <span className="text-faint text-[10px] uppercase">Overall Rating</span>
                    <p className="text-strong text-lg font-semibold">{riskData.overall_rating}</p>
                  </div>
                  <div>
                    <span className="text-faint text-[10px] uppercase">Overall Confidence</span>
                    <p className="text-strong text-lg font-semibold">
                      {riskData.overall_confidence != null ? `${Math.round(riskData.overall_confidence * 100)}%` : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-faint text-[10px] uppercase">Assessment Status</span>
                    <p className="text-health text-lg font-semibold">{riskData.status}</p>
                  </div>
                </div>

                {riskData.primary_concerns?.length > 0 && (
                  <div className="border border-hairline p-4">
                    <p className="font-semibold text-strong mb-2 uppercase text-[10px] tracking-wider">
                      Primary Concerns
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-muted">
                      {riskData.primary_concerns.map((concern, i) => (
                        <li key={i}>{concern}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="No risk assessment"
                body="No risk assessment record is available for this entity in the database."
              />
            )}
          </div>
        )}

        {/* ANALYSIS */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg text-strong mb-1">Financial Analysis</h3>
              <p className="text-sm text-muted">
                Financial and real estate metrics generated by ECHO-SVEA (Scenario Valuation Engine Agent).
              </p>
            </div>

            {loadingAnalysis ? (
              <Skeleton className="h-40 w-full" />
            ) : analysisData ? (
              <div className="space-y-4 font-mono text-xs">
                <div className="grid sm:grid-cols-2 gap-3 border border-hairline bg-surface-2 p-4">
                  <div>
                    <span className="text-faint text-[10px] uppercase">Analysis Status</span>
                    <p className="text-strong text-base">{analysisData.status}</p>
                  </div>
                  <div>
                    <span className="text-faint text-[10px] uppercase">Generated At</span>
                    <p className="text-strong text-base">{formatTimestamp(analysisData.created_at)}</p>
                  </div>
                </div>

                <div className="border border-hairline p-4">
                  <p className="font-semibold text-strong mb-2 uppercase text-[10px] tracking-wider">
                    Metrics Payload
                  </p>
                  <pre className="overflow-x-auto bg-surface-2 p-3 text-muted">
                    {JSON.stringify(analysisData.metrics_payload, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No analysis generated"
                body="Financial analysis has not yet been computed for this entity."
              />
            )}
          </div>
        )}

        {/* EVIDENCE */}
        {activeTab === 'evidence' && (
          <div className="border border-dashed border-hairline bg-surface-2/40 p-8 text-center space-y-2">
            <FileText size={24} className="text-muted mx-auto" />
            <h4 className="font-display text-lg text-strong">Evidence Records</h4>
            <p className="text-sm text-muted max-w-md mx-auto">
              Evidence records are not currently exposed through the frontend API.
            </p>
            <p className="font-mono text-[10px] text-faint">
              Atomic facts and document citations will appear here once the dedicated evidence endpoint is connected.
            </p>
          </div>
        )}

        {/* SOURCES */}
        {activeTab === 'sources' && (
          <div className="border border-dashed border-hairline bg-surface-2/40 p-8 text-center space-y-2">
            <FileText size={24} className="text-muted mx-auto" />
            <h4 className="font-display text-lg text-strong">Source Records</h4>
            <p className="text-sm text-muted max-w-md mx-auto">
              Source disclosure records are not currently exposed through the frontend API.
            </p>
            <p className="font-mono text-[10px] text-faint">
              Normalized disclosure documents and SEC filings will appear here when connected.
            </p>
          </div>
        )}

        {/* INVESTIGATION */}
        {activeTab === 'investigation' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg text-strong mb-1">Investigation Control</h3>
              <p className="text-sm text-muted">
                Trigger or review autonomous multi-agent investigations focused on {entity.canonical_name}.
              </p>
            </div>

            <div className="border border-hairline bg-surface-2 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-semibold text-strong">New Multi-Agent Run</p>
                <p className="text-xs text-muted mt-0.5">
                  Execute the complete ECHO pipeline (Source &rarr; Signal &rarr; Risk &rarr; Report) against this entity.
                </p>
              </div>
              <Link
                to={`/admin/investigations/new?entity=${entity.property_id}`}
                className="flex min-h-11 items-center justify-center gap-1.5 border border-signal bg-surface px-4 py-2 font-mono text-xs uppercase tracking-wider text-strong hover:bg-surface transition-colors shrink-0"
              >
                <Search size={14} className="text-signal" />
                Launch Pipeline
              </Link>
            </div>
          </div>
        )}

        {/* AUDIT */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg text-strong mb-1">Immutable Audit Trail</h3>
              <p className="text-sm text-muted">
                Step-by-step cryptographic audit records logged by ECHO agents during entity ingestion and updates.
              </p>
            </div>

            {loadingAudit ? (
              <Skeleton className="h-40 w-full" />
            ) : auditData?.length ? (
              <div className="relative border-l-2 border-hairline pl-4 space-y-6 font-mono text-xs my-4">
                {auditData.map((rec) => (
                  <div key={rec.record_id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-signal" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-strong">{rec.payload_type}</span>
                        <span className="text-[10px] px-1.5 py-0.5 border border-hairline text-muted">
                          {rec.agent_id}
                        </span>
                        <span className="text-faint text-[10px]">{formatTimestamp(rec.created_at)}</span>
                      </div>
                      <p className="text-muted text-[11px] mt-1">
                        Run: <span className="text-strong">{rec.run_id}</span> &bull; Version: {rec.record_version}
                      </p>
                      {rec.payload && (
                        <pre className="mt-2 p-2 bg-surface-2 border border-hairline text-[10px] text-muted overflow-x-auto">
                          {JSON.stringify(rec.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No audit records"
                body="No audit trail records found for this entity."
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
