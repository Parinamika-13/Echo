export const THEME_STORAGE_KEY = 'echo.theme'
export const SESSION_STORAGE_KEY = 'echo.admin.session'
export const PROFILE_STORAGE_KEY = 'echo.admin.profile'
export const AUTH_USER_STORAGE_KEY = 'echo.auth.user'
export const AUTH_TOKEN_STORAGE_KEY = 'echo.auth.token'
export const WATCHLIST_STORAGE_KEY = 'echo.user.watchlist'
export const LAST_INGEST_KEY = 'echo.lastIngest'
export const SESSION_RUNS_KEY = 'echo.sessionRuns'

export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const INTELLIGENCE_NODES = [
  {
    id: 'SOURCE',
    label: 'Source',
    href: '/admin/datasets',
    copy: 'Registered disclosure sources and collection status.',
    tone: 'analysis',
  },
  {
    id: 'DOCUMENT',
    label: 'Document',
    href: '/admin/datasets',
    copy: 'Normalized filings and disclosure documents.',
    tone: 'analysis',
  },
  {
    id: 'EVIDENCE',
    label: 'Evidence',
    href: '/admin/investigations',
    copy: 'Atomic facts linked to source and document identifiers.',
    tone: 'evidence',
  },
  {
    id: 'SIGNAL',
    label: 'Signal',
    href: '/admin/investigations',
    copy: 'Minted intelligence events: silence, gap, contradiction, and related types.',
    tone: 'signal',
  },
  {
    id: 'RISK',
    label: 'Risk',
    href: '/admin/investigations',
    copy: 'Exposure probability, materiality, and concern factors.',
    tone: 'risk',
  },
  {
    id: 'ANALYSIS',
    label: 'Analysis',
    href: '/admin/investigations',
    copy: 'Structured financial intelligence metrics for the entity.',
    tone: 'analysis',
  },
] as const

export const AGENT_FLOW = [
  'ECHO-ORCH',
  'ECHO-PSA-SOURCE',
  'ECHO-PSA-DOC',
  'ECHO-PSA-EXTRACT',
  'ECHO-PSA-ENTITY',
  'ECHO-SIGNAL',
  'ECHO-ERA',
  'ECHO-ISDAA',
  'ECHO-SVEA',
  'ECHO-RSA',
  'ECHO-SSR',
] as const

export const AGENT_EDGES: Array<[string, string]> = [
  ['ECHO-ORCH', 'ECHO-PSA-SOURCE'],
  ['ECHO-PSA-SOURCE', 'ECHO-PSA-DOC'],
  ['ECHO-PSA-DOC', 'ECHO-PSA-EXTRACT'],
  ['ECHO-PSA-EXTRACT', 'ECHO-PSA-ENTITY'],
  ['ECHO-PSA-ENTITY', 'ECHO-SIGNAL'],
  ['ECHO-SIGNAL', 'ECHO-ERA'],
  ['ECHO-SIGNAL', 'ECHO-ISDAA'],
  ['ECHO-ERA', 'ECHO-SVEA'],
  ['ECHO-ISDAA', 'ECHO-SVEA'],
  ['ECHO-SVEA', 'ECHO-RSA'],
  ['ECHO-RSA', 'ECHO-SSR'],
]
