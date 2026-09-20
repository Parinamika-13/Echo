import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Search, Loader2, Sparkles, Building2 } from 'lucide-react'
import { listEntities } from '@/api/entities'
import { createInvestigation, saveSessionInvestigation } from '@/api/investigations'
import { useToast } from '@/context/ToastContext'

export function NewInvestigationPage() {
  const [searchParams] = useSearchParams()
  const initialEntity = searchParams.get('entity') || ''

  const [selectedEntityId, setSelectedEntityId] = useState(initialEntity)
  const [workflow, setWorkflow] = useState<'FULL_ANALYSIS' | 'SIGNAL_ANALYSIS' | 'RISK_ANALYSIS' | 'PROPERTY_ANALYSIS'>('FULL_ANALYSIS')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const navigate = useNavigate()
  const toast = useToast()

  const { data: entitiesData, isLoading: loadingEntities } = useQuery({
    queryKey: ['investigationEntitiesList'],
    queryFn: () => listEntities({ limit: 100 }),
  })

  useEffect(() => {
    if (initialEntity) {
      setSelectedEntityId(initialEntity)
    }
  }, [initialEntity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const payload = {
        property_id: selectedEntityId || undefined,
        workflow: workflow,
        request_type: 'PROPERTY_ANALYSIS',
        metadata: {
          notes: notes || undefined,
          triggered_by: 'Administrator (Command Center)',
        },
      }

      const res = await createInvestigation(payload)
      saveSessionInvestigation(res)

      toast.push({
        title: 'Investigation Launched',
        body: `Run ID ${res.run_id} initiated across ${res.executed_agents?.length || 0} agents.`,
      })

      navigate(`/admin/investigations/${res.run_id}`)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to launch investigation pipeline.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Link
        to="/admin/investigations"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-signal hover:underline"
      >
        <ArrowLeft size={14} />
        Back to Investigations
      </Link>

      <div className="border-b border-hairline pb-4">
        <p className="font-mono text-[11px] tracking-[0.28em] text-signal uppercase">Multi-Agent Pipeline</p>
        <h1 className="font-display mt-1 text-3xl sm:text-4xl text-strong font-medium">
          Start Intelligence Investigation
        </h1>
        <p className="mt-1 text-sm text-muted">
          Orchestrate autonomous intelligence agents across document extraction, signal discovery, scenario valuation, and risk synthesis.
        </p>
      </div>

      {errorMessage && (
        <div className="border border-risk/40 bg-risk/10 p-4 font-mono text-xs text-risk">
          <p className="font-semibold uppercase tracking-wider mb-1">Execution Failure</p>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="border border-hairline bg-surface p-6 space-y-6">
        {/* Entity Selector */}
        <div className="space-y-2">
          <label className="block font-mono text-xs uppercase tracking-wider text-strong">
            Target Corporate Entity <span className="text-signal">*</span>
          </label>
          <p className="text-xs text-muted">
            Select an investigated entity from the canonical database, or leave blank to run portfolio discovery.
          </p>
          {loadingEntities ? (
            <div className="flex items-center gap-2 font-mono text-xs text-muted py-2">
              <Loader2 size={14} className="animate-spin text-signal" /> Loading entity catalogue...
            </div>
          ) : (
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="w-full border border-hairline bg-bg p-3 text-xs font-mono text-strong outline-none"
            >
              <option value="">-- Portfolio Discovery (General Run) --</option>
              {entitiesData?.items.map((ent) => (
                <option key={ent.property_id} value={ent.property_id}>
                  {ent.canonical_name} ({ent.property_id}) &bull; {ent.sector || 'General'}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Workflow Configuration */}
        <div className="space-y-2">
          <label className="block font-mono text-xs uppercase tracking-wider text-strong">
            Pipeline Workflow <span className="text-signal">*</span>
          </label>
          <p className="text-xs text-muted">
            Define which agent tier should execute during this coordinated investigation.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            {[
              {
                id: 'FULL_ANALYSIS',
                label: 'Full Analysis (All 11 Agents)',
                desc: 'Runs Source Discovery through Document Extraction, Signal Analysis, SVEA, RSA, and SSR.',
              },
              {
                id: 'SIGNAL_ANALYSIS',
                label: 'Signal & Contradiction Analysis',
                desc: 'Specialized run focusing on disclosure gaps, silences, and cross-source contradictions.',
              },
              {
                id: 'RISK_ANALYSIS',
                label: 'Risk & Exposure Synthesis',
                desc: 'Compiles multi-source risk factors, confidence penalties, and executive concerns.',
              },
              {
                id: 'PROPERTY_ANALYSIS',
                label: 'Canonical Entity Valuation',
                desc: 'Focuses on financial metrics, attributes, and valuation confidence adjustments.',
              },
            ].map((wf) => (
              <label
                key={wf.id}
                className={`p-4 border cursor-pointer transition-colors block ${
                  workflow === wf.id
                    ? 'border-signal bg-surface-2'
                    : 'border-hairline bg-bg hover:border-hairline/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="workflow"
                    value={wf.id}
                    checked={workflow === wf.id}
                    onChange={() => setWorkflow(wf.id as any)}
                    className="accent-signal"
                  />
                  <span className="font-mono text-xs font-semibold text-strong">{wf.label}</span>
                </div>
                <p className="mt-2 text-xs text-muted pl-5">{wf.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="block font-mono text-xs uppercase tracking-wider text-strong">
            Investigation Rationale (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Document scope, investigative hypothesis, or audit notes..."
            className="w-full border border-hairline bg-bg p-3 text-xs text-strong outline-none placeholder:text-muted"
          />
        </div>

        {/* Submit */}
        <div className="border-t border-hairline pt-4 flex items-center justify-between">
          <Link
            to="/admin/investigations"
            className="font-mono text-xs text-muted hover:text-strong uppercase tracking-wider"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex min-h-11 items-center gap-2 border border-signal bg-surface px-6 py-2 font-mono text-xs uppercase tracking-wider text-strong hover:bg-surface-2 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin text-signal" />
                Executing Pipeline...
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-signal" />
                Run Investigation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
