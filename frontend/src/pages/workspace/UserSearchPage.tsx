import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ArrowRight, X, AlertCircle } from 'lucide-react'
import { listEntities } from '@/api/entities'
import { listSignals } from '@/api/signals'
import { listInvestigations } from '@/api/investigations'
import { Skeleton, ErrorState } from '@/components/feedback/States'

export function UserSearchPage() {
  const [query, setQuery] = useState('')

  const q = query.trim()

  const {
    data: entitiesData,
    isLoading: entitiesLoading,
    isError: entitiesError,
    refetch: refetchEntities,
  } = useQuery({
    queryKey: ['search-entities-data', q],
    queryFn: () => listEntities({ limit: 50, search: q || undefined }),
  })

  const {
    data: signalsData,
    isLoading: signalsLoading,
    isError: signalsError,
    refetch: refetchSignals,
  } = useQuery({
    queryKey: ['search-signals-data', q],
    queryFn: () => listSignals({ limit: 50, search: q || undefined }),
  })

  const {
    data: investigationsData,
    isLoading: investigationsLoading,
    isError: investigationsError,
    refetch: refetchInvestigations,
  } = useQuery({
    queryKey: ['search-investigations-data', q],
    queryFn: () => listInvestigations({ limit: 50, search: q || undefined }),
  })

  const entities = entitiesData?.items || []
  const signals = signalsData?.items || []
  const investigations = investigationsData?.items || []

  const totalResults = entities.length + signals.length + investigations.length
  const isLoading = entitiesLoading || signalsLoading || investigationsLoading
  const isError = entitiesError || signalsError || investigationsError

  const dbHasZeroRecords =
    !isLoading &&
    !isError &&
    !q &&
    (entitiesData?.total === 0 && signalsData?.total === 0 && investigationsData?.total === 0)

  const handleRetryAll = () => {
    refetchEntities()
    refetchSignals()
    refetchInvestigations()
  }

  // Dynamically derive suggested search filters directly from live database items
  const suggestedChips = useMemo(() => {
    const chips: string[] = []
    for (const e of entities) {
      if (e.sector && !chips.includes(e.sector)) chips.push(e.sector)
      if (chips.length >= 4) break
    }
    for (const s of signals) {
      if (s.signal_type && !chips.includes(s.signal_type)) chips.push(s.signal_type)
      if (chips.length >= 6) break
    }
    return chips
  }, [entities, signals])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-hairline pb-4">
        <h1 className="text-2xl font-display font-medium text-strong">Global Search</h1>
        <p className="text-xs sm:text-sm text-muted">
          Query corporate entities, minted signals, and investigation runs simultaneously against the live backend.
        </p>
      </div>

      {/* Search Input matching Section 18: Search ECHO intelligence... */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ECHO intelligence (entity name, sector, signal, run ID)..."
          autoFocus
          className="min-h-12 w-full border border-hairline bg-surface px-4 pl-11 pr-10 text-sm text-ink placeholder:text-muted/60 focus:border-signal focus:outline-none font-mono"
        />
        <Search size={18} className="text-muted absolute left-3.5 top-3.5" />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-3.5 text-muted hover:text-strong"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* State 1: Loading */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-muted">
            <span className="h-2 w-2 rounded-full bg-signal animate-ping" />
            <span>Querying backend database across entities, signals, and investigations...</span>
          </div>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : isError ? (
        /* State 2: API / Network Error */
        <ErrorState
          title="Search Service Error"
          body="Failed to execute search query against backend APIs. Check network connection or backend health."
          onRetry={handleRetryAll}
        />
      ) : dbHasZeroRecords ? (
        /* State 3: Zero searchable records in database */
        <div className="border border-hairline bg-surface p-12 text-center text-xs font-mono text-muted space-y-2">
          <AlertCircle size={24} className="mx-auto text-amber-500 mb-2" />
          <p className="text-strong font-semibold uppercase tracking-wider">Zero Searchable Records</p>
          <p>The backend database contains 0 indexed entities, signals, and investigations.</p>
        </div>
      ) : !q ? (
        /* Empty Search Prompt */
        <div className="border border-hairline bg-surface p-12 text-center text-xs font-mono text-muted space-y-2">
          <p>Type a query above to search corporate entities, signals, and investigations.</p>
          {suggestedChips.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {suggestedChips.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className="border border-hairline px-2.5 py-1 text-[11px] hover:border-signal hover:text-strong transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : totalResults === 0 ? (
        /* State 4: No matches for search query */
        <div className="border border-hairline bg-surface p-12 text-center text-xs font-mono text-muted">
          No records matched &ldquo;<span className="text-strong">{query}</span>&rdquo;.
        </div>
      ) : (
        /* State 5: Successful Matches */
        <div className="space-y-6">
          <p className="font-mono text-xs text-muted">
            Found <strong className="text-strong">{totalResults}</strong> matches for &ldquo;{q}&rdquo;:
          </p>

          {/* ENTITIES */}
          {entities.length > 0 && (
            <div className="space-y-3">
              <div className="border-b border-hairline pb-1 font-mono text-xs text-signal font-semibold uppercase tracking-wider flex items-center justify-between">
                <span>ENTITIES ({entities.length})</span>
              </div>
              <div className="border border-hairline bg-surface divide-y divide-hairline">
                {entities.map((e) => (
                  <div
                    key={e.property_id}
                    className="p-3.5 hover:bg-surface-2/60 transition-colors flex items-center justify-between gap-4 font-mono text-xs"
                  >
                    <div>
                      <span className="font-semibold text-signal mr-2">{e.property_id}</span>
                      <Link
                        to={`/app/entities/${e.property_id}`}
                        className="font-sans font-medium text-strong hover:text-signal transition-colors"
                      >
                        {e.canonical_name}
                      </Link>
                      <span className="text-[11px] text-muted ml-2">
                        &bull; {e.sector || 'Unassigned'} &bull; {e.region || 'Unspecified'}
                      </span>
                    </div>

                    <Link
                      to={`/app/entities/${e.property_id}`}
                      className="text-signal hover:underline inline-flex items-center gap-1"
                    >
                      <span>Dossier</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SIGNALS */}
          {signals.length > 0 && (
            <div className="space-y-3">
              <div className="border-b border-hairline pb-1 font-mono text-xs text-signal font-semibold uppercase tracking-wider flex items-center justify-between">
                <span>SIGNALS ({signals.length})</span>
              </div>
              <div className="border border-hairline bg-surface divide-y divide-hairline">
                {signals.map((s) => (
                  <div
                    key={s.signal_id}
                    className="p-3.5 hover:bg-surface-2/60 transition-colors flex items-center justify-between gap-4 font-mono text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] uppercase px-1.5 py-0.5 border border-hairline bg-surface-2 text-muted">
                          {s.severity}
                        </span>
                        <span className="text-signal font-semibold">{s.signal_id}</span>
                        <span className="text-muted">Entity: {s.entity_id}</span>
                      </div>
                      <Link
                        to={`/app/signals/${s.signal_id}`}
                        className="font-sans text-sm font-medium text-strong hover:text-signal transition-colors block truncate"
                      >
                        {s.description}
                      </Link>
                    </div>

                    <Link
                      to={`/app/signals/${s.signal_id}`}
                      className="text-signal hover:underline inline-flex items-center gap-1 shrink-0"
                    >
                      <span>View</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INVESTIGATIONS */}
          {investigations.length > 0 && (
            <div className="space-y-3">
              <div className="border-b border-hairline pb-1 font-mono text-xs text-signal font-semibold uppercase tracking-wider flex items-center justify-between">
                <span>INVESTIGATIONS ({investigations.length})</span>
              </div>
              <div className="border border-hairline bg-surface divide-y divide-hairline">
                {investigations.map((inv) => (
                  <div
                    key={inv.run_id}
                    className="p-3.5 hover:bg-surface-2/60 transition-colors flex items-center justify-between gap-4 font-mono text-xs"
                  >
                    <div>
                      <span className="text-signal font-semibold mr-2">{inv.run_id}</span>
                      <span className="text-strong font-semibold">Entity: {inv.entity_id}</span>
                      <span className="text-muted ml-2">&bull; Status: {inv.status}</span>
                    </div>

                    <Link
                      to={`/app/investigations/${inv.run_id}`}
                      className="text-signal hover:underline inline-flex items-center gap-1"
                    >
                      <span>Pipeline</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

