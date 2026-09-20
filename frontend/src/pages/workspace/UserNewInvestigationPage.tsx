import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Terminal, ArrowLeft, ArrowRight, Play, AlertCircle, CheckCircle2 } from 'lucide-react'
import { listEntities } from '@/api/entities'
import { triggerInvestigation } from '@/api/investigations'

export function UserNewInvestigationPage() {
  const [searchParams] = useSearchParams()
  const preselected = searchParams.get('entityId') || ''
  const navigate = useNavigate()

  const [entityId, setEntityId] = useState(preselected)
  const [loading, setLoading] = useState(false)
  const [startedRunId, setStartedRunId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: entitiesData, isLoading: entitiesLoading } = useQuery({
    queryKey: ['user-new-inv-entities'],
    queryFn: () => listEntities({ limit: 100 }),
  })

  const entities = entitiesData?.properties || entitiesData?.items || []

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entityId) {
      setError('Please select or specify a target Entity ID.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const run = await triggerInvestigation({
        entity_id: entityId,
        property_id: entityId,
        workflow: 'FULL_ANALYSIS',
      })
      setStartedRunId(run.run_id)
      setTimeout(() => {
        navigate(`/app/investigations/${run.run_id}`)
      }, 1000)
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch investigation pipeline.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/app/investigations"
          className="text-xs font-mono text-muted hover:text-strong transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={13} />
          <span>Back to Investigations</span>
        </Link>
      </div>

      <div className="border border-hairline bg-surface p-7 sm:p-9 space-y-6 shadow-xl">
        <div className="border-b border-hairline pb-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-signal font-semibold">
            Orchestration Dispatch
          </span>
          <h1 className="text-xl sm:text-2xl font-display font-medium text-strong mt-1">
            START INVESTIGATION
          </h1>
          <p className="text-xs text-muted mt-1">
            Activate the 11-agent pipeline to audit corporate disclosures and calculate scenario risk.
          </p>
        </div>

        {error && (
          <div className="border border-loss/40 bg-loss/10 p-3 text-xs text-loss flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {startedRunId && (
          <div className="border border-gain/40 bg-gain/10 p-4 space-y-1 font-mono text-xs">
            <div className="flex items-center gap-2 text-gain font-semibold">
              <CheckCircle2 size={15} />
              <span>Investigation started.</span>
            </div>
            <p className="text-muted">
              Run ID: <strong className="text-strong">{startedRunId}</strong>
            </p>
            <p className="text-muted text-[11px]">Redirecting to pipeline tracking...</p>
          </div>
        )}

        <form onSubmit={handleStart} className="space-y-5 font-mono text-xs">
          <div className="space-y-2">
            <label className="block uppercase text-muted text-[11px] tracking-wider font-semibold">
              Entity ID
            </label>

            {/* Entity Select / Input */}
            <select
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              required
              className="min-h-11 w-full border border-hairline bg-bg px-3 text-ink focus:border-signal focus:outline-none"
            >
              <option value="">-- Select or choose an entity --</option>
              {entities.map((e) => (
                <option key={e.property_id} value={e.property_id}>
                  {e.property_id} &mdash; {e.canonical_name} ({e.sector || 'Unassigned'})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(startedRunId)}
            className="min-h-11 w-full border border-signal bg-signal/15 px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-widest text-strong hover:bg-signal/25 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Play size={13} className="text-signal" />
            <span>{loading ? 'Starting Investigation...' : 'Start Investigation'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}
