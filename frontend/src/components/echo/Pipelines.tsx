import { cn } from '@/lib/format'

const STAGES = ['SOURCE', 'VALIDATION', 'NORMALIZATION', 'ENTITY', 'SIGNAL', 'RISK', 'DATABASE'] as const

export function IngestionPipeline({
  active,
  complete,
}: {
  active?: boolean
  complete?: boolean
}) {
  return (
    <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
      {STAGES.map((stage, index) => (
        <li
          key={stage}
          className={cn(
            'border border-hairline bg-surface px-3 py-4',
            complete && 'border-health/50',
            active && 'border-signal/60',
          )}
        >
          <p className="font-mono text-[10px] tracking-[0.2em] text-faint uppercase">0{index + 1}</p>
          <p className="mt-2 font-mono text-xs tracking-[0.14em] text-strong">{stage}</p>
          <div className="mt-3 h-px bg-hairline">
            <div
              className={cn(
                'h-px bg-signal',
                complete ? 'w-full' : active ? 'w-1/2 animate-pulse' : 'w-0',
              )}
            />
          </div>
        </li>
      ))}
    </ol>
  )
}

export function EvidenceChain({
  items,
}: {
  items: Array<{ label: string; value: string | null | undefined }>
}) {
  return (
    <ol className="space-y-0">
      {items.map((item, index) => (
        <li key={item.label} className="relative grid grid-cols-[1rem_1fr] gap-3 pb-5">
          <span className="relative mt-1.5 flex h-2 w-2 rounded-full bg-signal">
            {index < items.length - 1 ? (
              <span className="absolute top-2 left-1/2 h-full w-px -translate-x-1/2 bg-hairline" />
            ) : null}
          </span>
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">{item.label}</p>
            <p className="mt-1 text-sm text-strong">{item.value || 'Not provided by this payload'}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
