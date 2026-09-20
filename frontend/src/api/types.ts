export type HealthResponse = {
  status: string
  service: string
  database?: string
  database_connected?: boolean
  version?: string
  environment?: string
}

export type AgentMetadata = {
  agent_id: string
  name: string
  version: string
  description: string
  capabilities: string[]
  status: string
}

export type DatasetSheetSummary = {
  rows: number
  columns: number
  column_names: string[]
  missing_values: number
}

export type DatasetInspectResponse = {
  file_path: string
  sheets: string[]
  summaries: Record<string, DatasetSheetSummary>
}

export type DatasetIngestRequest = {
  file_path?: string | null
  limit?: number | null
}

export type DatasetIngestResponse = {
  status: string
  total_rows_processed: number
  inserted_properties: number
  inserted_sources: number
  inserted_documents: number
  inserted_evidence: number
  inserted_signals: number
  inserted_analyses: number
  inserted_risks: number
  inserted_investigations: number
  errors: string[]
  duration_ms: number
}

export type EntityAttributes = Record<string, unknown>

export type EntitySummary = {
  property_id: string
  canonical_name: string
  entity_type: string
  company: string | null
  sector: string | null
  region: string | null
  property_type: string | null
  developer: string | null
  city: string | null
  locality: string | null
  price: number | null
  confidence: number | null
  version: number
  attributes: EntityAttributes
  created_at: string | null
  updated_at: string | null
}

export type Paginated<T> = {
  total: number
  limit: number
  offset: number
  items: T[]
}

export type SignalRecord = {
  signal_id: string
  signal_type: string
  entity_id: string
  severity: string
  importance: number
  description: string
  source_reference: string | null
  evidence_reference: string | null
  confidence: number | null
  status: string
  timestamp: string | null
  metadata: Record<string, unknown>
}

export type RiskAssessment = {
  assessment_id: string
  entity_id: string
  overall_rating: string
  overall_confidence: number | null
  status: string
  factors_payload: unknown[]
  primary_concerns: string[]
  created_at: string | null
}

export type AnalysisRecord = {
  analysis_id: string
  entity_id: string
  status: string
  confidence: number | null
  metrics_payload: Record<string, unknown>
  created_at: string | null
}

export type EvidenceRecord = {
  evidence_id: string
  property_id: string
  document_id: string
  quote: string
  relevance_score: number | null
  confidence: number | null
  supporting: boolean
  snippet_start?: number | null
  snippet_end?: number | null
  extraction_timestamp?: string | null
}

export type SourceRecord = {
  source_id: string
  source_name: string
  source_type: string
  source_url: string | null
  content_type: string | null
  raw_reference: string | null
  collection_status: string
  retrieved_at: string | null
  metadata?: Record<string, unknown>
}

export type AuditTrailRecord = {
  record_id: string
  entity_id: string
  record_version: number
  payload_type: string
  agent_id: string
  run_id: string
  confidence: number | null
  payload: Record<string, unknown>
  created_at: string | null
}

export type AgentResult = {
  success: boolean
  status: string
  agent_id: string
  agent_version: string
  run_id: string
  timestamp: string
  duration_ms: number
  data?: Record<string, unknown> | null
  confidence?: number | null
  evidence: unknown[]
  warnings: string[]
  errors: string[]
  metadata: Record<string, unknown>
}

export type InvestigationResult = {
  run_id: string
  workflow: string
  status: string
  created_at: string
  completed_at: string | null
  duration_ms: number | null
  executed_agents: string[]
  agent_results: Record<string, AgentResult>
  summary: Record<string, unknown>
  warnings: string[]
  errors: string[]
}

export function attrString(attributes: EntityAttributes, key: string) {
  const value = attributes[key]
  if (value == null) return null
  return String(value)
}

export function attrNumber(attributes: EntityAttributes, key: string) {
  const value = attributes[key]
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value)
  }
  return null
}
