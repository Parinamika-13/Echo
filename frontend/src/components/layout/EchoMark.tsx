export function EchoMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <rect x="1" y="1" width="26" height="26" fill="none" stroke="var(--echo-signal)" />
        <path d="M7 20 V8 h8.5 M7 14 h6.5" fill="none" stroke="var(--echo-text-strong)" strokeWidth="1.6" />
        <circle cx="20" cy="8" r="2" fill="var(--echo-signal)" />
      </svg>
      {compact ? (
        <span className="sr-only">ECHO</span>
      ) : (
        <div>
          <p className="font-mono text-[11px] tracking-[0.42em] text-strong">ECHO</p>
          <p className="font-mono text-[9px] tracking-[0.18em] text-muted uppercase">Intelligence terminal</p>
        </div>
      )}
    </div>
  )
}
