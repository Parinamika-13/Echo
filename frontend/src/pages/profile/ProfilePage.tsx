import { useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme, type ThemeMode } from '@/context/ThemeContext'
import { useToast } from '@/context/ToastContext'
import { Avatar } from '@/components/layout/ProfileMenu'
import { Camera, Trash2, CheckCircle2, UserCheck, Shield } from 'lucide-react'

export function ProfilePage() {
  const { profile, session, updateProfile } = useAuth()
  const { mode, setMode } = useTheme()
  const toast = useToast()

  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [phone, setPhone] = useState(profile.phone)
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [reducedMotion, setReducedMotion] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      updateProfile({ avatarDataUrl: dataUrl })
      toast.push({
        title: 'Profile Photo Updated',
        body: 'Photo stored in local device storage.',
      })
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    updateProfile({ avatarDataUrl: null })
    toast.push({
      title: 'Profile Photo Removed',
      body: 'Reset to default initials.',
    })
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({ name, email, phone })
    toast.push({
      title: 'Profile Saved',
      body: 'Administrator profile preferences updated locally.',
    })
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 35. Header */}
      <div className="border-b border-hairline pb-5">
        <p className="font-mono text-[11px] tracking-[0.28em] text-signal uppercase">Operator Identity</p>
        <h1 className="font-display mt-1 text-3xl sm:text-4xl text-strong font-medium">Administrator Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your personal account information, authentication profile, and local interface preferences.
        </p>
      </div>

      {/* Profile Photo Management */}
      <div className="border border-hairline bg-surface p-6 space-y-4">
        <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Profile Photo</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <Avatar name={name} src={profile.avatarDataUrl} large />

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-11 items-center gap-2 border border-signal bg-surface px-4 py-2 font-mono text-xs uppercase tracking-wider text-strong hover:bg-surface-2 transition-colors"
              >
                <Camera size={14} className="text-signal" />
                Change Photo
              </button>

              {profile.avatarDataUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="flex min-h-11 items-center gap-2 border border-hairline bg-surface px-4 py-2 font-mono text-xs uppercase tracking-wider text-risk hover:bg-surface-2 transition-colors"
                >
                  <Trash2 size={14} />
                  Remove Photo
                </button>
              )}
            </div>

            <p className="font-mono text-[11px] text-faint">
              Profile image is stored locally on this device.
            </p>
          </div>
        </div>
      </div>

      {/* Form: Personal Info & Preferences */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Information */}
        <div className="border border-hairline bg-surface p-6 space-y-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Personal Information</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-mono text-xs uppercase tracking-wider text-strong block">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-hairline bg-bg p-3 text-xs text-strong outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-xs uppercase tracking-wider text-strong block">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-hairline bg-bg p-3 text-xs text-strong outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-xs uppercase tracking-wider text-strong block">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full border border-hairline bg-bg p-3 text-xs text-strong outline-none placeholder:text-muted"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-xs uppercase tracking-wider text-muted block">
                System Role
              </label>
              <input
                type="text"
                disabled
                value={session?.roleLabel ?? 'Administrator'}
                className="w-full border border-hairline bg-surface-2 p-3 text-xs font-mono text-signal cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="border border-hairline bg-surface p-6 space-y-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Account Status & Session</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs text-muted">
            <div className="p-3 border border-hairline bg-surface-2 space-y-1">
              <span className="text-faint text-[10px] uppercase block">Account Status</span>
              <span className="text-health font-semibold">Active (Authorized)</span>
            </div>
            <div className="p-3 border border-hairline bg-surface-2 space-y-1">
              <span className="text-faint text-[10px] uppercase block">Session Type</span>
              <span className="text-strong font-semibold">{session?.kind || 'Local Console'}</span>
            </div>
            <div className="p-3 border border-hairline bg-surface-2 space-y-1">
              <span className="text-faint text-[10px] uppercase block">Session Started</span>
              <span className="text-strong truncate block font-sans text-xs">
                {session?.startedAt ? new Date(session.startedAt).toLocaleTimeString() : 'Current Session'}
              </span>
            </div>
            <div className="p-3 border border-hairline bg-surface-2 space-y-1">
              <span className="text-faint text-[10px] uppercase block">Authentication</span>
              <span className="text-strong font-semibold">Local Token Provider</span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="border border-hairline bg-surface p-6 space-y-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Interface Preferences</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Theme */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-strong block">Theme Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as ThemeMode)}
                className="w-full border border-hairline bg-bg p-3 text-xs font-mono text-strong outline-none"
              >
                <option value="dark">Dark (Graphite Ledger)</option>
                <option value="light">Light (Warm Ivory)</option>
                <option value="system">System Preference</option>
              </select>
            </div>

            {/* Interface Density */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-strong block">Interface Density</label>
              <select
                value={density}
                onChange={(e) => setDensity(e.target.value as any)}
                className="w-full border border-hairline bg-bg p-3 text-xs font-mono text-strong outline-none"
              >
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </select>
            </div>

            {/* Reduced Motion */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-strong block">Motion Effects</label>
              <select
                value={reducedMotion ? 'reduced' : 'normal'}
                onChange={(e) => setReducedMotion(e.target.value === 'reduced')}
                className="w-full border border-hairline bg-bg p-3 text-xs font-mono text-strong outline-none"
              >
                <option value="normal">Normal (Animated)</option>
                <option value="reduced">Reduced Motion</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions & Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-hairline pt-4 gap-3">
          <p className="font-mono text-[11px] text-muted">
            Changes are currently stored locally.
          </p>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex min-h-11 items-center gap-2 border border-signal bg-surface px-6 py-2 font-mono text-xs uppercase tracking-wider text-strong hover:bg-surface-2 transition-colors"
            >
              <CheckCircle2 size={14} className="text-signal" />
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
