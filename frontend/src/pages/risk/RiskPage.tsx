import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Search, Eye, Building2 } from 'lucide-react'
import { listEntities } from '@/api/entities'
import { Skeleton, ErrorState, EmptyState } from '@/components/feedback/States'
import { formatNumber, formatTimestamp } from '@/lib/format'

export function RiskPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: entitiesData, isLoading, error, refetch } = useQuery({
    queryKey: ['riskEntities'],
    queryFn: () => listEntities({ limit: 50 }),
  })

  const items = useMemo(() => {
    return (entitiesData?.items || []).filter((e) => {
      if (!searchTerm) return true
      const q = searchTerm.toLowerCase()
      return (
        e.canonical_name?.toLowerCase().includes(q) ||
        e.property_id?.toLowerCase().includes(q) ||
        e.company?.toLowerCase().includes(q)
      )
    })
  }, [entitiesData, searchTerm])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 23. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-hairline pb-5 gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-[0.28em] text-signal uppercase">Risk Command Center</p>
          <h1 className="font-display mt-1 text-3xl sm:text-4xl text-strong font-medium">Risk Assessments</h1>
          <p className="mt-1 text-sm text-muted">
            Continuous exposure evaluation, concern factor synthesis, and materiality ratings.
          </p>
        </div>
        <div className="font-mono text-xs text-muted">
          Evaluated entities: <span className="text-strong font-semibold">{formatNumber(entitiesData?.total)}</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 border border-hairline bg-surface p-3">
        <Search size={16} className="text-muted shrink-0" />
        <input
          type="text"
          placeholder="Search risk assessment records by entity ID or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-strong outline-none placeholder:text-muted"
        />
      </div>

      {/* Content */}
      {error ? (
        <ErrorState
          title="Failed to load risk registry"
          body={error instanceof Error ? error.message : 'Unknown network failure.'}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No risk assessments found"
          body="No risk records match your search criteria."
        />
      ) : (
        <div className="overflow-x-auto border border-hairline bg-surface">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-surface-2 border-b border-hairline text-muted uppercase text-[10px]">
              <tr>
                <th className="p-3">Entity ID</th>
                <th className="p-3">Company / Entity</th>
                <th className="p-3">Sector</th>
                <th className="p-3">Region</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Last Updated</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {items.map((entity) => (
                <tr key={entity.property_id} className="hover:bg-surface-2/40">
                  <td className="p-3">
                    <Link
                      to={`/admin/risk/${entity.property_id}`}
                      className="font-medium text-strong hover:text-signal block"
                    >
                      {entity.property_id}
                    </Link>
                  </td>
                  <td className="p-3">
                    <span className="font-sans font-medium text-strong block">{entity.canonical_name}</span>
                    {entity.company && <span className="text-[10px] text-muted">{entity.company}</span>}
                  </td>
                  <td className="p-3 text-muted">{entity.sector || 'Unassigned'}</td>
                  <td className="p-3 text-muted">{entity.region || '—'}</td>
                  <td className="p-3 text-muted">
                    {entity.confidence != null ? `${Math.round(entity.confidence * 100)}%` : '—'}
                  </td>
                  <td className="p-3 text-muted">{formatTimestamp(entity.updated_at || entity.created_at)}</td>
                  <td className="p-3 text-right">
                    <Link
                      to={`/admin/risk/${entity.property_id}`}
                      className="inline-flex min-h-11 items-center gap-1 border border-hairline px-2.5 py-1 text-signal hover:border-signal"
                    >
                      <Eye size={12} />
                      Risk Dossier
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
