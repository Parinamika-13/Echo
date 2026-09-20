import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Shield,
  KeyRound,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Lock,
  Upload,
  ShieldAlert,
  Info,
  Check,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { initials } from '@/lib/format'

export function UserProfilePage() {
  const { user, profile, updateProfile, changePassword, signOut } = useAuth()
  const navigate = useNavigate()

  // Personal Information
  const [fullName, setFullName] = useState(user?.name || profile.name || '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarDataUrl)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)

  // Password Change
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Avatar image must be under 2MB.')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const res = reader.result as string
        setAvatarUrl(res)
        updateProfile({ avatarDataUrl: res })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({ name: fullName, avatarDataUrl: avatarUrl })
    setProfileSuccess('Personal information updated.')
    setTimeout(() => setProfileSuccess(null), 3000)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (!oldPassword) {
      setPasswordError('Please enter your current password.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setPasswordLoading(true)
    try {
      const res = await changePassword(oldPassword, newPassword)
      if (res.success) {
        setPasswordSuccess(res.message)
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordError(res.message)
      }
    } catch {
      setPasswordError('Failed to update password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut()
    navigate('/login?context=user')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header matching Section 19 */}
      <div className="border-b border-hairline pb-4">
        <h1 className="text-2xl font-display font-medium text-strong">PROFILE</h1>
        <p className="text-xs sm:text-sm text-muted">Manage your ECHO account</p>
      </div>

      {/* Identity Section */}
      <div className="border border-hairline bg-surface p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Large Avatar with Change Photo Button */}
        <div className="flex flex-col items-center gap-2.5 shrink-0">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile Avatar"
                className="h-28 w-28 object-cover border border-hairline"
              />
            ) : (
              <div className="h-28 w-28 bg-surface-3 border border-hairline font-mono text-3xl text-signal font-semibold flex items-center justify-center">
                {initials(fullName || user?.email || '') || '—'}
              </div>
            )}
          </div>
          <label className="cursor-pointer border border-hairline bg-surface-2 hover:bg-surface-3 px-3 py-1 text-xs font-mono text-strong uppercase tracking-wider transition-colors flex items-center gap-1.5">
            <Upload size={12} />
            <span>Change Photo</span>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>

        <div className="space-y-1.5 text-center sm:text-left flex-1">
          <h2 className="text-xl font-display font-medium text-strong">{fullName || user?.email || 'Authenticated User'}</h2>
          <p className="text-xs font-mono text-muted">{user?.email || profile.email}</p>
          <span className="inline-block mt-2 font-mono text-[10px] text-signal uppercase tracking-wider border border-signal/30 bg-signal/10 px-2.5 py-0.5 font-semibold">
            {user?.role ? `${user.role} • Workspace Analyst` : 'Workspace Analyst'}
          </span>
        </div>
      </div>

      {/* Personal Information Form */}
      <div className="border border-hairline bg-surface p-6 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <h3 className="font-semibold text-strong uppercase tracking-wider">Personal Information</h3>
          {profileSuccess && (
            <span className="text-gain flex items-center gap-1 text-[11px]">
              <Check size={13} /> {profileSuccess}
            </span>
          )}
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] text-muted uppercase">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="min-h-10 w-full border border-hairline bg-bg px-3 text-ink focus:border-signal focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-muted uppercase">Email Address</label>
            <input
              type="email"
              value={user?.email || profile.email}
              disabled
              className="min-h-10 w-full border border-hairline bg-surface-2 px-3 text-muted cursor-not-allowed opacity-75"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-muted uppercase">Role</label>
            <input
              type="text"
              value={user?.role || ''}
              disabled
              className="min-h-10 w-full border border-hairline bg-surface-2 px-3 text-muted cursor-not-allowed opacity-75"
            />
          </div>

          <button
            type="submit"
            className="min-h-10 border border-hairline bg-surface-2 hover:bg-surface-3 text-strong px-4 uppercase text-[11px] tracking-wider font-semibold transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Account Information */}
      <div className="border border-hairline bg-surface p-6 space-y-4 font-mono text-xs">
        <h3 className="font-semibold text-strong uppercase tracking-wider border-b border-hairline pb-3">
          ACCOUNT
        </h3>
        <div className="divide-y divide-hairline space-y-2 pt-1">
          <div className="flex justify-between py-1.5">
            <span className="text-muted">Account Created:</span>
            <span className="text-strong">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Deployment'}
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted">Last Sign-In:</span>
            <span className="text-strong">Active Session</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted">Authentication Method:</span>
            <span className="text-strong">{user?.auth_provider || 'Email / Password'}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted">Account Status:</span>
            <span className="text-gain font-semibold">Active</span>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="border border-hairline bg-surface p-6 space-y-4 font-mono text-xs">
        <h3 className="font-semibold text-strong uppercase tracking-wider border-b border-hairline pb-3">
          SECURITY
        </h3>

        {passwordError && (
          <div className="border border-loss/40 bg-loss/10 p-3 text-loss flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="border border-gain/40 bg-gain/10 p-3 text-gain flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] text-muted uppercase">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••••"
              className="min-h-10 w-full border border-hairline bg-bg px-3 text-ink focus:border-signal focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[10px] text-muted uppercase">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••"
                className="min-h-10 w-full border border-hairline bg-bg px-3 text-ink focus:border-signal focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] text-muted uppercase">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••"
                className="min-h-10 w-full border border-hairline bg-bg px-3 text-ink focus:border-signal focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="min-h-10 border border-signal bg-signal/15 hover:bg-signal/25 text-strong px-4 uppercase text-[11px] tracking-wider font-semibold transition-colors disabled:opacity-50"
          >
            {passwordLoading ? 'Updating...' : 'Change Password'}
          </button>
        </form>

        <div className="pt-4 border-t border-hairline flex items-center justify-between">
          <div>
            <p className="text-strong font-semibold">Two-Factor Authentication</p>
            <p className="text-[11px] text-muted">Not configured</p>
          </div>
          <span className="text-[10px] border border-hairline bg-surface-2 px-2.5 py-1 text-muted uppercase">
            Managed by Organization
          </span>
        </div>
      </div>

      {/* Connected Authentication */}
      <div className="border border-hairline bg-surface p-6 space-y-4 font-mono text-xs">
        <h3 className="font-semibold text-strong uppercase tracking-wider border-b border-hairline pb-3">
          AUTHENTICATION
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-hairline bg-bg">
            <span className="text-strong font-semibold">Email / Password</span>
            <span className="text-gain flex items-center gap-1 font-semibold">
              <Check size={13} /> Connected
            </span>
          </div>

          <div className="flex items-center justify-between p-3 border border-hairline bg-bg">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="text-strong font-semibold">Google</span>
            </div>
            <span className="text-amber-500 text-[10px] border border-amber-500/30 px-1.5 py-0.5 uppercase">
              Not Connected
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-loss/40 bg-surface p-6 space-y-4 font-mono text-xs">
        <h3 className="font-semibold text-loss uppercase tracking-wider border-b border-hairline pb-3">
          DANGER ZONE
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-strong font-semibold">End Active Session</p>
            <p className="text-[11px] text-muted">Terminate access credentials on this browser</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="border border-loss/40 bg-loss/10 hover:bg-loss/20 text-loss px-4 py-2 uppercase font-semibold transition-colors"
          >
            Sign out
          </button>
        </div>

        <div className="pt-3 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-60">
          <div>
            <p className="text-strong font-semibold">Delete Account</p>
            <p className="text-[11px] text-muted">Contact System Administrator for organization-level account removal</p>
          </div>
          <span className="border border-hairline bg-surface-2 px-3 py-1.5 text-muted text-[10px] uppercase">
            Contact Administrator
          </span>
        </div>
      </div>
    </div>
  )
}
