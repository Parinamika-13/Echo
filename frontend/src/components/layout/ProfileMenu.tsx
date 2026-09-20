import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LogOut, Monitor, Moon, Sun, UserRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme, type ThemeMode } from '@/context/ThemeContext'
import { initials } from '@/lib/format'

export function ProfileMenu() {
  const { profile, session, signOut } = useAuth()
  const { mode, setMode } = useTheme()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const navigate = useNavigate()

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const themes: Array<{ id: ThemeMode; label: string; icon: typeof Moon }> = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 items-center gap-2 border border-hairline bg-surface px-2 pr-3"
      >
        <Avatar name={profile.name} src={profile.avatarDataUrl} />
        <span className="hidden text-left sm:block">
          <span className="block max-w-[9rem] truncate text-xs text-strong">{profile.name}</span>
          <span className="block font-mono text-[10px] text-muted">Local session</span>
        </span>
        <ChevronDown size={14} className="text-muted" />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-[60] mt-2 w-[18.5rem] origin-top-right border border-hairline bg-bg-elevated p-2 shadow-[var(--echo-shadow)]"
          >
            <div className="flex gap-3 border-b border-hairline px-2 py-3">
              <Avatar name={profile.name} src={profile.avatarDataUrl} large />
              <div className="min-w-0">
                <p className="truncate text-sm text-strong">{profile.name}</p>
                <p className="truncate text-xs text-muted">{profile.email}</p>
                <p className="mt-1 font-mono text-[10px] tracking-[0.12em] text-signal uppercase">
                  {session?.roleLabel ?? 'No backend role'}
                </p>
              </div>
            </div>
            <MenuItem
              onSelect={() => {
                navigate('/admin/profile')
                setOpen(false)
              }}
              icon={<UserRound size={15} />}
            >
              Profile
            </MenuItem>
            <Link to="/admin/settings" role="menuitem" className="flex min-h-11 items-center px-3 text-sm hover:bg-surface-2" onClick={() => setOpen(false)}>
              Settings
            </Link>
            <div className="px-3 py-2">
              <p className="mb-2 font-mono text-[10px] tracking-[0.16em] text-muted uppercase">Appearance</p>
              <div className="grid grid-cols-3 gap-1">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setMode(theme.id)}
                    className={`flex min-h-11 flex-col items-center justify-center gap-1 border text-[10px] tracking-[0.12em] uppercase ${
                      mode === theme.id ? 'border-signal text-strong' : 'border-hairline text-muted'
                    }`}
                  >
                    <theme.icon size={14} />
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>
            <Link to="/admin/settings" role="menuitem" className="flex min-h-11 items-center px-3 text-sm text-muted hover:bg-surface-2" onClick={() => setOpen(false)}>
              Security
            </Link>
            <div className="my-1 h-px bg-hairline" />
            <MenuItem
              onSelect={() => {
                signOut()
                setOpen(false)
                navigate('/admin')
              }}
              icon={<LogOut size={15} />}
            >
              Sign out
            </MenuItem>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function MenuItem({
  children,
  onSelect,
  icon,
}: {
  children: string
  onSelect: () => void
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className="flex min-h-11 w-full items-center gap-2 px-3 text-left text-sm hover:bg-surface-2"
    >
      <span className="text-muted">{icon}</span>
      {children}
    </button>
  )
}

export function Avatar({
  name,
  src,
  large = false,
}: {
  name: string
  src: string | null
  large?: boolean
}) {
  const size = large ? 'h-11 w-11' : 'h-8 w-8'
  if (src) {
    return <img src={src} alt="" className={`${size} object-cover`} />
  }
  return (
    <span className={`inline-flex ${size} items-center justify-center bg-surface-3 font-mono text-[10px] text-signal`}>
      {initials(name) || 'EA'}
    </span>
  )
}
