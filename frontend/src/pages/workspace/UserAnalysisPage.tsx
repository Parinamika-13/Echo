import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, Search, FileText } from 'lucide-react'
import { listAnalyses, listEntities } from '@/api/entities'
import { Skeleton, ErrorState, EmptyState } from '@/components/feedback/States'

export function UserAnalysisPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: analysesData, isLoading: analysesLoading, error: analysesError, refetch } = useQuery({
    queryKey: ['user-analyses-table'],
    queryFn: () => listAnalyses({ limit: 50 }),
  })

  const { data: entitiesData, isLoading: entitiesLoading } = useQuery({
    queryKey: ['user-analyses-entities-lookup'],
    queryFn: () => listEntities({ limit: 100 }),
  })

  const entities = entitiesData?.properties || entitiesData?.items || []
  const analyses = analysesData?.items || []

  const entitiesMap = useMemo(() => {
    const map = new Map<string, (typeof entities)[0]>()
    entities.forEach((e) => map.set(e.property_id, e))
    return map
  }, [entities])

  const filteredAnalyses = useMemo(() => {
    return analyses.filter((a) => {
      if (!searchTerm) return true
      const q = searchTerm.toLowerCase()
      const entity = entitiesMap.get(a.entity_id)
      return (
        a.analysis_id.toLowerCase().includes(q) ||
        a.entity_id.toLowerCase().includes(q) ||
        (entity?.canonical_name && entity.canonical_name.toLowerCase().includes(q)) ||
        (entity?.sector && entity.sector.toLowerCase().includes(q))
      )
    })
  }, [analyses, searchTerm, entitiesMap])

  const isLoading = analysesLoading || entitiesLoading

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-strong">Financial Analysis</h1>
          <p className="text-xs sm:text-sm text-muted">
            Review quantitative financial analysis records generated from ECHO&apos;s pipeline.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search analyses by entity name, ID, or analysis ID..."
          className="min-h-10 w-full border border-hairline bg-surface px-3 pl-9 text-xs text-ink placeholder:text-muted/60 focus:border-signal focus:outline-none font-mono"
        />
        <Search size={14} className="text-muted absolute left-3 top-3" />
      </div>

      {/* Table / Cards */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : analysesError ? (
        <ErrorState message="Could not load financial analyses." onRetry={refetch} />
      ) : filteredAnalyses.length === 0 ? (
        <EmptyState
          title="No Analyses Found"
          message="No quantitative financial analysis records match the specified query."
        />
      ) : (
        <div className="border border-hairline bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-2 border-b border-hairline text-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Analysis ID</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Confidence</th>
                  <th className="p-3.5">Created</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredAnalyses.map((a) => {
                  const entity = entitiesMap.get(a.entity_id)
                  return (
                    <tr key={a.analysis_id} className="hover:bg-surface-2/60 transition-colors">
                      <td className="p-3.5 font-mono text-signal font-semibold">
                        {a.analysis_id}
                      </td>
                      <td className="p-3.5 font-sans font-medium text-strong">
                        <span className="font-mono text-xs text-muted mr-2">{a.entity_id}</span>
                        <Link to={`/app/analysis/${a.entity_id}`} className="hover:text-signal hover:underline">
                          {entity?.canonical_name || a.entity_id}
                        </Link>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 border text-[10px] font-semibold uppercase ${
                          a.status === 'COMPLETED' || a.status === 'ACTIVE'
                            ? 'border-gain/30 bg-gain/10 text-gain'
                            : 'border-hairline bg-surface-2 text-muted'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-muted">
                        {a.confidence != null ? `${(a.confidence * 100).toFixed(0)}%` : '—'}
                      </td>
                      <td className="p-3.5 text-muted">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          to={`/app/analysis/${a.entity_id}`}
                          className="inline-flex items-center gap-1 border border-hairline px-3 py-1 text-xs text-strong hover:bg-surface-3 transition-colors"
                        >
                          <FileText size={12} className="text-signal" />
                          <span>Dossier</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

