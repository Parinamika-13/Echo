import { Link } from 'react-router-dom'
import { RadioTower, ArrowLeft, LayoutDashboard } from 'lucide-react'
import { EchoMark } from '@/components/layout/EchoMark'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between antialiased">
      {/* Top Bar */}
      <header className="border-b border-hairline px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <EchoMark className="text-signal" />
          <span className="font-display font-medium text-strong text-lg">ECHO</span>
        </Link>
        <Link
          to="/admin/dashboard"
          className="font-mono text-xs text-signal hover:underline"
        >
          Console Terminal &rarr;
        </Link>
      </header>

      {/* Center 404 Visual */}
      <main className="max-w-md mx-auto px-6 py-16 text-center space-y-6">
        <div className="relative inline-flex items-center justify-center p-6 border border-hairline bg-surface">
          <RadioTower size={40} className="text-signal animate-pulse" />
        </div>

        <div className="space-y-2">
          <p className="font-mono text-xs text-risk tracking-[0.28em] uppercase">Error 404 &bull; Signal Lost</p>
          <h1 className="font-display text-4xl text-strong font-medium">Coordinate Not Found</h1>
          <p className="text-sm text-muted leading-relaxed">
            The destination URL or intelligence resource you requested does not exist or has been relocated within the network.
          </p>
        </div>

        {/* Navigation Recovery Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 border border-hairline bg-surface px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-strong hover:bg-surface-2 transition-colors"
          >
            <ArrowLeft size={14} />
            Return to ECHO
          </Link>

          <Link
            to="/admin/dashboard"
            className="flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 border border-signal bg-signal/15 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-strong hover:bg-signal/25 transition-colors font-semibold"
          >
            <LayoutDashboard size={14} className="text-signal" />
            Go to Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline px-6 py-4 text-center font-mono text-xs text-muted">
        <p>ECHO Financial Intelligence &bull; Verified Provenance Network</p>
      </footer>
    </div>
  )
}
