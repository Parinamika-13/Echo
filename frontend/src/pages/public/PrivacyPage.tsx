import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Lock, Database, Eye, Terminal } from 'lucide-react'
import { EchoMark } from '@/components/layout/EchoMark'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col antialiased">
      {/* Top Header */}
      <header className="border-b border-hairline bg-surface/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <EchoMark className="text-signal" />
          <span className="font-display font-medium text-strong text-lg">ECHO</span>
          <span className="font-mono text-[10px] text-muted tracking-widest uppercase hidden sm:inline">
            Financial Intelligence
          </span>
        </Link>
        <div className="flex items-center gap-4 text-xs font-mono">
          <Link to="/" className="text-muted hover:text-strong transition-colors">
            Home
          </Link>
          <Link to="/terms" className="text-muted hover:text-strong transition-colors">
            Terms
          </Link>
          <Link
            to="/admin/dashboard"
            className="border border-signal px-3 py-1 text-strong hover:bg-surface-2 transition-colors uppercase tracking-wider text-[11px]"
          >
            Launch Terminal
          </Link>
        </div>
      </header>

      {/* Content Container */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Page Title */}
        <div className="border-b border-hairline pb-6">
          <p className="font-mono text-[11px] tracking-[0.28em] text-signal uppercase">Legal & Compliance</p>
          <h1 className="font-display mt-2 text-4xl text-strong font-medium">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted">
            Last Updated: September 20, 2026 &bull; Effective Immediately
          </p>
        </div>

        {/* Executive Summary Box */}
        <div className="border border-hairline bg-surface p-6 space-y-2">
          <p className="font-mono text-xs font-semibold text-signal uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={16} /> Privacy Commitment & Operational Scope
          </p>
          <p className="text-xs text-muted leading-relaxed">
            ECHO is an autonomous financial and real-estate disclosure intelligence platform designed for enterprise analysts, compliance teams, and institutional researchers. This Privacy Policy sets forth how information is handled, processed, and retained when interacting with the ECHO terminal and related APIs.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-strong font-medium">1. Information Collected by ECHO</h2>
          <p className="text-sm text-muted leading-relaxed">
            Depending on how you configure and deploy the ECHO terminal, the system may process the following categories of data:
          </p>
          <div className="space-y-3 font-mono text-xs pt-1">
            <div className="p-4 border border-hairline bg-surface">
              <span className="text-strong font-semibold block mb-1">A. Local Operator & Profile Data</span>
              <p className="text-muted leading-relaxed">
                When managing an administrative session, your operator name, contact email, telephone, avatar profile image, and display preferences are stored client-side in your browser’s local storage (<code className="text-signal font-mono text-[11px]">localStorage</code>). These values are never transmitted to external marketing platforms.
              </p>
            </div>

            <div className="p-4 border border-hairline bg-surface">
              <span className="text-strong font-semibold block mb-1">B. Corporate Disclosures & Financial Datasets</span>
              <p className="text-muted leading-relaxed">
                Publicly available corporate filings, property registries, and disclosure workbooks ingested into ECHO are normalized into entities, atomic evidence statements, signals, and scenario valuations.
              </p>
            </div>

            <div className="p-4 border border-hairline bg-surface">
              <span className="text-strong font-semibold block mb-1">C. Investigation & System Telemetry</span>
              <p className="text-muted leading-relaxed">
                To provide provenance verification, ECHO records multi-agent execution timestamps, agent durations, workflow parameters, and cryptographic audit trails for every pipeline execution.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-strong font-medium">2. How Information is Used</h2>
          <p className="text-sm text-muted leading-relaxed">
            Information ingested into or generated by ECHO is utilized strictly for:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted leading-relaxed">
            <li>Executing deterministic multi-agent entity resolution, document extraction, and contradiction analysis.</li>
            <li>Evaluating quantitative valuation and scenario models through the Scenario Valuation Engine (ECHO-SVEA).</li>
            <li>Compiling verifiable, immutable audit trails to provide traceable provenance for risk assessments.</li>
            <li>Operating, debugging, and maintaining the technical stability of the backend API gateway.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-strong font-medium">3. Cookies and Local Storage Policy</h2>
          <div className="border border-hairline bg-surface p-5 space-y-2">
            <p className="font-mono text-xs text-signal font-semibold uppercase tracking-wider">
              Zero Non-Essential Cookies
            </p>
            <p className="text-sm text-muted leading-relaxed">
              ECHO does <strong>not</strong> use advertising cookies, marketing pixels, cross-site trackers, or commercial tracking beacons. The application exclusively utilizes browser <code className="text-signal text-xs">localStorage</code> to maintain your theme preference, active console session, and locally-configured profile attributes across browser reloads.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-strong font-medium">4. Infrastructure & Third-Party Services</h2>
          <p className="text-sm text-muted leading-relaxed">
            ECHO operates on self-hosted or dedicated cloud infrastructure utilizing:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted leading-relaxed">
            <li><strong>FastAPI Application Server:</strong> Mediates all client requests and pipeline orchestrations.</li>
            <li><strong>InsForge PostgreSQL:</strong> Provides managed enterprise persistence with Row-Level Security (RLS).</li>
            <li><strong>Local SQLite Storage:</strong> May be utilized in standalone offline testing environments.</li>
          </ul>
          <p className="text-sm text-muted leading-relaxed">
            Your data is not sold, rented, or distributed to third-party commercial data brokers under any circumstances.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-strong font-medium">5. Data Retention & User Rights</h2>
          <p className="text-sm text-muted leading-relaxed">
            Corporate intelligence records and audit trails are retained within the database according to institutional compliance policies set by the deployment administrator. Operators may at any time:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted leading-relaxed">
            <li>Clear their local operator session and cached profile data by clicking <strong>Sign Out</strong> in the console.</li>
            <li>Request deletion or re-indexing of uploaded disclosure datasets through administrative ingestion controls.</li>
            <li>Inspect the complete immutable audit trail associated with any corporate entity via the Audit module.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 border-t border-hairline pt-6">
          <h2 className="font-display text-2xl text-strong font-medium">6. Contact & Compliance Inquiries</h2>
          <p className="text-sm text-muted leading-relaxed">
            For questions regarding this Privacy Policy or platform compliance:
          </p>
          <div className="font-mono text-xs border border-hairline bg-surface p-4 text-muted space-y-1">
            <p className="text-strong font-semibold">ECHO Project Compliance Office</p>
            <p>Email: <span className="text-signal">compliance@echo-intelligence.dev</span></p>
            <p>Organization: ECHO Financial Intelligence Network</p>
            <p>Repository: InsForge echo-intelligence (us-east)</p>
          </div>
        </section>
      </main>

      {/* Public Footer */}
      <footer className="border-t border-hairline bg-surface px-6 py-8 text-xs font-mono text-muted">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 ECHO Financial Intelligence Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-strong">Home</Link>
            <Link to="/privacy" className="text-signal">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-strong">Terms of Service</Link>
            <Link to="/admin/dashboard" className="hover:text-strong">Admin Console</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
