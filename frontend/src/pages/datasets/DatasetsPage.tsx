import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Database, RotateCw, FileSpreadsheet, CheckCircle2, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { inspectDataset, ingestDataset } from '@/api/datasets'
import { IngestionPipeline } from '@/components/echo/Pipelines'
import { Skeleton, ErrorState } from '@/components/feedback/States'
import { useToast } from '@/context/ToastContext'
import { formatNumber } from '@/lib/format'

export function DatasetsPage() {
  const [isIngesting, setIsIngesting] = useState(false)
  const toast = useToast()

  const { data: dataset, isLoading, error, refetch } = useQuery({
    queryKey: ['datasetInspect'],
    queryFn: () => inspectDataset(),
  })

  const handleIngest = async () => {
    setIsIngesting(true)
    try {
      const res = await ingestDataset()
      toast.push({
        title: 'Dataset Ingested',
        body: `Processed ${res.total_rows_processed} rows into ${res.inserted_properties} entities and ${res.inserted_signals} signals.`,
      })
      refetch()
    } catch (err) {
      toast.push({
        title: 'Ingestion Error',
        body: err instanceof Error ? err.message : 'Dataset ingestion failed.',
      })
    } finally {
      setIsIngesting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 29. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-hairline pb-5 gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-[0.28em] text-signal uppercase">Data Operations</p>
          <h1 className="font-display mt-1 text-3xl sm:text-4xl text-strong font-medium">
            Disclosure Datasets
          </h1>
          <p className="mt-1 text-sm text-muted">
            Inspect and ingest corporate disclosure intelligence workbooks, schema validation, and normalization pipelines.
          </p>
        </div>

        <button
          type="button"
          onClick={handleIngest}
          disabled={isIngesting}
          className="flex min-h-11 items-center gap-2 border border-signal bg-surface px-4 py-2 font-mono text-xs uppercase tracking-wider text-strong hover:bg-surface-2 disabled:opacity-50 transition-colors self-start sm:self-auto"
        >
          {isIngesting ? (
            <>
              <Loader2 size={14} className="animate-spin text-signal" />
              Ingesting Rows...
            </>
          ) : (
            <>
              <Sparkles size={14} className="text-signal" />
              Ingest Dataset
            </>
          )}
        </button>
      </div>

      {/* API Ingestion Notice */}
      <div className="border border-hairline bg-surface p-3 font-mono text-xs text-muted">
        <strong className="text-signal uppercase tracking-wider">Dataset Scope:</strong> Ingestion operates against the canonical server dataset (<code className="text-strong">echo_synthetic_dataset.xlsx</code>). Direct browser file upload and external dataset import are <span className="text-signal">not available through the current API</span>.
      </div>

      {/* Ingestion Pipeline Visualization */}
      <section className="space-y-3">
        <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Operational Ingestion Pipeline</p>
        <IngestionPipeline complete />
      </section>

      {/* Dataset Inspection Overview */}
      {error ? (
        <ErrorState
          title="Unable to inspect dataset"
          body={error instanceof Error ? error.message : 'Failed to inspect dataset workbook.'}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !dataset ? null : (
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="border border-hairline bg-surface p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-hairline pb-3">
              <div>
                <p className="font-mono text-xs text-signal font-semibold">
                  {dataset.file_path?.split('/').pop() || 'echo_synthetic_dataset.xlsx'}
                </p>
                <p className="font-mono text-[10px] text-muted truncate mt-0.5">{dataset.file_path}</p>
              </div>
              <span className="px-2 py-0.5 border border-health/40 text-health bg-health/10 font-mono text-[10px]">
                VALIDATED & READY
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs text-muted">
              <div>
                <span className="text-faint text-[10px] uppercase block">Workbook Sheets</span>
                <span className="text-strong text-base font-semibold">{dataset.sheets?.length || 0}</span>
              </div>
              <div>
                <span className="text-faint text-[10px] uppercase block">Primary Rows</span>
                <span className="text-strong text-base font-semibold">
                  {dataset.summaries ? formatNumber(Object.values(dataset.summaries)[0]?.rows) : '—'}
                </span>
              </div>
              <div>
                <span className="text-faint text-[10px] uppercase block">Primary Columns</span>
                <span className="text-strong text-base font-semibold">
                  {dataset.summaries ? formatNumber(Object.values(dataset.summaries)[0]?.columns) : '—'}
                </span>
              </div>
              <div>
                <span className="text-faint text-[10px] uppercase block">Validation</span>
                <span className="text-health text-base font-semibold">Conforming</span>
              </div>
            </div>
          </div>

          {/* Sheets Table */}
          <div className="space-y-3">
            <p className="font-mono text-[10px] tracking-[0.2em] text-signal uppercase">Registered Workbook Sheets</p>
            <div className="overflow-x-auto border border-hairline bg-surface">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-surface-2 border-b border-hairline text-muted uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Sheet Name</th>
                    <th className="p-3">Rows</th>
                    <th className="p-3">Columns</th>
                    <th className="p-3">Missing Values</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {dataset.sheets?.map((sheet) => {
                    const summary = dataset.summaries?.[sheet]
                    return (
                      <tr key={sheet} className="hover:bg-surface-2/40">
                        <td className="p-3 font-medium text-strong flex items-center gap-2">
                          <FileSpreadsheet size={14} className="text-signal" />
                          <Link to={`/admin/datasets/${encodeURIComponent(sheet)}`} className="hover:text-signal">
                            {sheet}
                          </Link>
                        </td>
                        <td className="p-3 text-muted">{summary ? formatNumber(summary.rows) : '—'}</td>
                        <td className="p-3 text-muted">{summary ? formatNumber(summary.columns) : '—'}</td>
                        <td className="p-3 text-muted">{summary ? formatNumber(summary.missing_values) : '—'}</td>
                        <td className="p-3 text-right">
                          <Link
                            to={`/admin/datasets/${encodeURIComponent(sheet)}`}
                            className="inline-flex min-h-11 items-center gap-1 border border-hairline px-2.5 py-1 text-signal hover:border-signal"
                          >
                            <span>Inspect Sheet</span>
                            <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
