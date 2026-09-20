import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  Building2,
  Database,
  Fingerprint,
  LayoutDashboard,
  Radio,
  Search,
  Settings,
  ShieldAlert,
  UserRound,
  Users,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { to: '/admin/entities', label: 'Entities', icon: Building2 },
      { to: '/admin/signals', label: 'Signals', icon: Radio },
      { to: '/admin/risk', label: 'Risk', icon: AlertTriangle },
      { to: '/admin/analysis', label: 'Analysis', icon: BarChart3 },
    ],
  },
  {
    title: 'INVESTIGATIONS',
    items: [
      { to: '/admin/investigations', label: 'Investigations', icon: Search },
    ],
  },
  {
    title: 'PIPELINE',
    items: [
      { to: '/admin/agents', label: 'Agents', icon: Bot },
      { to: '/admin/datasets', label: 'Datasets', icon: Database },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { to: '/admin/system', label: 'System', icon: Activity },
      { to: '/admin/audit', label: 'Audit', icon: Fingerprint },
      { to: '/admin/users', label: 'Users', icon: Users },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { to: '/admin/profile', label: 'Profile', icon: UserRound },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export const ALL_NAV_ITEMS: NavItem[] = ADMIN_NAV_SECTIONS.flatMap((sec) => sec.items)

