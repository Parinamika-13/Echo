import { apiFetch, toQuery } from './client'

export type AuditRecord = {
  record_id: string
  entity_id: string
  record_version: number
  payload_type: string
  agent_id: string
  agent_version: string
  run_id: string
  confidence?: number | null
  evidence_reference?: string | null
  payload: Record<string, any>
  created_at: string
  updated_at: string
}

export type AuditListResponse = {
  total: number
  limit: number
  offset: number
  items: AuditRecord[]
}

export function listAuditRecords(params?: {
  limit?: number
  offset?: number
  entity_id?: string
  run_id?: string
  agent_id?: string
  search?: string
}) {
  return apiFetch<AuditListResponse>(`/audit${toQuery(params || {})}`)
}
