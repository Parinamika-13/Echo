import { apiFetch } from './client'
import type { DatasetIngestRequest, DatasetIngestResponse, DatasetInspectResponse } from './types'

export function inspectDataset(filePath?: string) {
  const qs = filePath ? `?file_path=${encodeURIComponent(filePath)}` : ''
  return apiFetch<DatasetInspectResponse>(`/datasets/inspect${qs}`)
}

export function ingestDataset(body: DatasetIngestRequest = {}) {
  return apiFetch<DatasetIngestResponse>('/datasets/ingest', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
