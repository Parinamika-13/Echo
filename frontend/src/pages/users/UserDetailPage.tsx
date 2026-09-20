import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Shield, User, Calendar, KeyRound } from 'lucide-react'
import { getUser } from '@/api/users'
import { Skeleton, ErrorState } from '@/components/feedback/States'

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['admin-system-user', id],
    queryFn: () => getUser(id!),
    enabled: Boolean(id),
  })

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-signal hover:underline"
        >
          <ArrowLeft size={14} />
          Back to Users
        </Link>
        <ErrorState message={`System user account '${id}' could not be located or session lacks administrative authorization.`} />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-signal hover:underline"
      >
        <ArrowLeft size={14} />
        Back to Users
      </Link>

      {/* Header */}
      <div className="border border-hairline bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 border border-hairline bg-surface-2 text-signal">
              {user.id}
            </span>
            <span
              className={`font-mono text-[10px] uppercase px-2 py-0.5 border font-semibold ${
                user.is_active
                  ? 'border-gain/40 bg-gain/10 text-gain'
                  : 'border-loss/40 bg-loss/10 text-loss'
              }`}
            >
              {user.is_active ? 'ACTIVE' : 'SUSPENDED'}
            </span>
          </div>
          <span className="font-mono text-xs text-muted">
            Role: <strong className="text-signal">{user.role}</strong>
          </span>
        </div>

        <h1 className="font-display text-3xl text-strong font-medium">
          {user.name || 'Account Dossier'}
        </h1>
        <p className="text-sm text-muted font-mono">{user.email}</p>
      </div>

      {/* Account Properties */}
      <div className="border border-hairline bg-surface p-6 space-y-6">
        <h2 className="text-sm font-semibold font-display text-strong uppercase tracking-wider">
          Account Clearance &amp; Authentication Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 border border-hairline bg-bg space-y-1">
            <span className="text-[10px] text-muted uppercase block">User ID</span>
            <span className="text-strong font-semibold">{user.id}</span>
          </div>

          <div className="p-4 border border-hairline bg-bg space-y-1">
            <span className="text-[10px] text-muted uppercase block">Email Address</span>
            <span className="text-strong font-semibold">{user.email}</span>
          </div>

          <div className="p-4 border border-hairline bg-bg space-y-1">
            <span className="text-[10px] text-muted uppercase block">Authentication Provider</span>
            <span className="text-strong font-semibold uppercase">{user.auth_provider || 'email'}</span>
          </div>

          <div className="p-4 border border-hairline bg-bg space-y-1">
            <span className="text-[10px] text-muted uppercase block">Provisioned Date</span>
            <span className="text-strong font-semibold">
              {user.created_at ? new Date(user.created_at).toLocaleString() : '—'}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-hairline">
          <p className="text-xs text-muted font-mono leading-relaxed">
            Role policies and granular permissions are governed by ECHO&apos;s role-based access control engine. Active authentication sessions validate against the database session store.
          </p>
        </div>
      </div>
    </div>
  )
}
