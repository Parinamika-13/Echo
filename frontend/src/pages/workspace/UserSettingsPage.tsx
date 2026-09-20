import { useState } from 'react'
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Wifi,
  HardDrive,
} from 'lucide-react'
import { useTheme, type ThemeMode } from '@/context/ThemeContext'
import { useQuery } from '@tanstack/react-query'
import { getHealth } from '@/api/health'

export function UserSettingsPage() {
  const { mode, setMode } = useTheme()
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [language, setLanguage] = useState('English')

  // Notification Preferences
  const [emailNotif, setEmailNotif] = useState(false)
  const [signalAlerts, setSignalAlerts] = useState(true)
  const [investigationUpdates, setInvestigationUpdates] = useState(true)
  const [riskAlerts, setRiskAlerts] = useState(true)

  const [savedNotice, setSavedNotice] = useState<string | null>(null)

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['settings-health-probe'],
    queryFn: () => getHealth(),
  })

  const isHealthy = health?.status === 'ok' || health?.status === 'healthy'

  const notifySaved = (msg: string) => {
    setSavedNotice(msg)
    setTimeout(() => setSavedNotice(null), 2500)
  }

  const themes: Array<{ id: ThemeMode; label: string; icon: typeof Moon }> = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-strong">SETTINGS</h1>
          <p className="text-xs sm:text-sm text-muted">Workspace visual and notification configuration</p>
        </div>

        {savedNotice && (
          <span className="text-xs font-mono text-gain flex items-center gap-1">
            <CheckCircle2 size={13} /> {savedNotice}
          </span>
        )}
      </div>

      {/* Section 1: Appearance */}
      <div className="border border-hairline bg-surface p-6 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <h2 className="font-semibold text-strong uppercase tracking-wider">Appearance</h2>
          <span className="text-[10px] text-muted">Theme</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => {
                setMode(theme.id)
                notifySaved(`Theme updated to ${theme.label}`)
              }}
              className={`min-h-14 p-3 border flex flex-col items-center justify-center gap-1.5 uppercase tracking-wider transition-colors ${
                mode === theme.id
                  ? 'border-signal bg-signal/15 text-strong font-semibold'
                  : 'border-hairline bg-bg text-muted hover:text-strong'
              }`}
            >
              <theme.icon size={15} className={mode === theme.id ? 'text-signal' : 'text-muted'} />
              <span>{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Section 2: Display Density */}
      <div className="border border-hairline bg-surface p-6 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <h2 className="font-semibold text-strong uppercase tracking-wider">Display</h2>
          <span className="text-[10px] text-muted">Interface Density</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'comfortable', label: 'Comfortable', desc: 'Touch-optimized action spacing' },
            { id: 'compact', label: 'Compact', desc: 'High-density institutional tables' },
          ].map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setDensity(d.id as 'comfortable' | 'compact')
                notifySaved(`Density set to ${d.label}`)
              }}
              className={`p-3.5 border text-left transition-colors ${
                density === d.id
                  ? 'border-signal bg-signal/15 text-strong font-semibold'
                  : 'border-hairline bg-bg text-muted hover:text-strong'
              }`}
            >
              <p className="uppercase">{d.label}</p>
              <p className="text-[11px] text-muted mt-1">{d.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Section 3: Notifications */}
      <div className="border border-hairline bg-surface p-6 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h2 className="font-semibold text-strong uppercase tracking-wider">Notifications</h2>
            <p className="text-[11px] text-muted">Local preferences for alert triggers</p>
          </div>
          <span className="text-[10px] text-amber-500 border border-amber-500/30 px-2 py-0.5 uppercase">
            Local Preferences
          </span>
        </div>

        <div className="divide-y divide-hairline">
          {[
            { label: 'Email notifications', val: emailNotif, setVal: setEmailNotif },
            { label: 'Signal alerts', val: signalAlerts, setVal: setSignalAlerts },
            { label: 'Investigation updates', val: investigationUpdates, setVal: setInvestigationUpdates },
            { label: 'Risk alerts', val: riskAlerts, setVal: setRiskAlerts },
          ].map((row) => (
            <div key={row.label} className="py-3 flex items-center justify-between">
              <span className="text-strong">{row.label}</span>
              <button
                type="button"
                onClick={() => {
                  row.setVal(!row.val)
                  notifySaved(`${row.label} ${!row.val ? 'ON' : 'OFF'}`)
                }}
                className={`px-3 py-1 border text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                  row.val
                    ? 'border-signal bg-signal/20 text-strong'
                    : 'border-hairline bg-surface-2 text-muted'
                }`}
              >
                {row.val ? 'ON' : 'OFF'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Language */}
      <div className="border border-hairline bg-surface p-6 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <h2 className="font-semibold text-strong uppercase tracking-wider">Language</h2>
          <span className="text-strong">English</span>
        </div>

        <div className="flex items-center justify-between p-3 border border-hairline bg-bg">
          <span className="text-muted">Active Interface Language:</span>
          <span className="text-strong font-semibold">English (US)</span>
        </div>
      </div>

      {/* Section 5: Data / API Connection */}
      <div className="border border-hairline bg-surface p-6 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <Wifi size={15} className="text-signal" />
            <h2 className="font-semibold text-strong uppercase tracking-wider">Data / API Connection</h2>
          </div>
          <span
            className={`px-2 py-0.5 border text-[10px] uppercase font-semibold ${
              isHealthy
                ? 'border-gain/30 bg-gain/10 text-gain'
                : 'border-signal text-signal'
            }`}
          >
            {healthLoading ? 'Checking...' : isHealthy ? 'Connected' : 'Unavailable'}
          </span>
        </div>

        <div className="divide-y divide-hairline">
          <div className="py-2 flex justify-between">
            <span className="text-muted">ECHO API Gateway:</span>
            <span className="text-strong">
              {isHealthy ? 'Connected \u2022 Active' : 'Unavailable'}
            </span>
          </div>
          <div className="py-2 flex justify-between">
            <span className="text-muted">Database Engine:</span>
            <span className="text-strong">{health?.database || 'PostgreSQL'}</span>
          </div>
          <div className="py-2 flex justify-between">
            <span className="text-muted">Platform Version:</span>
            <span className="text-strong">
              {health?.version ? `${health.version} (${health.environment || 'Production'})` : '0.1.0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
