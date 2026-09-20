import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { ADMIN_NAV_SECTIONS } from './nav'
import { EchoMark } from './EchoMark'
import { Breadcrumbs } from './Breadcrumbs'
import { ProfileMenu, Avatar } from './ProfileMenu'
import { GlobalSearchModal } from './GlobalSearchModal'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/format'

export function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const { profile, session, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-hairline bg-surface/95 px-4 backdrop-blur-md">
        {/* Left: Mobile hamburger & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            className="flex h-11 w-11 items-center justify-center border border-hairline bg-surface-2 text-muted hover:text-strong lg:hidden"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link to="/admin/dashboard" className="hidden lg:flex items-center gap-2 pr-2">
            <EchoMark className="text-signal" />
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold tracking-wider text-strong text-base">ECHO</span>
              <span className="font-mono text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 border border-amber-500/40 bg-amber-500/10 text-amber-400">
                ADMIN CONSOLE
              </span>
            </div>
          </Link>

          <div className="hidden sm:block">
            <Breadcrumbs />
          </div>
        </div>

        {/* Center / Right: Global Search & Actions */}
        <div className="flex items-center gap-2">
          {/* Global Search Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex min-h-11 items-center gap-2 border border-hairline bg-surface-2 px-3 py-1.5 text-xs text-muted hover:border-signal/50 hover:text-strong transition-colors"
          >
            <Search size={14} className="text-signal" />
            <span className="hidden md:inline">Global Search</span>
            <kbd className="hidden font-mono text-[10px] border border-hairline bg-bg px-1.5 py-0.5 text-muted md:inline">
              Ctrl+K
            </kbd>
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((prev) => !prev)}
              aria-label="Notifications"
              className="flex h-11 w-11 items-center justify-center border border-hairline bg-surface-2 text-muted hover:text-strong transition-colors"
            >
              <Bell size={16} />
            </button>

            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-72 border border-hairline bg-bg-elevated p-4 shadow-xl">
                  <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Notifications</p>
                  <p className="mt-2 text-xs text-muted">No notification service connected.</p>
                  <p className="mt-1 font-mono text-[10px] text-faint">
                    Alert notifications from agent workflows will appear here once connected.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Help Button */}
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            aria-label="Help & Documentation"
            className="flex h-11 w-11 items-center justify-center border border-hairline bg-surface-2 text-muted hover:text-strong transition-colors"
          >
            <HelpCircle size={16} />
          </button>

          {/* Admin Avatar & Dropdown */}
          <ProfileMenu />
        </div>
      </header>

      {/* Main Container: Sidebar + Page Content */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-hairline bg-surface shrink-0">
          <div className="py-4 overflow-y-auto">
            {/* Brand Title */}
            <div className="px-5 mb-5">
              <div className="flex items-center gap-2.5">
                <EchoMark className="text-signal" />
                <div>
                  <span className="font-display text-lg font-medium tracking-wide text-strong block leading-none">
                    ECHO
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.2em] text-signal uppercase block mt-1 font-semibold">
                    ADMIN CONSOLE
                  </span>
                </div>
              </div>
              <div className="mt-2.5 px-2 py-1 border border-hairline bg-surface-2 font-mono text-[9px] text-muted flex items-center justify-between">
                <span className="text-amber-400 font-semibold uppercase">Platform Operator</span>
                <span className="text-hairline">|</span>
                <span>RESTRICTED</span>
              </div>
            </div>

            {/* Navigation Groups */}
            <nav className="space-y-5 px-3">
              {ADMIN_NAV_SECTIONS.map((section) => (
                <div key={section.title}>
                  <p className="px-2 font-mono text-[10px] font-medium tracking-[0.22em] text-muted/70 uppercase">
                    {section.title}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <li key={item.to}>
                          <NavLink
                            to={item.to}
                            className={({ isActive }) =>
                              cn(
                                'flex min-h-11 items-center gap-2.5 px-2.5 py-1.5 text-xs transition-colors',
                                isActive
                                  ? 'border-l-2 border-signal bg-surface-2 font-medium text-strong pl-2'
                                  : 'text-muted hover:bg-surface-2/60 hover:text-strong',
                              )
                            }
                          >
                            <Icon size={15} className="shrink-0 text-muted" />
                            <span>{item.label}</span>
                          </NavLink>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* Bottom Sidebar User Summary */}
          <div className="border-t border-hairline p-3 bg-surface-2/40 space-y-2">
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar name={profile.name} src={profile.avatarDataUrl} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-strong">{profile.name}</p>
                  <p className="font-mono text-[9px] text-signal truncate">
                    {session?.roleLabel ?? 'Administrator'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  signOut()
                  navigate('/admin/dashboard')
                }}
                title="Sign out"
                className="flex h-8 w-8 items-center justify-center text-muted hover:text-risk transition-colors"
              >
                <LogOut size={14} />
              </button>
            </div>
            <div className="flex items-center justify-between px-2 pt-1 border-t border-hairline/60 font-mono text-[9px] text-muted">
              <Link to="/privacy" className="hover:text-strong transition-colors">Privacy</Link>
              <span>&bull;</span>
              <Link to="/terms" className="hover:text-strong transition-colors">Terms</Link>
              <span>&bull;</span>
              <Link to="/" className="hover:text-strong transition-colors">Public Site</Link>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed top-0 bottom-0 left-0 w-72 bg-surface border-r border-hairline p-4 flex flex-col justify-between overflow-y-auto z-50">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-hairline">
                  <div className="flex items-center gap-2">
                    <EchoMark className="text-signal" />
                    <div>
                      <span className="font-display font-medium text-strong">ECHO</span>
                      <span className="block font-mono text-[9px] text-signal font-semibold tracking-widest uppercase">
                        ADMIN CONSOLE
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-muted hover:text-strong"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="mt-4 space-y-4">
                  {ADMIN_NAV_SECTIONS.map((section) => (
                    <div key={section.title}>
                      <p className="px-2 font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                        {section.title}
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {section.items.map((item) => {
                          const Icon = item.icon
                          return (
                            <li key={item.to}>
                              <NavLink
                                to={item.to}
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                  cn(
                                    'flex min-h-11 items-center gap-3 px-3 py-2 text-sm transition-colors',
                                    isActive
                                      ? 'border-l-2 border-signal bg-surface-2 text-strong font-medium'
                                      : 'text-muted hover:bg-surface-2 hover:text-strong',
                                  )
                                }
                              >
                                <Icon size={16} />
                                <span>{item.label}</span>
                              </NavLink>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </nav>
              </div>

              <div className="border-t border-hairline pt-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={profile.name} src={profile.avatarDataUrl} />
                    <div>
                      <p className="text-xs text-strong font-medium">{profile.name}</p>
                      <p className="font-mono text-[9px] text-signal">Administrator</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                      navigate('/admin/dashboard')
                    }}
                    className="p-2 text-muted hover:text-risk"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-hairline font-mono text-[10px] text-muted">
                  <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="hover:text-strong">Privacy</Link>
                  <span>&bull;</span>
                  <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="hover:text-strong">Terms</Link>
                  <span>&bull;</span>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-strong">Public Site</Link>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Help Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setHelpOpen(false)} />
          <div className="relative w-full max-w-lg border border-hairline bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-signal" />
                <h3 className="font-display text-lg text-strong">ECHO Intelligence Platform</h3>
              </div>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="text-muted hover:text-strong"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-muted leading-relaxed">
              <p>
                ECHO operates an autonomous multi-agent intelligence network designed to investigate corporate disclosures, extract real-estate and financial attributes, compute cross-document contradictions, and evaluate risk profiles.
              </p>
              <p>
                The Admin Command Center provides verifiable operational oversight across the entire provenance chain:
              </p>
              <div className="font-mono text-xs border border-hairline bg-surface-2 p-3 space-y-1">
                <p className="text-signal">SOURCE &rarr; DOCUMENT &rarr; EVIDENCE &rarr; SIGNAL &rarr; RISK &rarr; ANALYSIS</p>
              </div>
              <p className="text-xs">
                All data displayed is queried directly from live FastAPI services and SQLite/PostgreSQL repositories without simulated figures.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="min-h-11 border border-border px-4 font-mono text-xs uppercase tracking-wider text-strong hover:border-signal"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
