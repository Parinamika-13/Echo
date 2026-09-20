import { apiFetch, toQuery } from './client'
import type { Paginated, SignalRecord } from './types'

export function listSignals(params?: {
  limit?: number
  offset?: number
  entity_id?: string
  signal_type?: string
  search?: string
}) {
  return apiFetch<Paginated<SignalRecord>>(
    `/signals${toQuery({
      limit: params?.limit,
      offset: params?.offset,
      entity_id: params?.entity_id,
      signal_type: params?.signal_type,
      search: params?.search,
    })}`,
  )
}

export function getSignal(signalId: string): Promise<SignalRecord> {
  return apiFetch<SignalRecord>(`/signals/${encodeURIComponent(signalId)}`)
}

