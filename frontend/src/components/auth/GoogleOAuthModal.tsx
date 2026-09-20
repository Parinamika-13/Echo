import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldAlert, KeyRound, ExternalLink, Check, Copy } from 'lucide-react'
import { useState } from 'react'

type GoogleOAuthModalProps = {
  isOpen: boolean
  onClose: () => void
  instructions?: string | null
}

export function GoogleOAuthModal({ isOpen, onClose, instructions }: GoogleOAuthModalProps) {
  const [copied, setCopied] = useState(false)

  const envSnippet = `# Backend Environment (.env.local) - Never expose secret to frontend
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your_google_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:8000/api/v1/auth/google/callback"
FRONTEND_URL="http://localhost:5173"

# Google Cloud Console Configuration:
# Authorized JavaScript origin: http://localhost:5173
# Authorized redirect URI:       http://localhost:8000/api/v1/auth/google/callback`

  const handleCopy = () => {
    navigator.clipboard.writeText(envSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="w-full max-w-lg border border-hairline bg-surface p-6 shadow-2xl space-y-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 border border-signal/30 bg-signal/10 flex items-center justify-center">
                  <ShieldAlert className="text-signal h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-strong font-display">
                    Google OAuth Setup Required
                  </h3>
                  <p className="text-xs text-muted font-mono">Provider Configuration Inactive</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-muted hover:text-strong hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Notice Body */}
            <div className="space-y-3 text-xs text-muted leading-relaxed">
              <p>
                Genuine Google Sign-In requires active OAuth 2.0 client credentials registered with Google Cloud Platform. In accordance with ECHO production security policies, <span className="text-strong font-semibold">Google authentication is never simulated or faked with mock tokens</span>.
              </p>
              <div className="border border-hairline bg-bg p-3.5 space-y-2">
                <p className="font-mono text-[11px] text-signal font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound size={13} />
                  Required Configuration Elements
                </p>
                <ul className="space-y-1.5 text-[11px] font-mono">
                  <li className="flex items-start gap-2">
                    <span className="text-signal font-semibold">1.</span>
                    <span><strong className="text-strong">GOOGLE_CLIENT_ID:</strong> Public OAuth client ID from Google Cloud Console.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-signal font-semibold">2.</span>
                    <span><strong className="text-strong">GOOGLE_CLIENT_SECRET:</strong> Server-side confidential client secret (kept strictly private).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-signal font-semibold">3.</span>
                    <span><strong className="text-strong">Authorized JavaScript Origin:</strong> <code className="text-strong bg-surface px-1 py-0.5">http://localhost:5173</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-signal font-semibold">4.</span>
                    <span><strong className="text-strong">Authorized Redirect URI:</strong> <code className="text-strong bg-surface px-1 py-0.5">http://localhost:8000/api/v1/auth/google/callback</code></span>
                  </li>
                </ul>
              </div>

              {/* Snippet */}
              <div className="relative border border-hairline bg-bg-elevated p-3">
                <div className="flex items-center justify-between pb-1.5 text-[10px] font-mono text-muted uppercase">
                  <span>Configuration Template (.env.local)</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-signal hover:underline cursor-pointer"
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="font-mono text-[10px] text-ink overflow-x-auto whitespace-pre leading-relaxed">
                  {envSnippet}
                </pre>
              </div>

              {instructions && (
                <div className="text-[11px] font-mono text-muted bg-surface-2 p-2.5 border border-hairline whitespace-pre-line">
                  {instructions}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-hairline">
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-signal hover:underline"
              >
                <span>Google Cloud Console</span>
                <ExternalLink size={12} />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="min-h-10 px-5 border border-signal bg-signal/15 text-xs font-mono font-semibold uppercase tracking-wider text-strong hover:bg-signal/25 transition-colors"
              >
                Return to Sign In
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
