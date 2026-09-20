import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const ROUTE_LABELS: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  entities: 'Entities',
  investigations: 'Investigations',
  new: 'New Investigation',
  signals: 'Signals',
  risk: 'Risk',
  analysis: 'Analysis',
  agents: 'Agents',
  datasets: 'Datasets',
  users: 'Users',
  audit: 'Audit',
  system: 'System',
  profile: 'Profile',
  settings: 'Settings',
}

export function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(Boolean)

  if (pathnames.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-xs text-muted">
      <span className="tracking-[0.16em] uppercase">ECHO</span>
      {pathnames.map((segment, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const label = ROUTE_LABELS[segment] || segment

        return (
          <span key={routeTo} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="text-faint" />
            {isLast ? (
              <span className="text-strong font-medium truncate max-w-[12rem] sm:max-w-xs">{label}</span>
            ) : (
              <Link to={routeTo} className="hover:text-signal transition-colors">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
