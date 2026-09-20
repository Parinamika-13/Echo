import { apiFetch, toQuery } from './client'
import type { InvestigationResult, Paginated } from './types'
import { SESSION_RUNS_KEY } from '@/lib/constants'

export function listInvestigations(params?: {
  limit?: number
  offset?: number
  status?: string
  priority?: string
  entity_id?: string
  search?: string
}) {
  return apiFetch<Paginated<InvestigationResult>>(
    `/investigations${toQuery({
      limit: params?.limit,
      offset: params?.offset,
      status: params?.status,
      priority: params?.priority,
      entity_id: params?.entity_id,
      search: params?.search,
    })}`,
  )
}


export function createInvestigation(payload: Record<string, unknown>) {
  return apiFetch<InvestigationResult>('/investigations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const triggerInvestigation = createInvestigation

export function getInvestigationRun(runId: string) {
  return apiFetch<InvestigationResult>(`/investigations/${encodeURIComponent(runId)}`)
}

export const getInvestigation = getInvestigationRun

export function listSessionInvestigations(): InvestigationResult[] {
  try {
    const raw = localStorage.getItem(SESSION_RUNS_KEY)
    return raw ? (JSON.parse(raw) as InvestigationResult[]) : []
  } catch {
    return []
  }
}

export function saveSessionInvestigation(run: InvestigationResult) {
  try {
    const existing = listSessionInvestigations().filter((item) => item.run_id !== run.run_id)
    const updated = [run, ...existing].slice(0, 50)
    localStorage.setItem(SESSION_RUNS_KEY, JSON.stringify(updated))
  } catch {
    // Ignore localStorage write failures
  }
}

export function getStoredInvestigation(runId: string): InvestigationResult | null {
  const all = listSessionInvestigations()
  return all.find((item) => item.run_id === runId) || null
}
