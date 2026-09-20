import { Link } from 'react-router-dom'
import { ArrowRight, Bot, ShieldCheck, Radio, BarChart3, Database, ChevronRight, Terminal, Sparkles } from 'lucide-react'
import { EchoMark } from '@/components/layout/EchoMark'
import { IngestionPipeline } from '@/components/echo/Pipelines'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="border-b border-hairline bg-surface/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <EchoMark className="text-signal" />
          <span className="font-display font-medium text-strong text-xl">ECHO</span>
          <span className="font-mono text-[10px] text-muted tracking-widest uppercase hidden md:inline">
            Financial Intelligence
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-xs font-mono text-muted">
          <a href="#provenance" className="hover:text-strong transition-colors">
            Provenance
          </a>
          <a href="#agents" className="hover:text-strong transition-colors">
            Agents
          </a>
          <Link to="/privacy" className="hover:text-strong transition-colors">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-strong transition-colors">
            Terms
          </Link>
        </nav>

        {/* Auth & CTA in header */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <Link
            to="/login"
            className="text-muted hover:text-strong transition-colors px-2 py-1"
          >
            Sign In
          </Link>
          <Link
            to="/app/dashboard"
            className="flex min-h-10 items-center gap-2 border border-signal bg-signal/15 px-3.5 py-1.5 uppercase tracking-wider text-strong hover:bg-signal/25 transition-colors font-semibold"
          >
            <span>Launch Workspace</span>
            <ArrowRight size={13} className="text-signal" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-hairline py-20 md:py-28 px-6">
          <div className="echo-grid-bg pointer-events-none absolute inset-0 opacity-30" />
          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-hairline bg-surface font-mono text-xs text-signal">
              <span className="h-2 w-2 rounded-full bg-signal animate-pulse" />
              <span>Multi-Agent Disclosure Intelligence Network</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-medium text-strong tracking-tight leading-tight">
              Autonomous Corporate Intelligence &amp; Risk Provenance
            </h1>

            <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              ECHO transforms fragmented corporate disclosures and financial filings into structured, explainable, and traceable intelligence via coordinated multi-agent pipelines.
            </p>

            {/* WHAT ARE YOU? Portal Gateway */}
            <div className="pt-6 max-w-xl mx-auto">
              <div className="border border-hairline bg-surface p-5 text-left space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-hairline pb-2.5">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-signal font-semibold">
                    Portal Access Gateway
                  </span>
                  <span className="font-mono text-[10px] text-muted uppercase">What are you?</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono text-xs">
                  <Link
                    to="/login?context=user"
                    className="p-3.5 border border-signal/40 bg-signal/10 hover:bg-signal/20 transition-colors flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-strong uppercase tracking-wider text-xs">
                          Workspace User
                        </span>
                        <ArrowRight size={13} className="text-signal group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-[11px] text-muted font-sans mt-1 leading-normal">
                        Financial intelligence, entities, signals, risk models, and watchlists.
                      </p>
                    </div>
                    <span className="mt-3 text-[10px] font-mono text-signal uppercase tracking-wider font-semibold">
                      Enter as User &rarr;
                    </span>
                  </Link>

                  <Link
                    to="/login?context=admin"
                    className="p-3.5 border border-hairline bg-surface-2 hover:bg-surface-3 transition-colors flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-strong uppercase tracking-wider text-xs">
                          Command Center
                        </span>
                        <ArrowRight size={13} className="text-muted group-hover:text-signal group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-[11px] text-muted font-sans mt-1 leading-normal">
                        Multi-agent pipeline supervision, system telemetry, and datasets.
                      </p>
                    </div>
                    <span className="mt-3 text-[10px] font-mono text-muted group-hover:text-strong uppercase tracking-wider font-semibold">
                      Enter as Admin &rarr;
                    </span>
                  </Link>
                </div>

                <p className="text-[10px] font-mono text-muted text-center pt-1">
                  Role selection sets the portal context. Backend authorization strictly assigns access upon sign in.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Provenance Pipeline Showcase */}
        <section id="provenance" className="py-16 px-6 border-b border-hairline bg-surface-2/30">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <p className="font-mono text-xs text-signal tracking-[0.2em] uppercase">Deterministic Lineage</p>
              <h2 className="font-display text-3xl font-medium text-strong">
                Six-Stage Verifiable Provenance Chain
              </h2>
              <p className="text-sm text-muted max-w-xl mx-auto">
                Every conclusion, contradiction, and valuation is anchored to atomic evidence and immutable cryptographic audit records.
              </p>
            </div>

            <IngestionPipeline complete />

            <div className="grid sm:grid-cols-3 gap-4 pt-4 font-mono text-xs">
              <div className="border border-hairline bg-surface p-5 space-y-2">
                <Radio size={18} className="text-signal" />
                <h3 className="text-strong font-semibold text-sm font-sans">Signal Detection</h3>
                <p className="text-muted leading-relaxed font-sans text-xs">
                  Algorithms detect silences in filings, disclosure gaps, and direct numerical contradictions across sources.
                </p>
              </div>

              <div className="border border-hairline bg-surface p-5 space-y-2">
                <BarChart3 size={18} className="text-signal" />
                <h3 className="text-strong font-semibold text-sm font-sans">Scenario Valuation</h3>
                <p className="text-muted leading-relaxed font-sans text-xs">
                  Quantitative financial models evaluate sensitivity bounds and confidence scores under variable macro conditions.
                </p>
              </div>

              <div className="border border-hairline bg-surface p-5 space-y-2">
                <ShieldCheck size={18} className="text-signal" />
                <h3 className="text-strong font-semibold text-sm font-sans">Traceable Auditing</h3>
                <p className="text-muted leading-relaxed font-sans text-xs">
                  Zero simulated data. All agent actions are permanently logged with version timestamps and hash references.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Multi-Agent Architecture Section */}
        <section id="agents" className="py-16 px-6 border-b border-hairline">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-signal tracking-[0.2em] uppercase">Intelligence Network</p>
                <h2 className="font-display text-3xl font-medium text-strong">
                  11 Specialized Autonomous Agents
                </h2>
              </div>
              <Link
                to="/admin/agents"
                className="font-mono text-xs text-signal hover:underline inline-flex items-center gap-1"
              >
                Inspect Agents Directory <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
              {[
                { id: 'ECHO-ORCH', name: 'Orchestration Master', role: 'Coordinates multi-agent pipeline sequencing' },
                { id: 'ECHO-SIGNAL', name: 'Signal Discovery Agent', role: 'Detects contradictions, silences, and gaps' },
                { id: 'ECHO-SVEA', name: 'Scenario Valuation Engine', role: 'Generates quantitative financial models' },
                { id: 'ECHO-RSA', name: 'Risk Synthesis Agent', role: 'Compiles overall exposure and concerns' },
                { id: 'ECHO-SSR', name: 'Synthesis & Reporting', role: 'Produces executive disclosure briefings' },
                { id: 'ECHO-PSA-SOURCE', name: 'Source Discovery', role: 'Indexes verified filing registries' },
                { id: 'ECHO-PSA-DOC', name: 'Document Processing', role: 'Normalizes structured filings' },
                { id: 'ECHO-PSA-ENTITY', name: 'Entity Resolution', role: 'Canonicalizes corporate identities' },
              ].map((agent) => (
                <div key={agent.id} className="border border-hairline bg-surface p-4 space-y-1">
                  <span className="text-signal font-semibold text-[11px] block">{agent.id}</span>
                  <p className="text-strong font-medium font-sans text-xs">{agent.name}</p>
                  <p className="text-muted text-[11px] font-sans mt-1 leading-normal">{agent.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-16 px-6 bg-surface">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="font-display text-3xl sm:text-4xl text-strong font-medium">
              Ready to Monitor Corporate Intelligence?
            </h2>
            <p className="text-sm text-muted max-w-xl mx-auto leading-relaxed">
              Launch the Command Center terminal to explore canonical entities, discover disclosure anomalies, and run coordinated multi-agent investigations.
            </p>
            <div>
              <Link
                to="/admin/dashboard"
                className="inline-flex min-h-11 items-center gap-2 border border-signal bg-signal/15 px-8 py-3 font-mono text-xs uppercase tracking-widest text-strong hover:bg-signal/25 transition-colors font-semibold"
              >
                <span>Explore ECHO Terminal</span>
                <ArrowRight size={14} className="text-signal" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Public Footer */}
      <footer className="border-t border-hairline bg-surface px-6 py-8 text-xs font-mono text-muted">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <EchoMark className="text-signal" />
            <span>&copy; 2026 ECHO Financial Intelligence. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/privacy" className="hover:text-strong">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-strong">Terms of Service</Link>
            <Link to="/admin/system" className="hover:text-strong">System Telemetry</Link>
            <Link to="/admin/dashboard" className="text-signal font-medium">Admin Terminal</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
