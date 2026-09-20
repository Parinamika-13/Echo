import { Link } from 'react-router-dom'
import { AlertTriangle, ShieldCheck, Scale, FileText } from 'lucide-react'
import { EchoMark } from '@/components/layout/EchoMark'

export function TermsPage() {
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
          <Link to="/privacy" className="text-muted hover:text-strong transition-colors">
            Privacy
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
          <p className="font-mono text-[11px] tracking-[0.28em] text-signal uppercase">Legal & Operating Agreement</p>
          <h1 className="font-display mt-2 text-4xl text-strong font-medium">Terms & Conditions</h1>
          <p className="mt-2 text-sm text-muted">
            Last Updated: September 20, 2026 &bull; Version 1.0
          </p>
        </div>

        {/* Vital Disclaimers Banner */}
        <div className="border border-risk/40 bg-risk/10 p-6 space-y-4">
          <div className="flex items-center gap-2 text-risk font-mono text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle size={16} /> Regulatory Disclaimers & Limitations
          </div>

          <div className="space-y-3 text-xs text-muted leading-relaxed">
            <p>
              <strong>1. NO FINANCIAL OR INVESTMENT ADVICE:</strong> The ECHO platform, including its multi-agent intelligence outputs, signal detection algorithms, scenario valuation models, and risk assessments, is provided strictly for informational and quantitative analytical purposes. ECHO is <strong>not</strong> a registered investment adviser, broker-dealer, financial intermediary, or commodity trading advisor.
            </p>
            <p>
              ECHO does <strong>not</strong> provide personalized investment advice, legal counsel, tax guidance, or buy/sell/hold recommendations. Any valuation metrics or signal scores represent algorithmic estimations derived from ingested disclosure documents and must not be construed as investment solicitation.
            </p>
            <p>
              <strong>2. AI-GENERATED ANALYSIS & INDEPENDENT VERIFICATION:</strong> ECHO utilizes coordinated autonomous artificial intelligence agents. While designed to enhance traceability and reduce hallucinations via atomic evidence linking, automated extractions may contain omissions, delays, or variances. <strong>Users must independently examine and verify all findings against primary corporate filings and audited financial statements before executing transactions or taking commercial decisions.</strong>
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-strong font-medium">1. Acceptance of Terms</h2>
          <p className="text-sm text-muted leading-relaxed">
            By accessing, deploying, or interacting with the ECHO Financial Intelligence platform, terminals, client libraries, or API services, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, you must terminate your use of the platform immediately.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-strong font-medium">2. Acceptable Use Policy</h2>
          <p className="text-sm text-muted leading-relaxed">
            Operators and users of ECHO agree to utilize the platform exclusively in accordance with applicable federal, state, and international laws. Specifically, you agree not to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted leading-relaxed">
            <li>Attempt to reverse-engineer, decompile, or extract proprietary model configurations or system prompts outside authorized open-source licenses.</li>
            <li>Ingest confidential, classified, non-public material information (MNPI), or illicitly obtained proprietary trade secrets into shared multi-tenant instances.</li>
            <li>Subject the FastAPI gateway or InsForge database to unauthorized denial-of-service stress, automated scrapers, or abusive load testing.</li>
            <li>Use the platform’s quantitative findings to engage in market manipulation, deceptive trading practices, or fraudulent representations.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-strong font-medium">3. Intellectual Property</h2>
          <p className="text-sm text-muted leading-relaxed">
            The software architecture, visual interface design, provenance graph models, agent orchestration pipelines (including ECHO-ORCH, ECHO-SIGNAL, ECHO-SVEA, ECHO-RSA, and ECHO-SSR), and documentation are the intellectual property of the ECHO project and its licensors. User-submitted disclosure datasets remain the property of their respective creators or public domain sources.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-strong font-medium">4. Service Availability & Warranties</h2>
          <p className="text-sm text-muted leading-relaxed">
            THE PLATFORM IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TIMELINESS, ACCURACY, OR UNINTERRUPTED AVAILABILITY.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            ECHO does not warrant that the results obtained from multi-agent investigations will be completely error-free or that all cross-filing contradictions will be detected.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-strong font-medium">5. Limitation of Liability</h2>
          <p className="text-sm text-muted leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL ECHO, ITS DEVELOPERS, AFFILIATES, OR LICENSORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, INVESTMENT LOSSES, BUSINESS INTERRUPTION, OR LOSS OF DATA) ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR RELIANCE UPON INTELLIGENCE GENERATED BY THE PLATFORM.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-strong font-medium">6. Termination & Modifications</h2>
          <p className="text-sm text-muted leading-relaxed">
            Administrators reserve the right to suspend or terminate API credentials or console access for violations of these Terms. ECHO reserves the right to amend these Terms at any time by updating this document with a revised effective date.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 border-t border-hairline pt-6">
          <h2 className="font-display text-2xl text-strong font-medium">7. Contact & Legal Inquiries</h2>
          <p className="text-sm text-muted leading-relaxed">
            For legal inquiries regarding these Terms and Conditions:
          </p>
          <div className="font-mono text-xs border border-hairline bg-surface p-4 text-muted space-y-1">
            <p className="text-strong font-semibold">ECHO Legal & Governance Office</p>
            <p>Email: <span className="text-signal">legal@echo-intelligence.dev</span></p>
            <p>Organization: ECHO Financial Intelligence Platform</p>
          </div>
        </section>
      </main>

      {/* Public Footer */}
      <footer className="border-t border-hairline bg-surface px-6 py-8 text-xs font-mono text-muted">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 ECHO Financial Intelligence Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-strong">Home</Link>
            <Link to="/privacy" className="hover:text-strong">Privacy Policy</Link>
            <Link to="/terms" className="text-signal">Terms of Service</Link>
            <Link to="/admin/dashboard" className="hover:text-strong">Admin Console</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
