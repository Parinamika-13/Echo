export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

export function parseDetail(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return 'Request failed'
  const detail = (payload as { detail?: unknown }).detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item === 'object' && item && 'msg' in item ? String((item as { msg: string }).msg) : String(item)))
      .join('; ')
  }
  return 'Request failed'
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let base = import.meta.env.VITE_API_BASE_URL || '/api/v1'
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    base.startsWith('http://') &&
    !base.includes('localhost') &&
    !base.includes('127.0.0.1')
  ) {
    base = base.replace('http://', 'https://')
  }
  const url = path.startsWith('http') ? path : `${base}${path}`
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 60_000)


  const token = typeof window !== 'undefined' ? localStorage.getItem('echo.auth.token') : null
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {}

  try {
    const response = await fetch(url, {
      ...init,
      signal: init?.signal ?? controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...authHeader,
        ...init?.headers,
      },
    })

    const text = await response.text()
    const json = text ? (JSON.parse(text) as unknown) : null

    if (!response.ok) {
      throw new ApiError(response.status, parseDetail(json) || response.statusText)
    }

    return json as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(0, 'The request timed out or was cancelled.')
    }
    throw new ApiError(0, error instanceof Error ? error.message : 'Network error')
  } finally {
    window.clearTimeout(timeout)
  }
}

export function toQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    search.set(key, String(value))
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}
