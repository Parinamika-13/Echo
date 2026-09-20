import type { ReactNode } from 'react'
import { cn } from '@/lib/format'

export function EmptyState({
  kicker = 'Empty',
  title,
  body,
  action,
}: {
  kicker?: string
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="border border-dashed border-hairline bg-surface/40 px-6 py-10">
      <p className="font-mono text-[11px] tracking-[0.22em] text-signal uppercase">{kicker}</p>
      <h3 className="font-display mt-3 text-2xl text-strong">{title}</h3>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function ErrorState({
  title = 'Request failed',
  body,
  message,
  onRetry,
}: {
  title?: string
  body?: string
  message?: string
  onRetry?: () => void
}) {
  const content = body || message || 'An unexpected error occurred.'
  return (
    <div className="border border-risk/40 bg-surface px-6 py-8">
      <p className="font-mono text-[11px] tracking-[0.22em] text-risk uppercase">Error</p>
      <h3 className="font-display mt-3 text-2xl text-strong">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{content}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 min-h-11 border border-border px-4 font-mono text-[11px] tracking-[0.18em] text-strong uppercase"
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}

export function UnavailableCapability({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div className="border border-hairline bg-surface-2/60 px-6 py-8">
      <p className="font-mono text-[11px] tracking-[0.22em] text-unknown uppercase">Not exposed by API</p>
      <h3 className="font-display mt-3 text-2xl text-strong">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{body}</p>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-surface-2', className)} />
}

export function PageHeader({
  kicker,
  title,
  description,
  actions,
}: {
  kicker: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-hairline pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="font-mono text-[11px] tracking-[0.28em] text-signal uppercase">{kicker}</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,4vw,3.4rem)] leading-none text-strong">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  )
}
