import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight, Eye, Building2, Bookmark, BookmarkCheck, ArrowRight } from 'lucide-react'
import { listEntities } from '@/api/entities'
import { listSignals } from '@/api/signals'
import { Skeleton, ErrorState, EmptyState } from '@/components/feedback/States'
import { useWatchlist } from '@/hooks/useWatchlist'

export function UserEntitiesPage() {
  const [page, setPage] = useState(0)
  const pageSize = 20
  const [rawSearch, setRawSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [riskFilter, setRiskFilter] = useState('')

  const { isBookmarked, toggleBookmark } = useWatchlist()

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(rawSearch)
      setPage(0)
    }, 250)
    return () => clearTimeout(timer)
  }, [rawSearch])

  const { data: entitiesData, isLoading: entitiesLoading, error: entitiesError, refetch } = useQuery({
    queryKey: ['user-entities-list', page, sectorFilter, regionFilter],
    queryFn: () =>
      listEntities({
        limit: pageSize,
        offset: page * pageSize,
        sector: sectorFilter || undefined,
        region: regionFilter || undefined,
      }),
  })

  const { data: signalsData } = useQuery({
    queryKey: ['user-entities-signals-map'],
    queryFn: () => listSignals({ limit: 100 }),
  })

  // Map entityId -> count of signals
  const entitySignalCounts = useMemo(() => {
    const map: Record<string, number> = {}
    ;(signalsData?.items || (signalsData as any)?.signals || []).forEach((s) => {
      map[s.entity_id] = (map[s.entity_id] || 0) + 1
    })
    return map
  }, [signalsData])

  const rawItems = entitiesData?.properties || entitiesData?.items || []

  // Filter in memory for instantaneous search across name, ID, sector, region
  const items = useMemo(() => {
    return rawItems.filter((e) => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase()
        const matchesQuery =
          e.canonical_name?.toLowerCase().includes(q) ||
          e.property_id?.toLowerCase().includes(q) ||
          e.sector?.toLowerCase().includes(q) ||
          e.region?.toLowerCase().includes(q)
        if (!matchesQuery) return false
      }
      return true
    })
  }, [rawItems, debouncedSearch])

  const total = entitiesData?.total || rawItems.length
  const totalPages = Math.ceil(total / pageSize) || 1

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-strong">Entities</h1>
          <p className="text-xs sm:text-sm text-muted">Explore corporate entities tracked by ECHO.</p>
        </div>
        <span className="font-mono text-xs text-muted border border-hairline bg-surface px-3 py-1.5 self-start sm:self-auto">
          Total: <strong className="text-strong">{total}</strong> tracked entities
        </span>
      </div>

      {/* Debounced Search & Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <input
            type="text"
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            placeholder="Search entities by name, ID, sector, or region..."
            className="min-h-10 w-full border border-hairline bg-surface px-3 pl-9 text-xs text-ink placeholder:text-muted/60 focus:border-signal focus:outline-none font-mono"
          />
          <Search size={14} className="text-muted absolute left-3 top-3" />
        </div>

        {/* Sector Filter */}
        <select
          value={sectorFilter}
          onChange={(e) => {
            setSectorFilter(e.target.value)
            setPage(0)
          }}
          className="min-h-10 border border-hairline bg-surface px-3 text-xs text-ink focus:border-signal focus:outline-none font-mono"
        >
          <option value="">All Sectors</option>
          <option value="Commercial">Commercial</option>
          <option value="Technology">Technology</option>
          <option value="Finance">Finance</option>
          <option value="Industrial">Industrial</option>
          <option value="Residential">Residential</option>
          <option value="Hospitality">Hospitality</option>
        </select>

        {/* Region Filter */}
        <select
          value={regionFilter}
          onChange={(e) => {
            setRegionFilter(e.target.value)
            setPage(0)
          }}
          className="min-h-10 border border-hairline bg-surface px-3 text-xs text-ink focus:border-signal focus:outline-none font-mono"
        >
          <option value="">All Regions</option>
          <option value="North America">North America</option>
          <option value="Europe">Europe</option>
          <option value="Asia Pacific">Asia Pacific</option>
          <option value="Global">Global</option>
        </select>
      </div>

      {/* Content */}
      {entitiesLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : entitiesError ? (
        <ErrorState message="Unable to load corporate entities from API." onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No Entities Found"
          message="No corporate entities match the specified search or filter criteria."
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block border border-hairline bg-surface overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-2 border-b border-hairline text-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Sector</th>
                  <th className="p-3.5">Region</th>
                  <th className="p-3.5">Signals</th>
                  <th className="p-3.5">Risk</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {items.map((e) => {
                  const bookmarked = isBookmarked(e.property_id)
                  const signalCount = entitySignalCounts[e.property_id] || 0
                  return (
                    <tr key={e.property_id} className="hover:bg-surface-2/60 transition-colors">
                      <td className="p-3.5">
                        <span className="font-semibold text-signal mr-2">{e.property_id}</span>
                        <Link
                          to={`/app/entities/${e.property_id}`}
                          className="text-strong font-sans font-medium hover:text-signal hover:underline"
                        >
                          {e.canonical_name}
                        </Link>
                      </td>
                      <td className="p-3.5 text-muted">{e.sector || 'Unassigned'}</td>
                      <td className="p-3.5 text-muted">{e.region || 'Unspecified'}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 border text-[11px] ${
                            signalCount > 0
                              ? 'border-signal/40 bg-signal/10 text-strong font-semibold'
                              : 'border-hairline text-muted'
                          }`}
                        >
                          {signalCount} {signalCount === 1 ? 'signal' : 'signals'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <Link
                          to={`/app/risk/${e.property_id}`}
                          className="text-signal hover:underline inline-flex items-center gap-1 text-[11px]"
                        >
                          <span>Review Risk</span>
                          <ArrowRight size={10} />
                        </Link>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              toggleBookmark({
                                id: e.property_id,
                                title: e.canonical_name,
                                subtitle: `${e.sector || 'Unassigned'} • ${e.region || 'Unspecified'}`,
                                type: 'ENTITY',
                              })
                            }
                            className={`p-1.5 border transition-colors ${
                              bookmarked
                                ? 'border-signal text-signal bg-signal/10'
                                : 'border-hairline text-muted hover:text-strong'
                            }`}
                            title={bookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
                          >
                            {bookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                          </button>

                          <Link
                            to={`/app/entities/${e.property_id}`}
                            className="inline-flex items-center gap-1 border border-hairline px-2.5 py-1 text-[11px] text-strong hover:bg-surface-3 transition-colors"
                          >
                            <Eye size={12} className="text-signal" />
                            <span>View Entity</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards Layout (320px -> 768px) */}
          <div className="md:hidden space-y-3">
            {items.map((e) => {
              const bookmarked = isBookmarked(e.property_id)
              const signalCount = entitySignalCounts[e.property_id] || 0

              return (
                <div
                  key={e.property_id}
                  className="border border-hairline bg-surface p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs text-signal font-semibold block">
                        {e.property_id}
                      </span>
                      <Link
                        to={`/app/entities/${e.property_id}`}
                        className="text-sm font-medium text-strong hover:text-signal transition-colors"
                      >
                        {e.canonical_name}
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        toggleBookmark({
                          id: e.property_id,
                          title: e.canonical_name,
                          subtitle: `${e.sector || 'Unassigned'} • ${e.region || 'Unspecified'}`,
                          type: 'ENTITY',
                        })
                      }
                      className={`p-1.5 border transition-colors ${
                        bookmarked
                          ? 'border-signal text-signal bg-signal/10'
                          : 'border-hairline text-muted'
                      }`}
                    >
                      {bookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-muted bg-bg p-2.5 border border-hairline">
                    <div>
                      <span className="text-[10px] block uppercase">Sector</span>
                      <span className="text-ink font-semibold">{e.sector || 'Unassigned'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] block uppercase">Region</span>
                      <span className="text-ink font-semibold">{e.region || 'Unspecified'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] block uppercase">Signals</span>
                      <span className="text-signal font-semibold">{signalCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] block uppercase">Risk</span>
                      <Link to={`/app/risk/${e.property_id}`} className="text-signal underline font-semibold">
                        View Dossier
                      </Link>
                    </div>
                  </div>

                  <Link
                    to={`/app/entities/${e.property_id}`}
                    className="w-full min-h-10 border border-signal bg-signal/15 flex items-center justify-center gap-1.5 text-xs font-mono uppercase font-semibold text-strong hover:bg-signal/25 transition-colors"
                  >
                    <span>View Entity</span>
                    <ArrowRight size={13} className="text-signal" />
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border border-hairline bg-surface text-xs font-mono">
              <span className="text-muted">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="p-1.5 border border-hairline disabled:opacity-40 hover:bg-surface-2"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 border border-hairline disabled:opacity-40 hover:bg-surface-2"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
