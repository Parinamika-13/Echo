import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Trash2, ArrowRight, Layers, Radio, ExternalLink, HardDrive } from 'lucide-react'
import { useWatchlist } from '@/hooks/useWatchlist'
import { EmptyState } from '@/components/feedback/States'

export function UserWatchlistPage() {
  const { items, removeBookmark } = useWatchlist()
  const [filterType, setFilterType] = useState<'ALL' | 'ENTITY' | 'SIGNAL'>('ALL')

  const filteredItems = items.filter((item) => {
    if (filterType === 'ALL') return true
    return item.type === filterType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-strong">MY WATCHLIST</h1>
          <p className="text-xs sm:text-sm text-muted">
            Saved corporate entities and signals prioritized for ongoing intelligence monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2 border border-hairline bg-surface p-2 px-3 text-[11px] font-mono text-muted self-start sm:self-auto">
          <HardDrive size={13} className="text-signal" />
          <span>{items.length} Tracked Items</span>
        </div>
      </div>

      {/* Section 17 Explicit Label */}
      <div className="border border-hairline bg-surface p-4 text-xs font-mono text-muted flex items-center justify-between">
        <span className="text-ink">
          &gt; Watchlist stored locally on this device.
        </span>
        <span className="text-[10px] uppercase text-muted">Client Persistence</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 font-mono text-xs uppercase">
        {(['ALL', 'ENTITY', 'SIGNAL'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 border transition-colors ${
              filterType === type
                ? 'border-signal bg-signal/15 text-strong font-semibold'
                : 'border-hairline bg-surface text-muted hover:text-strong'
            }`}
          >
            {type === 'ALL' ? `All (${items.length})` : `${type}s (${items.filter((i) => i.type === type).length})`}
          </button>
        ))}
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title="Watchlist Empty"
          message={
            filterType === 'ALL'
              ? 'You have not saved any entities or signals to your watchlist yet. Click [ Add to Watchlist ] on any entity or signal to monitor it here.'
              : `No ${filterType.toLowerCase()}s currently in your watchlist.`
          }
          actionLabel="Explore Entities"
          onAction={() => window.location.assign('/app/entities')}
        />
      ) : (
        <div className="border border-hairline bg-surface divide-y divide-hairline">
          {filteredItems.map((item) => {
            const detailHref =
              item.type === 'ENTITY'
                ? `/app/entities/${item.id}`
                : `/app/signals/${item.id}`

            return (
              <div
                key={item.id}
                className="p-4 hover:bg-surface-2/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[9px] uppercase px-1.5 py-0.5 border font-semibold ${
                        item.type === 'ENTITY'
                          ? 'border-signal bg-signal/15 text-signal'
                          : 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="font-mono text-xs text-signal font-semibold">{item.id}</span>
                  </div>

                  <Link
                    to={detailHref}
                    className="text-base font-medium text-strong hover:text-signal transition-colors block truncate"
                  >
                    {item.title}
                  </Link>

                  <p className="text-xs font-mono text-muted">
                    {item.subtitle && <span>{item.subtitle} &bull; </span>}
                    Added: {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => removeBookmark(item.id)}
                    className="border border-hairline bg-surface hover:border-loss hover:text-loss text-muted px-3 py-1.5 uppercase tracking-wider transition-colors"
                  >
                    Remove
                  </button>

                  <Link
                    to={detailHref}
                    className="border border-signal bg-signal/15 hover:bg-signal/25 text-strong font-semibold px-3.5 py-1.5 uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <span>{item.type === 'ENTITY' ? 'Open Entity' : 'Open Signal'}</span>
                    <ArrowRight size={13} className="text-signal" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
