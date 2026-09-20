import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight, Eye, Building2 } from 'lucide-react'
import { listEntities } from '@/api/entities'
import { Skeleton, ErrorState, EmptyState } from '@/components/feedback/States'
import { formatNumber, formatTimestamp } from '@/lib/format'

export function EntitiesPage() {
  const [page, setPage] = useState(0)
  const pageSize = 20
  const [searchTerm, setSearchTerm] = useState('')
  const [sectorFilter, setSectorFilter] = useState<string>('')
  const [regionFilter, setRegionFilter] = useState<string>('')
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['entities', page, sectorFilter, regionFilter, entityTypeFilter],
    queryFn: () =>
      listEntities({
        limit: pageSize,
        offset: page * pageSize,
        sector: sectorFilter || undefined,
        region: regionFilter || undefined,
        entity_type: entityTypeFilter || undefined,
      }),
  })

  // Filter in memory for instantaneous search term typing across current page or canonical names
  const items = data?.items?.filter((e) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (
      e.canonical_name?.toLowerCase().includes(q) ||
      e.property_id?.toLowerCase().includes(q) ||
      e.company?.toLowerCase().includes(q)
    )
  }) || []

  const totalPages = Math.ceil((data?.total || 0) / pageSize)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 16. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-hairline pb-5 gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-[0.28em] text-signal uppercase">Master Registry</p>
          <h1 className="font-display mt-1 text-3xl sm:text-4xl text-strong font-medium">Corporate Entities</h1>
          <p className="mt-1 text-sm text-muted">
            Explore and inspect corporate disclosure entities processed and canonicalized by ECHO.
          </p>
        </div>
        <div className="font-mono text-xs text-muted">
          Total verified records: <span className="text-strong font-semibold">{formatNumber(data?.total)}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-3 border border-hairline bg-surface p-3">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 border border-hairline bg-bg px-3 py-2">
          <Search size={16} className="text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search entities by name, ID, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-strong outline-none placeholder:text-muted"
          />
        </div>

        {/* Sector filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sectorFilter}
            onChange={(e) => {
              setSectorFilter(e.target.value)
              setPage(0)
            }}
            aria-label="Filter by Sector"
            className="border border-hairline bg-bg px-3 py-2 text-xs font-mono text-strong outline-none"
          >
            <option value="">All Sectors</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Commercial">Commercial</option>
            <option value="Financial">Financial</option>
            <option value="Industrial">Industrial</option>
            <option value="Infrastructure">Infrastructure</option>
          </select>

          {/* Region filter */}
          <select
            value={regionFilter}
            onChange={(e) => {
              setRegionFilter(e.target.value)
              setPage(0)
            }}
            aria-label="Filter by Region"
            className="border border-hairline bg-bg px-3 py-2 text-xs font-mono text-strong outline-none"
          >
            <option value="">All Regions</option>
            <option value="North America">North America</option>
            <option value="Europe">Europe</option>
            <option value="Asia">Asia</option>
            <option value="Global">Global</option>
          </select>

          {/* Entity Type */}
          <select
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value)
              setPage(0)
            }}
            aria-label="Filter by Entity Type"
            className="border border-hairline bg-bg px-3 py-2 text-xs font-mono text-strong outline-none"
          >
            <option value="">All Entity Types</option>
            <option value="CORPORATE">CORPORATE</option>
            <option value="REAL_ESTATE">REAL_ESTATE</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {error ? (
        <ErrorState
          title="Failed to load entities"
          body={error instanceof Error ? error.message : 'Unknown network error.'}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No entities found"
          body="No records matched the selected query and filters in the ECHO database."
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-hairline bg-surface">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-hairline bg-surface-2 text-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Entity</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Sector</th>
                  <th className="p-3">Region</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Updated</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {items.map((entity) => (
                  <tr key={entity.property_id} className="hover:bg-surface-2/60 transition-colors">
                    <td className="p-3">
                      <Link
                        to={`/admin/entities/${entity.property_id}`}
                        className="font-medium text-strong hover:text-signal transition-colors block font-sans text-sm"
                      >
                        {entity.canonical_name}
                      </Link>
                      <span className="text-[10px] text-muted">{entity.property_id}</span>
                    </td>
                    <td className="p-3 text-muted">{entity.company || '—'}</td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 border border-hairline bg-surface-2 text-strong text-[10px]">
                        {entity.sector || 'Unassigned'}
                      </span>
                    </td>
                    <td className="p-3 text-muted">{entity.region || '—'}</td>
                    <td className="p-3 text-muted">{entity.entity_type}</td>
                    <td className="p-3 text-muted">
                      {entity.confidence != null ? `${Math.round(entity.confidence * 100)}%` : '—'}
                    </td>
                    <td className="p-3 text-muted">{formatTimestamp(entity.updated_at || entity.created_at)}</td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/admin/entities/${entity.property_id}`}
                        className="inline-flex min-h-11 items-center gap-1 border border-hairline bg-surface-2 px-2.5 py-1 text-signal hover:border-signal transition-colors"
                      >
                        <Eye size={12} />
                        <span>Dossier</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (No horizontal overflow) */}
          <div className="grid md:hidden gap-3">
            {items.map((entity) => (
              <div key={entity.property_id} className="border border-hairline bg-surface p-4 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="font-mono text-[10px] text-muted">{entity.property_id}</p>
                    <h3 className="font-medium text-strong text-base">{entity.canonical_name}</h3>
                    {entity.company && <p className="text-xs text-muted">{entity.company}</p>}
                  </div>
                  <span className="shrink-0 px-2 py-0.5 border border-hairline bg-surface-2 font-mono text-[10px] text-strong">
                    {entity.sector || entity.entity_type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs border-t border-hairline pt-2 text-muted">
                  <div>
                    <span className="block text-[10px] uppercase text-faint">Region</span>
                    <span className="text-strong">{entity.region || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-faint">Confidence</span>
                    <span className="text-strong">
                      {entity.confidence != null ? `${Math.round(entity.confidence * 100)}%` : '—'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline flex justify-end">
                  <Link
                    to={`/admin/entities/${entity.property_id}`}
                    className="flex min-h-11 w-full items-center justify-center gap-1.5 border border-signal bg-surface px-4 py-2 font-mono text-xs text-strong uppercase tracking-wider"
                  >
                    <Eye size={14} className="text-signal" />
                    Inspect Dossier
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-hairline pt-4 font-mono text-xs text-muted">
            <div>
              Page <span className="text-strong font-medium">{page + 1}</span> of{' '}
              <span className="text-strong font-medium">{Math.max(1, totalPages)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="flex min-h-11 items-center gap-1 border border-hairline px-3 py-1.5 text-strong hover:bg-surface-2 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex min-h-11 items-center gap-1 border border-hairline px-3 py-1.5 text-strong hover:bg-surface-2 disabled:opacity-30 disabled:pointer-events-none"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
