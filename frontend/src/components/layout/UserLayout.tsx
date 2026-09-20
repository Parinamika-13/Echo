import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell,
  Search,
  Bookmark,
  Activity,
  Layers,
  ShieldAlert,
  BarChart3,
  Terminal,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react'
import { EchoMark } from './EchoMark'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { initials } from '@/lib/format'

const USER_NAV_ITEMS = [
  { label: 'Dashboard', path: '/app/dashboard', icon: Activity },
  { label: 'Entities', path: '/app/entities', icon: Layers },
  { label: 'Signals', path: '/app/signals', icon: ShieldAlert },
  { label: 'Risk', path: '/app/risk', icon: BarChart3 },
  { label: 'Analysis', path: '/app/analysis', icon: BarChart3 },
  { label: 'Investigations', path: '/app/investigations', icon: Terminal },
  { label: 'Watchlist', path: '/app/watchlist', icon: Bookmark },
  { label: 'Search', path: '/app/search', icon: Search },
]

export function UserLayout() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const { mode, setMode } = useTheme()
  const navigate = useNavigate()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifPopoverOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSignOut = () => {
    signOut()
    navigate('/login?context=user', { replace: true })
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col antialiased">
      {/* Persistent User Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-surface/95 backdrop-blur-md px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/app/dashboard" className="flex items-center gap-2">
              <EchoMark className="text-signal" />
              <span className="font-display font-medium text-strong text-lg">ECHO</span>
              <span className="hidden lg:inline font-mono text-[10px] text-signal font-semibold tracking-wider border border-signal/30 bg-signal/10 px-1.5 py-0.5 uppercase">
                Workspace
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation Bar */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-mono">
            {USER_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 transition-colors uppercase tracking-wider ${
                    isActive
                      ? 'border-b-2 border-signal text-strong font-semibold'
                      : 'text-muted hover:text-strong'
                  }`
                }
              >
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Side: Quick Action, Admin Link, Notification & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* If user is an Admin, provide shortcut switch to Admin Command Center */}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:flex items-center gap-1.5 border border-hairline bg-surface-2 hover:bg-surface-3 px-2.5 py-1 text-[10px] font-mono text-signal uppercase tracking-wider transition-colors"
                title="Switch to Admin Command Center"
              >
                <ShieldCheck size={12} />
                <span>Command Center</span>
              </Link>
            )}

            {/* Notification Bell with Honest Unconnected State */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifPopoverOpen(!notifPopoverOpen)}
                className="p-2 text-muted hover:text-strong hover:bg-surface-2 transition-colors border border-hairline relative"
                aria-label="System Notifications"
              >
                <Bell size={16} />
              </button>

              {notifPopoverOpen && (
                <div className="absolute right-0 mt-2 w-80 border border-hairline bg-surface p-4 shadow-xl z-50 text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-hairline pb-2">
                    <span className="font-mono text-xs font-semibold text-strong uppercase tracking-wider">
                      Workspace Alerts
                    </span>
                    <span className="text-[10px] font-mono text-muted">Telemetry Mode</span>
                  </div>
                  <div className="space-y-2 text-muted text-[11px] leading-relaxed">
                    <p className="bg-bg p-2.5 border border-hairline font-mono">
                      Real-time push notification service is not connected to backend. Alerts are generated dynamically during active investigation runs and signal scans.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 border border-hairline bg-surface p-1 pr-2.5 hover:bg-surface-2 transition-colors"
              >
                <span className="h-7 w-7 bg-surface-3 font-mono text-[11px] text-signal font-semibold flex items-center justify-center">
                  {initials(user?.name || profile.name) || (user?.email ? user.email.slice(0, 2).toUpperCase() : 'U')}
                </span>
                <span className="hidden md:inline text-xs text-strong font-medium truncate max-w-[120px]">
                  {user?.name || profile.name || user?.email || 'User'}
                </span>
                <ChevronDown size={13} className="text-muted" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 border border-hairline bg-surface p-2 shadow-xl z-50 text-xs space-y-1">
                  <div className="p-2 border-b border-hairline">
                    <p className="font-semibold text-strong truncate">{user?.name || profile.name}</p>
                    <p className="text-[11px] text-muted truncate font-mono">{user?.email || profile.email}</p>
                    <span className="inline-block mt-1 font-mono text-[9px] uppercase tracking-wider text-signal bg-signal/10 border border-signal/20 px-1.5 py-0.5">
                      {user?.role || 'USER'} &bull; Workspace Analyst
                    </span>
                  </div>

                  <Link
                    to="/app/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-2 hover:bg-surface-2 transition-colors text-muted hover:text-strong"
                  >
                    <User size={14} />
                    <span>User Profile</span>
                  </Link>

                  <Link
                    to="/app/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-2 hover:bg-surface-2 transition-colors text-muted hover:text-strong"
                  >
                    <Settings size={14} />
                    <span>Workspace Settings</span>
                  </Link>

                  <div className="border-t border-hairline my-1" />

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-surface-2 transition-colors text-loss hover:text-loss text-left"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-muted hover:text-strong hover:bg-surface-2 transition-colors border border-hairline"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-hairline py-3 px-2 space-y-1 bg-surface">
            {USER_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'bg-signal/15 text-strong font-semibold border-l-2 border-signal'
                      : 'text-muted hover:text-strong'
                  }`
                }
              >
                <item.icon size={15} />
                <span>{item.label}</span>
              </NavLink>
            ))}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-mono uppercase tracking-wider text-signal hover:text-strong border-t border-hairline mt-2"
              >
                <ShieldCheck size={15} />
                <span>Switch to Admin Command Center</span>
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* User Workspace Footer */}
      <footer className="border-t border-hairline bg-surface px-6 py-4 text-xs font-mono text-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-signal" />
            <span>ECHO Intelligence Workspace &bull; FastAPIs Active</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/app/watchlist" className="hover:text-strong">Watchlist</Link>
            <Link to="/app/profile" className="hover:text-strong">Profile</Link>
            <Link to="/app/settings" className="hover:text-strong">Settings</Link>
            <Link to="/privacy" className="hover:text-strong">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
