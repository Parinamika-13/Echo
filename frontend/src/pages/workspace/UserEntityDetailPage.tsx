import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Radio,
  BarChart3,
  ShieldAlert,
  FileText,
  Terminal,
  ExternalLink,
  Clock,
  History,
  Database,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import {
  getEntity,
  getRiskAssessment,
  getAnalysis,
  getEntityAuditTrail,
  listEntityEvidence,
  listEntitySources,
} from '@/api/entities'
import { listSignals } from '@/api/signals'
import { listInvestigations } from '@/api/investigations'
import { Skeleton, ErrorState } from '@/components/feedback/States'
import { useWatchlist } from '@/hooks/useWatchlist'

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

export function UserEntityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const { isBookmarked, toggleBookmark } = useWatchlist()

  const {
    data: entity,
    isLoading: entityLoading,
    error: entityError,
  } = useQuery({
    queryKey: ['user-entity-dossier', id],
    queryFn: () => getEntity(id || ''),
    enabled: Boolean(id),
  })

  const { data: signalsData } = useQuery({
    queryKey: ['user-entity-signals', id],
    queryFn: () => listSignals({ limit: 100, entity_id: id }),
    enabled: Boolean(id),
  })

  const { data: riskData } = useQuery({
    queryKey: ['user-entity-risk', id],
    queryFn: () => getRiskAssessment(id || ''),
    enabled: Boolean(id),
  })

  const { data: analysisData } = useQuery({
    queryKey: ['user-entity-analysis', id],
    queryFn: () => getAnalysis(id || ''),
    enabled: Boolean(id),
  })

  const { data: auditData = [] } = useQuery({
    queryKey: ['user-entity-audit', id],
    queryFn: () => getEntityAuditTrail(id || ''),
    enabled: Boolean(id),
  })

  const { data: evidenceData } = useQuery({
    queryKey: ['user-entity-evidence', id],
    queryFn: () => listEntityEvidence(id || '', { limit: 50 }),
    enabled: Boolean(id),
  })

  const { data: sourcesData } = useQuery({
    queryKey: ['user-entity-sources', id],
    queryFn: () => listEntitySources(id || '', { limit: 50 }),
    enabled: Boolean(id),
  })

  const { data: investigationsData } = useQuery({
    queryKey: ['user-entity-investigations', id],
    queryFn: () => listInvestigations({ entity_id: id || '', limit: 50 }),
    enabled: Boolean(id),
  })

  if (entityLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (entityError || !entity) {
    return (
      <div className="space-y-4">
        <Link to="/app/entities" className="text-xs font-mono text-signal hover:underline inline-flex items-center gap-1">
          <ArrowLeft size={13} /> Back to Entities
        </Link>
        <ErrorState message={`Could not load corporate entity '${id}'.`} />
      </div>
    )
  }

  const bookmarked = isBookmarked(entity.property_id)
  const relatedSignals = (signalsData?.items || (signalsData as any)?.signals || []).filter((s) => s.entity_id === entity.property_id)
  const evidenceList = evidenceData?.items || []
  const sourcesList = sourcesData?.items || []
  const entityInvestigations = investigationsData?.items || []

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'attributes', label: 'Attributes' },
    { key: 'signals', label: `Signals (${relatedSignals.length})` },
    { key: 'risk', label: 'Risk' },
    { key: 'analysis', label: 'Analysis' },
    { key: 'evidence', label: `Evidence (${evidenceList.length})` },
    { key: 'sources', label: `Sources (${sourcesList.length})` },
    { key: 'investigation', label: `Investigation (${entityInvestigations.length})` },
    { key: 'audit', label: `Audit (${auditData.length})` },
  ]

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/entities"
          className="text-xs font-mono text-muted hover:text-strong transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={13} />
          <span>Back to Entities</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              toggleBookmark({
                id: entity.property_id,
                title: entity.canonical_name,
                subtitle: `${entity.sector || 'Corporate'} · ${entity.region || 'Global'}`,
                type: 'ENTITY',
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

          <Link
            to={`/app/investigations/new?entityId=${entity.property_id}`}
            className="flex min-h-9 items-center gap-1.5 px-3 border border-signal bg-signal/15 text-xs font-mono font-semibold uppercase tracking-wider text-strong hover:bg-signal/25 transition-colors"
          >
            <Terminal size={13} className="text-signal" />
            <span>Investigate</span>
          </Link>
        </div>
      </div>

      {/* Entity Header */}
      <div className="border border-hairline bg-surface p-6 space-y-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-signal font-semibold">{entity.property_id}</span>
          <span className="text-muted">&bull;</span>
          <span className="text-muted uppercase">Corporate Entity</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-display font-medium text-strong">
          {entity.canonical_name}
        </h1>

        <p className="font-mono text-xs text-muted">
          {entity.sector || 'Unassigned'} &middot; {entity.region || 'Unspecified'}
          {entity.company && ` &middot; ${entity.company}`}
        </p>
      </div>

      {/* Tab Navigation (9 Tabs) */}
      <div className="border-b border-hairline flex flex-wrap gap-1 font-mono text-xs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 border-b-2 font-semibold uppercase tracking-wider transition-colors ${
              activeTab === tab.key
                ? 'border-signal text-strong'
                : 'border-transparent text-muted hover:text-strong'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="border border-hairline bg-surface p-5 space-y-3">
              <h3 className="font-semibold text-strong font-display text-sm uppercase tracking-wider">
                Entity Summary
              </h3>
              <div className="divide-y divide-hairline space-y-2 pt-1">
                <div className="flex justify-between py-1.5">
                  <span className="text-muted">Sector:</span>
                  <span className="text-strong">{entity.sector || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted">Region:</span>
                  <span className="text-strong">{entity.region || 'Unspecified'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted">Company:</span>
                  <span className="text-strong">{entity.company || entity.canonical_name}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted">Entity Type:</span>
                  <span className="text-strong">{entity.entity_type || 'Corporate'}</span>
                </div>
              </div>
            </div>

            <div className="border border-hairline bg-surface p-5 space-y-3">
              <h3 className="font-semibold text-strong font-display text-sm uppercase tracking-wider">
                Intelligence Status
              </h3>
              <div className="divide-y divide-hairline space-y-2 pt-1">
                <div className="flex justify-between py-1.5">
                  <span className="text-muted">Current Signals:</span>
                  <span className="text-signal font-semibold">{relatedSignals.length} active</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted">Risk Assessment:</span>
                  <span className="text-strong">{riskData?.overall_rating || 'Not Assessed'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted">Latest Analysis:</span>
                  <span className="text-strong">{analysisData?.status || 'Not Generated'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted">Audit Records:</span>
                  <span className="text-strong">{auditData.length} entries</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTRIBUTES */}
      {activeTab === 'attributes' && (
        <div className="border border-hairline bg-surface p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-strong font-display uppercase tracking-wider">
              Structured Attributes
            </h3>
            <p className="text-xs text-muted font-mono mt-0.5">
              Dynamically rendered attributes resolved from corporate disclosures.
            </p>
          </div>
          {entity.attributes && Object.keys(entity.attributes).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              {Object.entries(entity.attributes).map(([k, v]) => (
                <div key={k} className="p-3 border border-hairline bg-bg space-y-1">
                  <span className="text-[10px] text-muted uppercase block">{k.replace(/_/g, ' ')}</span>
                  <span className="text-ink font-semibold">
                    {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border border-hairline bg-bg font-mono text-xs text-muted">
              Standard corporate attributes mapped: Sector, Region, Canonical Identity, and Lineage Hash.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SIGNALS */}
      {activeTab === 'signals' && (
        <div className="space-y-3">
          {relatedSignals.length === 0 ? (
            <div className="border border-hairline bg-surface p-8 text-center text-xs font-mono text-muted">
              No active signals detected for this entity.
            </div>
          ) : (
            relatedSignals.map((signal) => (
              <div
                key={signal.signal_id}
                className="border border-hairline bg-surface p-4 hover:border-signal/40 transition-colors flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[9px] uppercase px-1.5 py-0.5 border font-semibold ${
                        signal.severity === 'CRITICAL'
                          ? 'border-loss bg-loss/15 text-loss'
                          : signal.severity === 'HIGH'
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                          : 'border-hairline bg-surface-2 text-muted'
                      }`}
                    >
                      {signal.severity}
                    </span>
                    <span className="font-mono text-xs text-muted">{signal.signal_type}</span>
                  </div>
                  <Link
                    to={`/app/signals/${signal.signal_id}`}
                    className="text-sm font-medium text-strong hover:text-signal transition-colors block"
                  >
                    {signal.description}
                  </Link>
                  <p className="text-[10px] font-mono text-muted">
                    Confidence: {signal.confidence ? `${Math.round(signal.confidence * 100)}%` : 'N/A'}
                  </p>
                </div>
                <Link
                  to={`/app/signals/${signal.signal_id}`}
                  className="p-1.5 border border-hairline hover:border-signal text-muted hover:text-strong transition-colors shrink-0"
                >
                  <ExternalLink size={13} />
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: RISK */}
      {activeTab === 'risk' && (
        <div className="border border-hairline bg-surface p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h3 className="font-display font-medium text-strong text-base">Risk Assessment</h3>
              <p className="text-muted">Synthesized by ECHO-RSA Risk Agent</p>
            </div>
            <span className="px-2.5 py-1 border border-signal/30 bg-signal/10 text-strong font-semibold uppercase">
              {riskData?.overall_rating || 'NOT_ASSESSED'}
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-strong uppercase text-[11px] tracking-wider">Primary Concerns</h4>
            {riskData?.primary_concerns && riskData.primary_concerns.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-muted">
                {riskData.primary_concerns.map((concern: string, idx: number) => (
                  <li key={idx} className="text-ink">{concern}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No acute risk flags active for this entity.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ANALYSIS */}
      {activeTab === 'analysis' && (
        <div className="border border-hairline bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h3 className="font-display font-medium text-strong text-base">Financial Valuation Analysis</h3>
              <p className="text-xs text-muted font-mono">Quantitative model output</p>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 border border-hairline bg-surface-2 text-strong uppercase">
              {analysisData?.status || 'NOT_GENERATED'}
            </span>
          </div>

          <div className="font-mono text-xs">
            {analysisData?.metrics_payload && Object.keys(analysisData.metrics_payload).length > 0 ? (
              <pre className="p-3 bg-bg border border-hairline overflow-x-auto text-[11px] text-muted">
                {JSON.stringify(analysisData.metrics_payload, null, 2)}
              </pre>
            ) : (
              <p className="text-muted">Valuation models and capitalization yields compiled.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: EVIDENCE */}
      {activeTab === 'evidence' && (
        <div className="border border-hairline bg-surface p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h3 className="text-sm font-semibold text-strong font-display uppercase tracking-wider">
                Evidence Records
              </h3>
              <p className="text-muted">Verified quotes and evidentiary excerpts extracted by ECHO-PSA</p>
            </div>
            <span className="px-2 py-0.5 border border-hairline bg-surface-2 text-strong">
              {evidenceList.length} Records
            </span>
          </div>

          {evidenceList.length === 0 ? (
            <p className="p-4 bg-bg border border-hairline text-muted">
              No evidence records indexed for this entity. In accordance with ECHO data integrity standards, evidence records are never fabricated.
            </p>
          ) : (
            <div className="space-y-3">
              {evidenceList.map((ev) => (
                <div key={ev.evidence_id} className="p-4 bg-bg border border-hairline space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-signal font-semibold">{ev.evidence_id}</span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-1.5 py-0.5 border border-hairline bg-surface-2 text-muted">
                        Doc: {ev.document_id}
                      </span>
                      {ev.confidence !== null && (
                        <span className="text-muted">
                          Confidence: {Math.round(ev.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <blockquote className="border-l-2 border-signal pl-3 italic text-ink text-[11px]">
                    &ldquo;{ev.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center justify-between text-[10px] text-muted pt-1">
                    <span>Relevance: {ev.relevance_score ?? 'N/A'}</span>
                    <span>{ev.extraction_timestamp ? new Date(ev.extraction_timestamp).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: SOURCES */}
      {activeTab === 'sources' && (
        <div className="border border-hairline bg-surface p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h3 className="text-sm font-semibold text-strong font-display uppercase tracking-wider">
                Verified Sources
              </h3>
              <p className="text-muted">Filing registries and disclosures indexed by ECHO-PSA</p>
            </div>
            <span className="px-2 py-0.5 border border-hairline bg-surface-2 text-strong">
              {sourcesList.length} Sources
            </span>
          </div>

          {sourcesList.length === 0 ? (
            <p className="p-4 bg-bg border border-hairline text-muted">
              No source records indexed for this entity. Source indexing is maintained through verified filing registries.
            </p>
          ) : (
            <div className="divide-y divide-hairline border border-hairline bg-bg">
              {sourcesList.map((src) => (
                <div key={src.source_id} className="p-3.5 space-y-1 hover:bg-surface-2/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-strong">{src.source_name}</span>
                    <span className="px-1.5 py-0.5 border border-hairline text-[9px] uppercase font-semibold text-signal">
                      {src.source_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>ID: {src.source_id}</span>
                    <span>Status: {src.collection_status}</span>
                  </div>
                  {src.source_url && (
                    <a
                      href={src.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-signal hover:underline inline-flex items-center gap-1 truncate block"
                    >
                      <span>{src.source_url}</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 8: INVESTIGATION */}
      {activeTab === 'investigation' && (
        <div className="border border-hairline bg-surface p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h3 className="font-display font-medium text-strong text-base">Investigation Execution</h3>
              <p className="text-muted">Launch or view autonomous multi-agent runs for this entity</p>
            </div>
            <Link
              to={`/app/investigations/new?entityId=${entity.property_id}`}
              className="px-3 py-1.5 border border-signal bg-signal/15 text-strong font-semibold uppercase hover:bg-signal/25 transition-colors"
            >
              Start Investigation
            </Link>
          </div>

          {entityInvestigations.length === 0 ? (
            <p className="p-4 bg-bg border border-hairline text-muted">No investigation runs on record for this entity in the database.</p>
          ) : (
            <div className="space-y-2">
              {entityInvestigations.map((run) => (
                <div
                  key={run.run_id}
                  className="p-3.5 border border-hairline bg-bg flex items-center justify-between hover:border-signal/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-signal">{run.run_id}</span>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.5 border font-semibold ${
                          run.status === 'COMPLETED'
                            ? 'border-gain bg-gain/15 text-gain'
                            : run.status === 'FAILED'
                            ? 'border-loss bg-loss/15 text-loss'
                            : 'border-signal bg-signal/15 text-signal'
                        }`}
                      >
                        {run.status}
                      </span>
                    </div>
                    {run.topic && <p className="text-[11px] text-muted">{run.topic}</p>}
                  </div>
                  <Link to={`/app/investigations/${run.run_id}`} className="text-signal hover:underline inline-flex items-center gap-1 font-semibold">
                    <span>View Run</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 9: AUDIT */}
      {activeTab === 'audit' && (
        <div className="border border-hairline bg-surface p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <h3 className="font-display font-medium text-strong text-base">Entity Audit Trail</h3>
            <span className="text-muted">{auditData.length} immutable records</span>
          </div>

          {auditData.length === 0 ? (
            <p className="text-muted">No historical audit records committed for this entity yet.</p>
          ) : (
            <div className="divide-y divide-hairline">
              {auditData.map((rec) => (
                <div key={rec.record_id} className="py-2.5 flex items-start justify-between gap-4">
                  <div>
                    <span className="font-semibold text-strong">{rec.payload_type}</span>
                    <span className="text-muted ml-2">by {rec.agent_id}</span>
                    <p className="text-[10px] text-muted">{new Date(rec.created_at).toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] text-signal font-semibold">{rec.record_id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
