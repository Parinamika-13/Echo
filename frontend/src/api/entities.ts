import { apiFetch, toQuery } from './client'
import type {
  AnalysisRecord,
  AuditTrailRecord,
  EntitySummary,
  EvidenceRecord,
  Paginated,
  RiskAssessment,
  SourceRecord,
} from './types'

export function listEntities(params?: {
  limit?: number
  offset?: number
  sector?: string
  region?: string
  entity_type?: string
  search?: string
}) {
  return apiFetch<Paginated<EntitySummary>>(
    `/properties${toQuery({
      limit: params?.limit,
      offset: params?.offset,
      sector: params?.sector,
      region: params?.region,
      entity_type: params?.entity_type,
      search: params?.search,
    })}`,
  )
}

export function getEntity(propertyId: string) {
  return apiFetch<EntitySummary>(`/properties/${encodeURIComponent(propertyId)}`)
}

export function getEntityAuditTrail(propertyId: string) {
  return apiFetch<AuditTrailRecord[]>(`/properties/${encodeURIComponent(propertyId)}/audit-trail`)
}

export function listEntityEvidence(propertyId: string, params?: { limit?: number; offset?: number }) {
  return apiFetch<Paginated<EvidenceRecord>>(
    `/properties/${encodeURIComponent(propertyId)}/evidence${toQuery({
      limit: params?.limit,
      offset: params?.offset,
    })}`,
  )
}

export function listEntitySources(propertyId: string, params?: { limit?: number; offset?: number }) {
  return apiFetch<Paginated<SourceRecord>>(
    `/properties/${encodeURIComponent(propertyId)}/sources${toQuery({
      limit: params?.limit,
      offset: params?.offset,
    })}`,
  )
}

export function getRiskAssessment(propertyId: string) {
  return apiFetch<RiskAssessment>(`/risk-assessments/${encodeURIComponent(propertyId)}`)
}

export function listRiskAssessments(params?: {
  limit?: number
  offset?: number
  rating?: string
}) {
  return apiFetch<Paginated<RiskAssessment>>(
    `/risk-assessments${toQuery({
      limit: params?.limit,
      offset: params?.offset,
      rating: params?.rating,
    })}`,
  )
}

export function getAnalysis(propertyId: string) {
  return apiFetch<AnalysisRecord>(`/analyses/${encodeURIComponent(propertyId)}`)
}

export function listAnalyses(params?: {
  limit?: number
  offset?: number
  entity_id?: string
}) {
  return apiFetch<Paginated<AnalysisRecord>>(
    `/analyses${toQuery({
      limit: params?.limit,
      offset: params?.offset,
      entity_id: params?.entity_id,
    })}`,
  )
}

