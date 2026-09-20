import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme, type ThemeMode } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { Settings, Shield, Bell, LogOut, CheckCircle2 } from 'lucide-react'

export function SettingsPage() {
  const { mode, setMode } = useTheme()
  const { signOut } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [landingPage, setLandingPage] = useState('/admin/dashboard')
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD')
  const [timeFormat, setTimeFormat] = useState('24h')

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault()
    toast.push({
      title: 'Settings Saved',
      body: 'General preferences updated locally.',
    })
  }

  const handleSignOut = () => {
    signOut()
    navigate('/admin/dashboard')
    toast.push({
      title: 'Signed Out',
      body: 'Local admin session terminated.',
    })
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 36. Header */}
      <div className="border-b border-hairline pb-5">
        <p className="font-mono text-[11px] tracking-[0.28em] text-signal uppercase">System Configuration</p>
        <h1 className="font-display mt-1 text-3xl sm:text-4xl text-strong font-medium">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Configure platform appearance, general date/time formatting, notification channels, and session security.
        </p>
      </div>

      {/* 1. Appearance */}
      <section className="border border-hairline bg-surface p-6 space-y-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Interface Display</p>
          <h3 className="font-display text-lg text-strong font-medium mt-1">Appearance & Visual Style</h3>
          <p className="text-xs text-muted">Select high-contrast dark graphite ledger or warm ivory parchment.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 pt-1">
          {[
            { id: 'dark', label: 'Dark Mode', desc: 'Graphite ledger palette with aged brass signals.' },
            { id: 'light', label: 'Light Mode', desc: 'Warm ivory parchment with dark ink typography.' },
            { id: 'system', label: 'System Mode', desc: 'Sync automatically with your operating system.' },
          ].map((th) => (
            <button
              key={th.id}
              type="button"
              onClick={() => setMode(th.id as ThemeMode)}
              className={`p-4 border text-left transition-colors min-h-24 ${
                mode === th.id
                  ? 'border-signal bg-surface-2 ring-1 ring-signal'
                  : 'border-hairline bg-bg hover:border-hairline/80'
              }`}
            >
              <span className="font-mono text-xs font-semibold text-strong block">{th.label}</span>
              <span className="text-[11px] text-muted block mt-1 leading-normal">{th.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. General */}
      <form onSubmit={handleSaveGeneral} className="border border-hairline bg-surface p-6 space-y-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Localization</p>
          <h3 className="font-display text-lg text-strong font-medium mt-1">General Preferences</h3>
          <p className="text-xs text-muted">Define default routing and timestamp presentation standards.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="space-y-1.5">
            <label className="text-strong uppercase tracking-wider block">Default Landing Page</label>
            <select
              value={landingPage}
              onChange={(e) => setLandingPage(e.target.value)}
              className="w-full border border-hairline bg-bg p-3 text-strong outline-none"
            >
              <option value="/admin/dashboard">Dashboard Overview</option>
              <option value="/admin/entities">Corporate Entities</option>
              <option value="/admin/investigations">Investigations Control</option>
              <option value="/admin/signals">Signals Catalogue</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-strong uppercase tracking-wider block">Date Presentation</label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full border border-hairline bg-bg p-3 text-strong outline-none"
            >
              <option value="YYYY-MM-DD">ISO 8601 (YYYY-MM-DD)</option>
              <option value="DD MMM YYYY">British Ledger (DD MMM YYYY)</option>
              <option value="MM/DD/YYYY">US Corporate (MM/DD/YYYY)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-strong uppercase tracking-wider block">Time Format</label>
            <select
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value)}
              className="w-full border border-hairline bg-bg p-3 text-strong outline-none"
            >
              <option value="24h">24-hour UTC / Local</option>
              <option value="12h">12-hour AM/PM</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex min-h-11 items-center gap-2 border border-signal bg-surface px-5 py-2 font-mono text-xs uppercase tracking-wider text-strong hover:bg-surface-2 transition-colors"
          >
            <CheckCircle2 size={14} className="text-signal" />
            Update General Preferences
          </button>
        </div>
      </form>

      {/* 3. Notifications (Explicitly unavailable per Section 36 & 37) */}
      <section className="border border-hairline bg-surface p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-muted" />
          <h3 className="font-display text-lg text-strong">Notification Services</h3>
        </div>
        <div className="border border-dashed border-hairline bg-surface-2/40 p-4">
          <p className="font-mono text-xs text-signal font-semibold">No notification service connected.</p>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            ECHO does not have an external push, webhook, or email notification service configured in this environment. System events remain accessible via the audit trail.
          </p>
        </div>
      </section>

      {/* 4. Security (Explicitly unavailable per Section 36) */}
      <section className="border border-hairline bg-surface p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-muted" />
          <h3 className="font-display text-lg text-strong">Security Infrastructure</h3>
        </div>
        <div className="border border-dashed border-hairline bg-surface-2/40 p-4">
          <p className="font-mono text-xs text-signal font-semibold">No remote security service connected.</p>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Multi-factor authentication (MFA), password reset workflows, and hardware security key enrollment are not connected to the current backend API.
          </p>
        </div>
      </section>

      {/* 5. Account & Session Actions */}
      <section className="border border-hairline bg-surface p-6 space-y-3">
        <h3 className="font-display text-lg text-strong">Account Session</h3>
        <p className="text-xs text-muted">
          Terminate the current local administrator session and clear cached credentials.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-11 items-center gap-2 border border-risk/60 bg-surface px-5 py-2 font-mono text-xs uppercase tracking-wider text-risk hover:bg-risk/10 transition-colors"
          >
            <LogOut size={14} />
            Sign Out of Console
          </button>
        </div>
      </section>
    </div>
  )
}
