import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Fingerprint, Search, Building2, Clock, Bot, ShieldCheck, ArrowRight, Filter } from 'lucide-react'
import { listAuditRecords } from '@/api/audit'
import { Skeleton, ErrorState, EmptyState } from '@/components/feedback/States'
import { formatTimestamp, formatNumber } from '@/lib/format'

export function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)

  const {
    data: auditData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminAuditLedger', searchTerm],
    queryFn: () => listAuditRecords({ limit: 50, search: searchTerm.trim() || undefined }),
  })

  const records = auditData?.items || []
  const totalCount = auditData?.total || 0

  const activeRecord = selectedRecordId
    ? records.find((r) => r.record_id === selectedRecordId) || records[0]
    : records[0]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-hairline pb-5 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] tracking-[0.28em] text-signal uppercase font-semibold">
              Provenance &amp; Compliance
            </span>
            <span className="font-mono text-[9px] px-1.5 py-0.2 border border-amber-500/40 bg-amber-500/10 text-amber-400 uppercase font-semibold">
              Admin Only
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-strong font-medium">Cryptographic Audit Ledger</h1>
          <p className="mt-1 text-sm text-muted">
            Inspect immutable historical audit records, agent provenance, and synthesized payloads committed across the platform.
          </p>
        </div>

        <div className="font-mono text-xs text-muted">
          Ledger Records: <strong className="text-strong">{formatNumber(totalCount)}</strong>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 border border-hairline bg-surface px-4 py-2.5">
        <Search size={16} className="text-muted shrink-0" />
        <input
          type="text"
          placeholder="Filter audit ledger by Record ID, Target Entity, Investigation Run ID, or Payload Type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs font-mono text-strong outline-none placeholder:text-muted"
        />
      </div>

      {/* Main Audit Grid: Left = List, Right = Detailed Inspection */}
      {error ? (
        <ErrorState
          title="Failed to query audit ledger"
          body={error instanceof Error ? error.message : 'Database query error.'}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          title="No Audit Records Found"
          body={searchTerm ? 'No ledger entries matched your query.' : 'No audit records committed in PostgreSQL.'}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ledger List */}
          <div className="lg:col-span-2 border border-hairline bg-surface overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-surface-2 border-b border-hairline text-muted uppercase text-[10px]">
                <tr>
                  <th className="p-3">Record ID</th>
                  <th className="p-3">Entity ID</th>
                  <th className="p-3">Actor / Agent</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {records.map((r) => {
                  const isSelected = activeRecord?.record_id === r.record_id
                  return (
                    <tr
                      key={r.record_id}
                      onClick={() => setSelectedRecordId(r.record_id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-signal/15 border-l-2 border-signal font-medium'
                          : 'hover:bg-surface-2/60'
                      }`}
                    >
                      <td className="p-3 text-signal font-semibold">
                        {r.record_id}
                      </td>
                      <td className="p-3 font-sans text-strong">
                        <Link
                          to={`/admin/entities/${r.entity_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-signal hover:underline"
                        >
                          {r.entity_id}
                        </Link>
                      </td>
                      <td className="p-3 text-muted">{r.agent_id}</td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 border border-hairline bg-surface-2 text-[10px] text-muted uppercase">
                          {r.payload_type}
                        </span>
                      </td>
                      <td className="p-3 text-muted text-[11px]">{formatTimestamp(r.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Active Record Dossier */}
          {activeRecord && (
            <div className="border border-hairline bg-surface p-5 space-y-4 font-mono text-xs">
              <div className="border-b border-hairline pb-3">
                <span className="text-[10px] text-signal uppercase tracking-wider block font-semibold">
                  Ledger Record Inspector
                </span>
                <h3 className="font-display text-lg text-strong font-medium mt-1">
                  {activeRecord.record_id}
                </h3>
                <span className="text-[11px] text-muted block mt-0.5">
                  Version {activeRecord.record_version} &bull; {activeRecord.payload_type}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-hairline/60">
                  <span className="text-muted">Target Entity:</span>
                  <Link to={`/admin/entities/${activeRecord.entity_id}`} className="text-signal hover:underline">
                    {activeRecord.entity_id}
                  </Link>
                </div>
                <div className="flex justify-between py-1 border-b border-hairline/60">
                  <span className="text-muted">Committing Agent:</span>
                  <span className="text-strong">{activeRecord.agent_id} (v{activeRecord.agent_version})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-hairline/60">
                  <span className="text-muted">Orchestration Run:</span>
                  <Link to={`/admin/investigations/${activeRecord.run_id}`} className="text-signal hover:underline">
                    {activeRecord.run_id}
                  </Link>
                </div>
                <div className="flex justify-between py-1 border-b border-hairline/60">
                  <span className="text-muted">Confidence:</span>
                  <span className="text-strong">
                    {activeRecord.confidence != null ? activeRecord.confidence : '1.0'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-hairline/60">
                  <span className="text-muted">Committed At:</span>
                  <span className="text-strong">{formatTimestamp(activeRecord.created_at)}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-muted uppercase block mb-1 font-semibold">Raw Immutable Payload</span>
                <pre className="p-3 border border-hairline bg-bg text-[11px] text-strong overflow-x-auto max-h-72">
                  {JSON.stringify(activeRecord.payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
