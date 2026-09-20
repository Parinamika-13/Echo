import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, UserPlus, Shield, UserCheck, ShieldAlert } from 'lucide-react'
import { listUsers } from '@/api/users'
import { Skeleton, ErrorState, EmptyState } from '@/components/feedback/States'

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-system-users'],
    queryFn: () => listUsers(),
  })

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !searchTerm ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = !roleFilter || u.role === roleFilter
      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'ACTIVE' && u.is_active) ||
        (statusFilter === 'INACTIVE' && !u.is_active)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, roleFilter, statusFilter])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-hairline pb-5 gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-[0.28em] text-signal uppercase">Access Control</p>
          <h1 className="font-display mt-1 text-3xl sm:text-4xl text-strong font-medium">User Management</h1>
          <p className="mt-1 text-sm text-muted">
            Manage administrative personnel, analyst accounts, role-based access control, and platform permissions.
          </p>
        </div>

        <button
          type="button"
          disabled
          title="User invitations are not available through the current API"
          className="flex min-h-11 items-center gap-2 border border-hairline bg-surface px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted opacity-60 cursor-not-allowed self-start sm:self-auto"
        >
          <UserPlus size={14} />
          <span>Invite User</span>
          <span className="text-[10px] text-faint normal-case">(Not available through current API)</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 border border-hairline bg-surface p-3">
        <div className="flex-1 flex items-center gap-2 border border-hairline bg-bg px-3 py-2">
          <Search size={16} className="text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search users by name, email, or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-strong outline-none placeholder:text-muted"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          aria-label="Filter by Role"
          className="border border-hairline bg-bg px-3 py-2 text-xs font-mono text-muted outline-none"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="ANALYST">ANALYST</option>
          <option value="USER">USER</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by Status"
          className="border border-hairline bg-bg px-3 py-2 text-xs font-mono text-muted outline-none"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : error ? (
        <ErrorState
          message="Could not load system user roster. Administrative privileges or active session required."
          onRetry={refetch}
        />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No Users Found"
          message="No user accounts match the selected criteria."
        />
      ) : (
        <div className="overflow-x-auto border border-hairline bg-surface">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-surface-2 border-b border-hairline text-muted uppercase text-[10px]">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Auth Provider</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-surface-2/60 transition-colors">
                  <td className="p-3 font-sans font-medium text-strong">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-surface-3 border border-hairline flex items-center justify-center font-mono text-[10px] text-signal font-semibold">
                        {(u.name || u.email || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div>{u.name || 'Anonymous User'}</div>
                        <div className="font-mono text-[10px] text-muted">{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-ink">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 border text-[10px] font-semibold uppercase ${
                      u.role === 'ADMIN'
                        ? 'border-signal/40 bg-signal/15 text-signal'
                        : 'border-hairline bg-surface-2 text-muted'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-muted uppercase text-[10px]">
                    {u.auth_provider || 'email'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 border text-[10px] font-semibold uppercase ${
                      u.is_active
                        ? 'border-gain/40 bg-gain/10 text-gain'
                        : 'border-loss/40 bg-loss/10 text-loss'
                    }`}>
                      {u.is_active ? 'ACTIVE' : 'SUSPENDED'}
                    </span>
                  </td>
                  <td className="p-3 text-muted">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      to={`/admin/users/${u.id}`}
                      className="border border-hairline px-2.5 py-1 text-[11px] text-strong hover:border-signal/50 hover:text-signal transition-colors inline-block"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
