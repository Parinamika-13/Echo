import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  Radio,
  ShieldAlert,
  Terminal,
  ArrowRight,
  Search,
  Plus,
  BookmarkCheck,
  Bookmark,
  RotateCw,
  Clock,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { listEntities } from '@/api/entities'
import { listSignals } from '@/api/signals'
import { listInvestigations } from '@/api/investigations'
import { useAuth } from '@/context/AuthContext'
import { useWatchlist } from '@/hooks/useWatchlist'
import { Skeleton } from '@/components/feedback/States'

export function UserDashboardPage() {
  const { user, profile } = useAuth()
  const { isBookmarked, toggleBookmark } = useWatchlist()
  const [now, setNow] = useState(new Date())

  // Keep date/time indicator updated
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const greeting = useMemo(() => {
    const hour = now.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [now])

  const {
    data: entitiesData,
    isLoading: entitiesLoading,
    refetch: refetchEntities,
  } = useQuery({
    queryKey: ['user-entities-dashboard'],
    queryFn: () => listEntities({ limit: 50 }),
  })

  const {
    data: signalsData,
    isLoading: signalsLoading,
    refetch: refetchSignals,
  } = useQuery({
    queryKey: ['user-signals-dashboard'],
    queryFn: () => listSignals({ limit: 50 }),
  })

  const {
    data: investigationsData,
    isLoading: investigationsLoading,
    refetch: refetchInvestigations,
  } = useQuery({
    queryKey: ['user-investigations-dashboard'],
    queryFn: () => listInvestigations({ limit: 10 }),
  })

  const entities = entitiesData?.properties || entitiesData?.items || []
  const signals = signalsData?.items || (signalsData as any)?.signals || []
  const investigations = investigationsData?.items || []

  // Real signal distribution counts
  const signalCounts = useMemo(() => {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
    signals.forEach((s) => {
      const sev = (s.severity || '').toUpperCase() as keyof typeof counts
      if (counts[sev] !== undefined) counts[sev]++
      else counts.MEDIUM++
    })
    return counts
  }, [signals])

  const totalSignals = signals.length || 1

  const handleRefresh = () => {
    refetchEntities()
    refetchSignals()
    refetchInvestigations()
  }

  return (
    <div className="space-y-8">
      {/* Header with Greeting & Live Date/Time Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-hairline pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-strong tracking-tight">
            {greeting}, {user?.name || profile.name || 'Analyst'}
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Your financial intelligence overview &bull; Continuous disclosure surveillance
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-muted">
          <div className="border border-hairline bg-surface px-3 py-1.5 flex items-center gap-2">
            <Clock size={13} className="text-signal" />
            <span>
              {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} &bull;{' '}
              {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="p-1.5 border border-hairline bg-surface hover:bg-surface-2 transition-colors text-muted hover:text-strong"
            title="Refresh Intelligence Data"
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {/* Intelligence Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-hairline bg-surface p-4 space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider">Tracked Entities</span>
            <Building2 size={16} className="text-signal" />
          </div>
          {entitiesLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl sm:text-3xl font-mono font-semibold text-strong">
              {entitiesData?.total ?? entities.length}
            </p>
          )}
          <p className="text-[10px] text-muted font-mono">Canonical database entities</p>
        </div>

        <div className="border border-hairline bg-surface p-4 space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider">Active Signals</span>
            <Radio size={16} className="text-signal" />
          </div>
          {signalsLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl sm:text-3xl font-mono font-semibold text-strong">
              {signalsData?.total ?? signals.length}
            </p>
          )}
          <p className="text-[10px] text-muted font-mono">Discrepancies &amp; silences</p>
        </div>

        <div className="border border-hairline bg-surface p-4 space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider">Risk Items</span>
            <ShieldAlert size={16} className="text-loss" />
          </div>
          {signalsLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl sm:text-3xl font-mono font-semibold text-loss">
              {signalCounts.CRITICAL + signalCounts.HIGH}
            </p>
          )}
          <p className="text-[10px] text-muted font-mono">Critical &amp; high severity alerts</p>
        </div>

        <div className="border border-hairline bg-surface p-4 space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider">Recent Investigations</span>
            <Terminal size={16} className="text-signal" />
          </div>
          {investigationsLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl sm:text-3xl font-mono font-semibold text-strong">
              {investigationsData?.total ?? investigations.length}
            </p>
          )}
          <p className="text-[10px] text-muted font-mono">Autonomous pipeline runs</p>
        </div>
      </div>

      {/* Signal Landscape & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Signal Landscape Chart (7 cols) */}
        <div className="lg:col-span-7 border border-hairline bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
            <div>
              <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-strong">
                Signal Landscape
              </h2>
              <p className="text-[11px] text-muted font-sans mt-0.5">
                Severity distribution across corporate filings and disclosure streams
              </p>
            </div>
            <span className="text-[10px] font-mono text-signal font-semibold">
              {signals.length} Total
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs pt-1">
            {[
              {
                label: 'Critical',
                count: signalCounts.CRITICAL,
                color: 'bg-loss',
                textColor: 'text-loss',
              },
              {
                label: 'High',
                count: signalCounts.HIGH,
                color: 'bg-amber-500',
                textColor: 'text-amber-500',
              },
              {
                label: 'Medium',
                count: signalCounts.MEDIUM,
                color: 'bg-signal',
                textColor: 'text-signal',
              },
              {
                label: 'Low',
                count: signalCounts.LOW,
                color: 'bg-muted',
                textColor: 'text-muted',
              },
            ].map((row) => {
              const pct = Math.round((row.count / totalSignals) * 100)
              return (
                <div key={row.label} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className={`font-semibold uppercase ${row.textColor}`}>{row.label}</span>
                    <span className="text-muted">
                      {row.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-bg border border-hairline overflow-hidden">
                    <div
                      className={`h-full ${row.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions (5 cols) */}
        <div className="lg:col-span-5 border border-hairline bg-surface p-5 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-strong border-b border-hairline pb-2.5">
              Intelligence Quick Actions
            </h2>
            <p className="text-[11px] text-muted font-sans mt-2 leading-relaxed">
              Launch autonomous investigations or drill into active corporate surveillance registers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <Link
              to="/app/investigations/new"
              className="p-3 border border-signal/40 bg-signal/10 hover:bg-signal/20 transition-colors text-strong font-semibold flex flex-col justify-between gap-2 group"
            >
              <Plus size={15} className="text-signal" />
              <span>Investigate Entity</span>
            </Link>

            <Link
              to="/app/signals"
              className="p-3 border border-hairline bg-surface-2 hover:bg-surface-3 transition-colors text-strong font-semibold flex flex-col justify-between gap-2"
            >
              <Radio size={15} className="text-signal" />
              <span>Explore Signals</span>
            </Link>

            <Link
              to="/app/risk"
              className="p-3 border border-hairline bg-surface-2 hover:bg-surface-3 transition-colors text-strong font-semibold flex flex-col justify-between gap-2"
            >
              <ShieldAlert size={15} className="text-signal" />
              <span>View Risk</span>
            </Link>

            <Link
              to="/app/search"
              className="p-3 border border-hairline bg-surface-2 hover:bg-surface-3 transition-colors text-strong font-semibold flex flex-col justify-between gap-2"
            >
              <Search size={15} className="text-signal" />
              <span>Search Intelligence</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Signals & Recent Investigations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Signals Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between border-b border-hairline pb-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-signal animate-pulse" />
              <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-strong">
                Recent Signals
              </h2>
            </div>
            <Link
              to="/app/signals"
              className="text-xs font-mono text-signal hover:underline inline-flex items-center gap-1"
            >
              <span>View All Signals</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {signalsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : signals.length === 0 ? (
            <div className="border border-hairline bg-surface p-8 text-center text-xs font-mono text-muted">
              No intelligence signals currently detected.
            </div>
          ) : (
            <div className="space-y-2">
              {signals.slice(0, 5).map((s) => {
                const bookmarked = isBookmarked(s.signal_id)
                return (
                  <div
                    key={s.signal_id}
                    className="border border-hairline bg-surface p-3.5 hover:border-signal/40 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[9px] uppercase px-1.5 py-0.5 border font-semibold ${
                            s.severity === 'CRITICAL'
                              ? 'border-loss bg-loss/15 text-loss'
                              : s.severity === 'HIGH'
                              ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                              : 'border-hairline bg-surface-2 text-muted'
                          }`}
                        >
                          {s.severity}
                        </span>
                        <span className="font-mono text-[10px] text-muted">{s.signal_type}</span>
                        <span className="font-mono text-[10px] text-signal font-semibold">
                          {s.entity_id}
                        </span>
                      </div>

                      <Link
                        to={`/app/signals/${s.signal_id}`}
                        className="text-xs sm:text-sm font-medium text-strong hover:text-signal transition-colors block truncate"
                      >
                        {s.description}
                      </Link>

                      <p className="text-[10px] font-mono text-muted">
                        Confidence: {s.confidence ? `${Math.round(s.confidence * 100)}%` : 'N/A'} &bull;{' '}
                        Status: {s.status || '—'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          toggleBookmark({
                            id: s.signal_id,
                            title: s.description,
                            subtitle: `${s.signal_type} (${s.severity})`,
                            type: 'SIGNAL',
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
                        to={`/app/signals/${s.signal_id}`}
                        className="p-1.5 border border-hairline hover:border-signal text-muted hover:text-strong transition-colors"
                        title="View Signal"
                      >
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recently Investigated (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between border-b border-hairline pb-2">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-strong">
              Recent Investigations
            </h2>
            <Link
              to="/app/investigations"
              className="text-xs font-mono text-signal hover:underline inline-flex items-center gap-1"
            >
              <span>All Runs</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {investigations.length === 0 ? (
            <div className="border border-hairline bg-surface p-6 text-center text-xs font-mono text-muted space-y-3">
              <p>No recent investigations executed in this session.</p>
              <Link
                to="/app/investigations/new"
                className="inline-flex items-center gap-1.5 border border-signal bg-signal/15 px-3 py-1.5 text-xs text-strong uppercase tracking-wider font-semibold hover:bg-signal/25 transition-colors"
              >
                <Plus size={12} className="text-signal" />
                <span>Start First Investigation</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {investigations.slice(0, 4).map((run) => (
                <div
                  key={run.run_id}
                  className="border border-hairline bg-surface p-3.5 space-y-2 hover:border-signal/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-strong">
                      {run.entity_id}
                    </span>
                    <span
                      className={`font-mono text-[9px] uppercase px-1.5 py-0.5 border font-semibold ${
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

                  <div className="flex items-center justify-between text-[11px] font-mono text-muted">
                    <span>{run.executed_agents?.length ? `${run.executed_agents.length} agents coordinated` : 'Pipeline coordinated'}</span>
                    <Link
                      to={`/app/investigations/${run.run_id}`}
                      className="text-signal hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>&rarr; View investigation</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
