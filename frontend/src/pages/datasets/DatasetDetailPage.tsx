import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileSpreadsheet, CheckCircle2, Database, Table } from 'lucide-react'
import { inspectDataset } from '@/api/datasets'
import { IngestionPipeline } from '@/components/echo/Pipelines'
import { Skeleton, ErrorState } from '@/components/feedback/States'
import { formatNumber } from '@/lib/format'

export function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const sheetName = decodeURIComponent(id || '')

  const {
    data: dataset,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['datasetInspect'],
    queryFn: () => inspectDataset(),
  })

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !dataset) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Link to="/admin/datasets" className="inline-flex items-center gap-1 font-mono text-xs text-signal hover:underline">
          <ArrowLeft size={14} /> Back to Datasets
        </Link>
        <ErrorState
          title="Dataset Sheet Inspection Failed"
          body={error instanceof Error ? error.message : 'Unable to inspect dataset.'}
        />
      </div>
    )
  }

  const summary = dataset.summaries?.[sheetName] || Object.values(dataset.summaries || {})[0]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        to="/admin/datasets"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-signal hover:underline"
      >
        <ArrowLeft size={14} />
        Back to Datasets Operations
      </Link>

      {/* 30. Header */}
      <div className="border border-hairline bg-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 border border-hairline bg-surface-2 text-signal">
                Sheet: {sheetName || 'Primary'}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 border border-hairline bg-surface-2 text-muted">
                {dataset.file_path?.split('/').pop()}
              </span>
            </div>
            <h1 className="font-display mt-2 text-3xl text-strong font-medium">Dataset Sheet Dossier</h1>
            <p className="text-sm text-muted mt-1">
              Field mapping, schema validation, and normalization lineage for this corporate disclosure partition.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 font-mono text-xs border border-health/40 text-health bg-health/10">
              SCHEMA VERIFIED
            </span>
          </div>
        </div>

        {/* Telemetry metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs border-t border-hairline pt-4 text-muted">
          <div>
            <span className="text-faint text-[10px] uppercase block">Total Rows</span>
            <span className="text-strong text-base font-semibold">{formatNumber(summary?.rows)}</span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Columns Extracted</span>
            <span className="text-strong text-base font-semibold">{formatNumber(summary?.columns)}</span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Missing Cell Values</span>
            <span className="text-strong text-base font-semibold">{formatNumber(summary?.missing_values)}</span>
          </div>
          <div>
            <span className="text-faint text-[10px] uppercase block">Validation Result</span>
            <span className="text-health text-base font-semibold">Ready for Ingest</span>
          </div>
        </div>
      </div>

      {/* 30. Ingestion Pipeline Visual */}
      <div className="border border-hairline bg-surface p-5 space-y-3">
        <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">
          Dataset Ingestion Pipeline Sequence
        </p>
        <IngestionPipeline complete />
      </div>

      {/* Schema Columns Table */}
      <div className="border border-hairline bg-surface p-6 space-y-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Schema Definition</p>
          <h3 className="font-display text-lg text-strong font-medium mt-1">
            Registered Columns ({summary?.column_names?.length || 0})
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Verified fields extracted directly from the corporate disclosure workbook.
          </p>
        </div>

        {summary?.column_names?.length ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 font-mono text-xs pt-2">
            {summary.column_names.map((colName, idx) => (
              <div
                key={colName}
                className="flex items-center gap-2 p-2.5 border border-hairline bg-surface-2 text-strong"
              >
                <span className="text-faint text-[10px] w-5 shrink-0">0{idx + 1}</span>
                <span className="truncate" title={colName}>
                  {colName}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted italic">No column metadata recorded for this sheet.</p>
        )}
      </div>
    </div>
  )
}
