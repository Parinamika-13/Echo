import { cn } from '@/lib/format'

export function StatusDot({
  tone,
  label,
  pulse = false,
}: {
  tone: 'health' | 'risk' | 'signal' | 'unknown' | 'evidence'
  label: string
  pulse?: boolean
}) {
  const color = {
    health: 'bg-health',
    risk: 'bg-risk',
    signal: 'bg-signal',
    unknown: 'bg-unknown',
    evidence: 'bg-evidence',
  }[tone]

  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
      <span className="relative flex h-2 w-2">
        {pulse ? <span className={cn('absolute inset-0 animate-ping rounded-full opacity-40', color)} /> : null}
        <span className={cn('relative h-2 w-2 rounded-full', color)} />
      </span>
      {label}
    </span>
  )
}
