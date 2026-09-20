import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Building2, Radio, Bot, AlertTriangle, ArrowRight, X, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { listEntities } from '@/api/entities'
import { listSignals } from '@/api/signals'
import { listAgents } from '@/api/agents'

export function GlobalSearchModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '/app'

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) onClose()
        else {
          setQuery('')
        }
      }
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const { data: entitiesData, isLoading: loadingEntities } = useQuery({
    queryKey: ['globalSearchEntities'],
    queryFn: () => listEntities({ limit: 100 }),
    enabled: open,
    staleTime: 60_000,
  })

  const { data: signalsData, isLoading: loadingSignals } = useQuery({
    queryKey: ['globalSearchSignals'],
    queryFn: () => listSignals({ limit: 100 }),
    enabled: open,
    staleTime: 60_000,
  })

  const { data: agentsData, isLoading: loadingAgents } = useQuery({
    queryKey: ['globalSearchAgents'],
    queryFn: () => listAgents(),
    enabled: open && basePath === '/admin',
    staleTime: 120_000,
  })

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { entities: [], signals: [], agents: [] }

    const matchedEntities = (entitiesData?.items || [])
      .filter(
        (e) =>
          e.canonical_name?.toLowerCase().includes(q) ||
          e.property_id?.toLowerCase().includes(q) ||
          e.company?.toLowerCase().includes(q) ||
          e.sector?.toLowerCase().includes(q) ||
          e.region?.toLowerCase().includes(q),
      )
      .slice(0, 6)

    const matchedSignals = (signalsData?.items || [])
      .filter(
        (s) =>
          s.signal_id?.toLowerCase().includes(q) ||
          s.signal_type?.toLowerCase().includes(q) ||
          s.entity_id?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q),
      )
      .slice(0, 6)

    const matchedAgents = basePath === '/admin'
      ? (agentsData || [])
          .filter(
            (a) =>
              a.name?.toLowerCase().includes(q) ||
              a.agent_id?.toLowerCase().includes(q) ||
              a.description?.toLowerCase().includes(q),
          )
          .slice(0, 4)
      : []

    return {
      entities: matchedEntities,
      signals: matchedSignals,
      agents: matchedAgents,
    }
  }, [query, entitiesData, signalsData, agentsData, basePath])


  const totalResults = results.entities.length + results.signals.length + results.agents.length
  const isLoading = loadingEntities || loadingSignals || loadingAgents

  const handleSelect = (to: string) => {
    navigate(to)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.16 }}
            className="relative w-full max-w-2xl border border-hairline bg-bg-elevated shadow-2xl overflow-hidden"
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 border-b border-hairline px-4 py-3 bg-surface">
              <Search size={18} className="text-signal shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search entities, signals, agents, risk by name or ID..."
                className="w-full bg-transparent text-sm text-strong outline-none placeholder:text-muted"
              />
              {isLoading && <Loader2 size={16} className="animate-spin text-muted shrink-0" />}
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-muted hover:text-strong transition-colors"
                aria-label="Close search"
              >
                <X size={16} />
              </button>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
              {query.trim() === '' ? (
                <div className="text-center py-8">
                  <p className="font-mono text-xs tracking-[0.2em] text-signal uppercase">Command Query</p>
                  <p className="mt-2 text-sm text-muted">
                    Type a corporate name, entity ID, signal type, or agent identifier to search live system records.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2 font-mono text-[10px] text-muted">
                    <span className="border border-hairline px-2 py-1 bg-surface">Entities</span>
                    <span className="border border-hairline px-2 py-1 bg-surface">Signals</span>
                    <span className="border border-hairline px-2 py-1 bg-surface">Agents</span>
                  </div>
                </div>
              ) : totalResults === 0 ? (
                <div className="text-center py-8">
                  <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">No matches found</p>
                  <p className="mt-2 text-sm text-muted">
                    No live entities, signals, or agents matched &ldquo;{query}&rdquo;.
                  </p>
                </div>
              ) : (
                <>
                  {results.entities.length > 0 && (
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase mb-2 flex items-center gap-1.5">
                        <Building2 size={12} />
                        Corporate Entities ({results.entities.length})
                      </p>
                      <div className="divide-y divide-hairline border border-hairline bg-surface">
                        {results.entities.map((entity) => (
                          <button
                            key={entity.property_id}
                            type="button"
                            onClick={() => handleSelect(`${basePath}/entities/${entity.property_id}`)}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-surface-2 transition-colors group"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-sm font-medium text-strong group-hover:text-signal truncate">
                                {entity.canonical_name}
                              </p>
                              <p className="font-mono text-[11px] text-muted truncate">
                                {entity.property_id} &bull; {entity.sector || entity.entity_type || 'Entity'} &bull;{' '}
                                {entity.region || 'Unknown Region'}
                              </p>
                            </div>
                            <ArrowRight size={14} className="text-muted group-hover:text-signal shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.signals.length > 0 && (
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase mb-2 flex items-center gap-1.5">
                        <Radio size={12} />
                        Discovered Signals ({results.signals.length})
                      </p>
                      <div className="divide-y divide-hairline border border-hairline bg-surface">
                        {results.signals.map((sig) => (
                          <button
                            key={sig.signal_id}
                            type="button"
                            onClick={() => handleSelect(`${basePath}/signals/${sig.signal_id}`)}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-surface-2 transition-colors group"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-strong group-hover:text-signal">
                                  {sig.signal_type}
                                </span>
                                <span className="font-mono text-[10px] px-1.5 py-0.5 border border-hairline bg-bg-elevated text-muted">
                                  {sig.severity}
                                </span>
                              </div>
                              <p className="text-xs text-muted truncate mt-0.5">{sig.description}</p>
                            </div>
                            <ArrowRight size={14} className="text-muted group-hover:text-signal shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {basePath === '/admin' && results.agents.length > 0 && (
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase mb-2 flex items-center gap-1.5">
                        <Bot size={12} />
                        Intelligence Agents ({results.agents.length})
                      </p>
                      <div className="divide-y divide-hairline border border-hairline bg-surface">
                        {results.agents.map((agent) => (
                          <button
                            key={agent.agent_id}
                            type="button"
                            onClick={() => handleSelect(`/admin/agents/${agent.agent_id}`)}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-surface-2 transition-colors group"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-sm font-medium text-strong group-hover:text-signal truncate">
                                {agent.name}
                              </p>
                              <p className="font-mono text-[11px] text-muted truncate">
                                {agent.agent_id} &bull; {agent.capabilities?.length || 0} capabilities
                              </p>
                            </div>
                            <ArrowRight size={14} className="text-muted group-hover:text-signal shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-hairline px-4 py-2 bg-surface text-right font-mono text-[10px] text-muted">
              Press <kbd className="border border-hairline px-1 py-0.5 bg-bg-elevated">ESC</kbd> to close
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
