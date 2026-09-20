import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { INTELLIGENCE_NODES } from '@/lib/constants'
import { useReducedMotion } from '@/hooks/useMediaQuery'

const positions = [
  [70, 120],
  [210, 70],
  [350, 130],
  [490, 64],
  [630, 140],
  [760, 80],
] as const

const tones: Record<string, string> = {
  signal: 'var(--echo-signal)',
  evidence: 'var(--echo-evidence)',
  risk: 'var(--echo-risk)',
  analysis: 'var(--echo-analysis-strong)',
}

export function IntelligenceNetwork() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const svgRef = useRef<SVGSVGElement>(null)
  const visibleRef = useRef(true)
  const [focus, setFocus] = useState<string | null>(null)

  const edges = useMemo(
    () =>
      positions.slice(0, -1).map((from, index) => {
        const to = positions[index + 1]
        return { from, to, id: `${INTELLIGENCE_NODES[index].id}-${INTELLIGENCE_NODES[index + 1].id}` }
      }),
    [],
  )

  useEffect(() => {
    const node = svgRef.current
    if (!node) return
    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting
    })
    io.observe(node)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (reduce) return
    const svg = svgRef.current
    if (!svg) return
    const dots = Array.from(svg.querySelectorAll<SVGCircleElement>('[data-particle]'))
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(32, now - last)
      last = now
      if (visibleRef.current) {
        dots.forEach((dot, i) => {
          const edge = edges[i % edges.length]
          const speed = 0.00018 + (i % 3) * 0.00005
          const t = ((Number(dot.dataset.t ?? '0') + dt * speed) % 1)
          dot.dataset.t = String(t)
          const x = edge.from[0] + (edge.to[0] - edge.from[0]) * t
          const y = edge.from[1] + (edge.to[1] - edge.from[1]) * t
          dot.setAttribute('cx', String(x))
          dot.setAttribute('cy', String(y))
        })
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [edges, reduce])

  const active = INTELLIGENCE_NODES.find((node) => node.id === focus)

  return (
    <section aria-label="ECHO intelligence network" className="relative overflow-hidden border border-hairline bg-surface">
      <div className="echo-grid-bg pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative flex flex-col gap-4 p-4 md:p-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] tracking-[0.28em] text-signal uppercase">Data → Intelligence</p>
          <h2 className="font-display mt-2 text-3xl text-strong md:text-4xl">Provenance network</h2>
          <svg
            ref={svgRef}
            viewBox="0 0 840 220"
            className="mt-4 h-auto w-full"
            role="img"
            aria-label="Source to analysis intelligence chain"
          >
            {edges.map((edge, index) => {
              const related =
                !focus ||
                INTELLIGENCE_NODES[index].id === focus ||
                INTELLIGENCE_NODES[index + 1].id === focus
              return (
                <path
                  key={edge.id}
                  d={`M ${edge.from[0]} ${edge.from[1]} C ${(edge.from[0] + edge.to[0]) / 2} ${edge.from[1] - 28}, ${(edge.from[0] + edge.to[0]) / 2} ${edge.to[1] + 28}, ${edge.to[0]} ${edge.to[1]}`}
                  fill="none"
                  stroke={related ? 'var(--echo-signal)' : 'var(--echo-hairline)'}
                  strokeOpacity={related ? 0.85 : 0.25}
                  strokeWidth={related ? 1.4 : 1}
                  strokeDasharray="4 6"
                  className={reduce ? undefined : 'echo-flow-stroke'}
                />
              )
            })}
            {!reduce
              ? edges.flatMap((edge, i) =>
                  [0, 1].map((n) => (
                    <circle
                      key={`${edge.id}-${n}`}
                      data-particle
                      data-t={String((i * 0.18 + n * 0.45) % 1)}
                      r="2.4"
                      fill="var(--echo-signal-strong)"
                      cx={edge.from[0]}
                      cy={edge.from[1]}
                    />
                  )),
                )
              : null}
            {INTELLIGENCE_NODES.map((node, index) => {
              const [x, y] = positions[index]
              const dimmed = Boolean(focus && focus !== node.id)
              return (
                <g
                  key={node.id}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="link"
                  aria-label={`${node.label}. ${node.copy}`}
                  onFocus={() => setFocus(node.id)}
                  onBlur={() => setFocus((current) => (current === node.id ? null : current))}
                  onMouseEnter={() => setFocus(node.id)}
                  onMouseLeave={() => setFocus(null)}
                  onClick={() => navigate(node.href)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      navigate(node.href)
                    }
                  }}
                  opacity={dimmed ? 0.28 : 1}
                >
                  <circle r="18" fill="var(--echo-bg)" stroke={tones[node.tone]} strokeWidth="1.5" />
                  {focus === node.id ? (
                    <circle r="26" fill="none" stroke={tones[node.tone]} strokeOpacity="0.45" />
                  ) : null}
                  <text
                    y="34"
                    textAnchor="middle"
                    fill="var(--echo-text-strong)"
                    fontSize="10"
                    fontFamily="IBM Plex Mono, monospace"
                    letterSpacing="0.16em"
                  >
                    {node.id}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
        <aside className="w-full max-w-sm border-t border-hairline pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Focus</p>
          <p className="font-display mt-2 text-2xl text-strong">{active?.label ?? 'Chain idle'}</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {active?.copy ??
              'Hover a node to inspect the intelligence stage. Click to open the related admin surface. This graph is a product visualization of ECHO’s provenance model, not a live backend topology feed.'}
          </p>
        </aside>
      </div>
      <style>{`
        .echo-flow-stroke {
          stroke-dashoffset: 40;
          animation: echo-dash 7s linear infinite;
        }
        @keyframes echo-dash {
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .echo-flow-stroke { animation: none; }
        }
      `}</style>
    </section>
  )
}
