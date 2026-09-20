import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AgentMetadata } from '@/api/types'
import { AGENT_EDGES } from '@/lib/constants'
import { cn } from '@/lib/format'
import { useReducedMotion } from '@/hooks/useMediaQuery'

const layout: Record<string, [number, number]> = {
  'ECHO-ORCH': [400, 36],
  'ECHO-PSA-SOURCE': [400, 108],
  'ECHO-PSA-DOC': [400, 172],
  'ECHO-PSA-EXTRACT': [400, 236],
  'ECHO-PSA-ENTITY': [400, 300],
  'ECHO-SIGNAL': [400, 364],
  'ECHO-ERA': [250, 440],
  'ECHO-ISDAA': [550, 440],
  'ECHO-SVEA': [400, 516],
  'ECHO-RSA': [400, 580],
  'ECHO-SSR': [400, 644],
}

function relatedIds(id: string) {
  const set = new Set<string>([id])
  AGENT_EDGES.forEach(([a, b]) => {
    if (a === id || b === id) {
      set.add(a)
      set.add(b)
    }
  })
  return set
}

export function AgentConstellation({
  agents,
  selectedId,
  onSelect,
}: {
  agents: AgentMetadata[]
  selectedId?: string
  onSelect?: (id: string) => void
}) {
  const reduce = useReducedMotion()
  const [hover, setHover] = useState<string | null>(null)
  const byId = useMemo(() => Object.fromEntries(agents.map((agent) => [agent.agent_id, agent])), [agents])
  const focus = hover || selectedId
  const related = focus ? relatedIds(focus) : null
  const focused = focus ? byId[focus] : null

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_20rem]">
      <div className="overflow-hidden border border-hairline bg-surface">
        <svg viewBox="0 0 800 700" className="h-auto w-full min-h-[28rem]" role="img" aria-label="ECHO agent constellation">
          {AGENT_EDGES.map(([from, to]) => {
            const a = layout[from]
            const b = layout[to]
            const live = !related || related.has(from) && related.has(to)
            return (
              <line
                key={`${from}-${to}`}
                x1={a[0]}
                y1={a[1]}
                x2={b[0]}
                y2={b[1]}
                stroke={live ? 'var(--echo-signal)' : 'var(--echo-hairline)'}
                strokeOpacity={live ? 0.8 : 0.18}
                strokeWidth={live ? 1.4 : 1}
                strokeDasharray="3 7"
                className={reduce ? undefined : 'echo-flow-stroke'}
              />
            )
          })}
          {agents.map((agent) => {
            const pos = layout[agent.agent_id] ?? [400, 40]
            const dimmed = Boolean(related && !related.has(agent.agent_id))
            return (
              <g
                key={agent.agent_id}
                transform={`translate(${pos[0]}, ${pos[1]})`}
                opacity={dimmed ? 0.22 : 1}
                className="cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label={`${agent.name} ${agent.agent_id}`}
                onMouseEnter={() => setHover(agent.agent_id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(agent.agent_id)}
                onClick={() => onSelect?.(agent.agent_id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelect?.(agent.agent_id)
                  }
                }}
              >
                <circle r={agent.agent_id === 'ECHO-ORCH' ? 22 : 16} fill="var(--echo-bg-elevated)" stroke="var(--echo-signal)" />
                <text
                  y="32"
                  textAnchor="middle"
                  fill="var(--echo-text-strong)"
                  fontSize="9"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {agent.agent_id.replace('ECHO-', '')}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <aside className="border border-hairline bg-surface p-5">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Selected agent</p>
        {focused ? (
          <>
            <h3 className="font-display mt-2 text-2xl text-strong">{focused.name}</h3>
            <p className="mt-1 font-mono text-xs text-signal">{focused.agent_id}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{focused.description}</p>
            <p className="mt-4 font-mono text-[11px] tracking-[0.16em] text-health uppercase">{focused.status}</p>
            <Link
              to={`/admin/agents/${focused.agent_id}`}
              className={cn(
                'mt-6 inline-flex min-h-11 items-center border border-signal px-4 font-mono text-[11px] tracking-[0.18em] text-strong uppercase',
              )}
            >
              Open dossier
            </Link>
          </>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted">
            Hover or focus a node to inspect registry metadata. Selection uses the live `/agents` catalog; activity metrics are
            not shown unless the API returns them.
          </p>
        )}
      </aside>
    </div>
  )
}
