import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react'

type ProtectedRouteProps = {
  children?: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, role, user, signOut } = useAuth()
  const location = useLocation()

  // 1. Not authenticated -> Redirect to shared login
  if (!isAuthenticated) {
    const targetContext = requireAdmin ? 'admin' : 'user'
    return (
      <Navigate
        to={`/login?context=${targetContext}&redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  // 2. Admin required, but user is NOT an Admin -> Strict backend authorization enforcement
  if (requireAdmin && role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-bg text-ink flex items-center justify-center p-6 antialiased">
        <div className="max-w-md w-full border border-hairline bg-surface p-7 shadow-xl space-y-5 text-center">
          <div className="mx-auto h-12 w-12 border border-loss/40 bg-loss/10 flex items-center justify-center">
            <ShieldAlert className="text-loss h-6 w-6" />
          </div>

          <div className="space-y-1.5">
            <span className="font-mono text-[10px] text-loss font-semibold uppercase tracking-widest">
              Access Restricted
            </span>
            <h2 className="text-xl font-display font-medium text-strong">
              Administrative Authorization Required
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              Your account (<span className="text-strong">{user?.email}</span>) is provisioned with{' '}
              <span className="text-signal font-semibold">Workspace Analyst</span> permissions. The Command Center is restricted to authorized System Administrators.
            </p>
          </div>

          <div className="p-3 border border-hairline bg-bg font-mono text-xs text-left space-y-1">
            <div className="flex justify-between text-muted">
              <span>Account Role:</span>
              <span className="text-signal font-semibold">{role || 'USER'}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Requested Resource:</span>
              <span className="text-strong truncate max-w-[180px]">{location.pathname}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Link
              to="/app/dashboard"
              className="flex-1 min-h-11 border border-signal bg-signal/15 px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-strong hover:bg-signal/25 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} className="text-signal" />
              <span>To Workspace</span>
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="min-h-11 border border-hairline bg-surface-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-muted hover:text-strong transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return children ? <>{children}</> : null
}
