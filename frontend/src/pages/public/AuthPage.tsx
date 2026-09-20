import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { EchoMark } from '@/components/layout/EchoMark'
import { GoogleOAuthModal } from '@/components/auth/GoogleOAuthModal'
import { API_BASE } from '@/lib/constants'

type AuthMode = 'signin' | 'signup' | 'forgot'
type AuthContextRole = 'user' | 'admin'

export function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    signIn,
    signUp,
    forgotPassword,
    getGoogleOAuthStatus,
    persistSession,
    isAuthenticated,
    role,
  } = useAuth()

  // Context: user or admin
  const [contextRole, setContextRole] = useState<AuthContextRole>(() => {
    const ctx = searchParams.get('context')
    return ctx === 'admin' ? 'admin' : 'user'
  })

  // Mode: signin, signup, forgot
  const [mode, setMode] = useState<AuthMode>(() => {
    const m = searchParams.get('mode')
    if (m === 'signup') return 'signup'
    if (m === 'forgot') return 'forgot'
    return 'signin'
  })

  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Status & UI state
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [roleNotice, setRoleNotice] = useState<string | null>(null)

  // Google OAuth modal state
  const [googleModalOpen, setGoogleModalOpen] = useState(false)
  const [googleInstructions, setGoogleInstructions] = useState<string | null>(null)

  // Sync query parameters when context or mode changes
  const switchContext = (ctx: AuthContextRole) => {
    setContextRole(ctx)
    setErrorMessage(null)
    setSuccessMessage(null)
    setRoleNotice(null)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('context', ctx)
    setSearchParams(nextParams, { replace: true })
  }

  const switchMode = (m: AuthMode) => {
    setMode(m)
    setErrorMessage(null)
    setSuccessMessage(null)
    setRoleNotice(null)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('mode', m)
    setSearchParams(nextParams, { replace: true })
  }

  // Handle callback redirection, errors, or established authentication
  useEffect(() => {
    // 1. Check for query param error from Google callback redirect
    const errParam = searchParams.get('error')
    if (errParam) {
      setErrorMessage(decodeURIComponent(errParam))
    }

    // 2. Check for successful Google OAuth callback
    const googleAuth = searchParams.get('google_auth')
    const tokenParam = searchParams.get('token')
    if (googleAuth === 'success' && tokenParam) {
      setLoading(true)
      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${tokenParam}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            persistSession(data.user, tokenParam)
            const destination =
              data.destination ||
              (data.role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard')
            navigate(destination, { replace: true })
          } else {
            setErrorMessage('Unable to establish authenticated session from Google OAuth.')
          }
        })
        .catch(() => {
          setErrorMessage('Network error validating Google authenticated session.')
        })
        .finally(() => setLoading(false))
      return
    }

    // 3. If already authenticated, redirect appropriately
    if (isAuthenticated && role) {
      if (role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate('/app/dashboard', { replace: true })
      }
    }
  }, [isAuthenticated, role, navigate, searchParams, persistSession])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setRoleNotice(null)

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email address and password.')
      return
    }

    setLoading(true)
    try {
      const result = await signIn(email, password)
      if (!result.success) {
        setErrorMessage(result.error || 'Invalid credentials.')
        setLoading(false)
        return
      }

      // Backend role strictly dictates routing
      const destination = result.destination || (result.role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard')

      if (contextRole === 'admin' && result.role === 'USER') {
        setRoleNotice(
          'Authenticated as Workspace Analyst. Admin privileges are required for the Command Center. Routing to your assigned workspace (/app/dashboard)...',
        )
        setTimeout(() => navigate('/app/dashboard', { replace: true }), 1500)
      } else {
        navigate(destination, { replace: true })
      }
    } catch {
      setErrorMessage('Unexpected authentication error. Please retry.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.')
      return
    }
    if (!email.trim()) {
      setErrorMessage('Please enter a valid work email.')
      return
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const result = await signUp(email, password, name)
      if (!result.success) {
        setErrorMessage(result.error || 'Registration failed.')
        setLoading(false)
        return
      }

      setSuccessMessage('Account created successfully. Routing to your workspace...')
      setTimeout(() => navigate('/app/dashboard', { replace: true }), 1000)
    } catch {
      setErrorMessage('Unexpected registration error. Please retry.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!email.trim()) {
      setErrorMessage('Please provide your registered account email.')
      return
    }

    setLoading(true)
    try {
      const result = await forgotPassword(email)
      setSuccessMessage(result.message)
    } catch {
      setErrorMessage('Unable to process recovery request. Please retry.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleClick = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const status = await getGoogleOAuthStatus()
      if (!status.configured) {
        setGoogleInstructions(status.instructions || null)
        setGoogleModalOpen(true)
      } else {
        // Genuine OAuth redirect to backend Google OAuth initiator
        const targetUrl =
          status.auth_url || `/api/v1/auth/google/login?context=${contextRole}`
        window.location.href = targetUrl
      }
    } catch {
      setGoogleModalOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (type: 'admin' | 'analyst') => {
    if (type === 'admin') {
      setEmail('admin@echo.dev')
      setPassword('Admin123!')
      switchContext('admin')
    } else {
      setEmail('analyst@echo.dev')
      setPassword('Analyst123!')
      switchContext('user')
    }
    setErrorMessage(null)
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col antialiased">
      {/* Top Header */}
      <header className="border-b border-hairline bg-surface/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <EchoMark className="text-signal" />
          <span className="font-display font-medium text-strong text-xl">ECHO</span>
          <span className="font-mono text-[10px] text-muted tracking-widest uppercase hidden md:inline">
            Financial Intelligence
          </span>
        </Link>
        <div className="flex items-center gap-4 text-xs font-mono">
          <Link to="/" className="text-muted hover:text-strong transition-colors">
            &larr; Back to Overview
          </Link>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Context Selector Toggle */}
          <div className="border border-hairline bg-surface p-1 grid grid-cols-2 gap-1 text-xs font-mono">
            <button
              type="button"
              onClick={() => switchContext('user')}
              className={`min-h-10 px-3 flex items-center justify-center gap-2 transition-colors uppercase tracking-wider font-semibold ${
                contextRole === 'user'
                  ? 'bg-signal/15 text-strong border border-signal'
                  : 'text-muted hover:text-strong'
              }`}
            >
              <User size={13} className={contextRole === 'user' ? 'text-signal' : 'text-muted'} />
              <span>User Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => switchContext('admin')}
              className={`min-h-10 px-3 flex items-center justify-center gap-2 transition-colors uppercase tracking-wider font-semibold ${
                contextRole === 'admin'
                  ? 'bg-signal/15 text-strong border border-signal'
                  : 'text-muted hover:text-strong'
              }`}
            >
              <ShieldCheck size={14} className={contextRole === 'admin' ? 'text-signal' : 'text-muted'} />
              <span>Command Center</span>
            </button>
          </div>

          {/* Form Card */}
          <div className="border border-hairline bg-surface p-7 shadow-lg space-y-6">
            {/* Header copy dynamic to context */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-signal font-semibold uppercase tracking-widest">
                  {contextRole === 'admin' ? 'Administrative Access' : 'Workspace Analyst Access'}
                </span>
                <span className="font-mono text-[10px] text-muted border border-hairline px-2 py-0.5">
                  {contextRole === 'admin' ? 'ROLE: ADMIN' : 'ROLE: USER'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-medium text-strong">
                {contextRole === 'admin'
                  ? 'Welcome to the ECHO Command Center'
                  : 'Welcome to your ECHO Intelligence Workspace'}
              </h1>
              <p className="text-xs text-muted leading-relaxed">
                {contextRole === 'admin'
                  ? 'Access autonomous multi-agent pipelines, telemetry, datasets, and system controls.'
                  : 'Access corporate disclosure feeds, entity intelligence, risk profiles, and watchlists.'}
              </p>
            </div>

            {/* Mode Tabs */}
            {mode !== 'forgot' ? (
              <div className="flex border-b border-hairline text-xs font-mono">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className={`pb-2.5 px-3 border-b-2 font-semibold uppercase tracking-wider transition-colors ${
                    mode === 'signin'
                      ? 'border-signal text-strong'
                      : 'border-transparent text-muted hover:text-strong'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`pb-2.5 px-3 border-b-2 font-semibold uppercase tracking-wider transition-colors ${
                    mode === 'signup'
                      ? 'border-signal text-strong'
                      : 'border-transparent text-muted hover:text-strong'
                  }`}
                >
                  Create Account
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between border-b border-hairline pb-2.5 text-xs font-mono">
                <span className="text-strong font-semibold uppercase tracking-wider">Account Recovery</span>
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-signal hover:underline"
                >
                  &larr; Back to Sign In
                </button>
              </div>
            )}

            {/* Alerts */}
            {errorMessage && (
              <div className="border border-loss/40 bg-loss/10 p-3 text-xs text-loss flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="border border-gain/40 bg-gain/10 p-3 text-xs text-gain flex items-start gap-2">
                <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {roleNotice && (
              <div className="border border-signal/40 bg-signal/10 p-3 text-xs text-strong flex items-start gap-2">
                <Sparkles size={15} className="text-signal shrink-0 mt-0.5" />
                <span>{roleNotice}</span>
              </div>
            )}

            {/* Google Authentication Button */}
            {mode !== 'forgot' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={loading}
                  data-testid="google-auth-button"
                  aria-label="Continue with Google authentication"
                  className="min-h-12 w-full border border-hairline hover:border-strong/40 bg-surface-2 hover:bg-surface-3 transition-all px-4 py-2.5 flex items-center justify-center gap-3 text-xs font-mono text-strong uppercase tracking-wider font-semibold shadow-sm active:translate-y-px disabled:opacity-50 cursor-pointer"
                >
                  {/* Google Official 4-Color SVG Icon */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-hairline" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
                    <span className="bg-surface px-3 text-muted">or continue with email</span>
                  </div>
                </div>
              </div>
            )}

            {/* MODE: SIGN IN */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted">
                    Work Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@organization.com"
                      required
                      className="min-h-11 w-full border border-hairline bg-bg px-3 pl-9 text-xs text-ink placeholder:text-muted/50 focus:border-signal focus:outline-none"
                    />
                    <Mail size={14} className="text-muted absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-muted">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[10px] font-mono text-signal hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="min-h-11 w-full border border-hairline bg-bg px-3 pl-9 pr-10 text-xs text-ink placeholder:text-muted/50 focus:border-signal focus:outline-none"
                    />
                    <Lock size={14} className="text-muted absolute left-3 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted hover:text-strong"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-11 w-full border border-signal bg-signal/15 px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-widest text-strong hover:bg-signal/25 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to ECHO'}</span>
                  <ArrowRight size={13} className="text-signal" />
                </button>
              </form>
            )}

            {/* MODE: SIGN UP */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      required
                      className="min-h-11 w-full border border-hairline bg-bg px-3 pl-9 text-xs text-ink placeholder:text-muted/50 focus:border-signal focus:outline-none"
                    />
                    <User size={14} className="text-muted absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted">
                    Work Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="analyst@organization.com"
                      required
                      className="min-h-11 w-full border border-hairline bg-bg px-3 pl-9 text-xs text-ink placeholder:text-muted/50 focus:border-signal focus:outline-none"
                    />
                    <Mail size={14} className="text-muted absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted">
                    Password (min. 8 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="min-h-11 w-full border border-hairline bg-bg px-3 pl-9 pr-10 text-xs text-ink placeholder:text-muted/50 focus:border-signal focus:outline-none"
                    />
                    <Lock size={14} className="text-muted absolute left-3 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted hover:text-strong"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="min-h-11 w-full border border-hairline bg-bg px-3 pl-9 text-xs text-ink placeholder:text-muted/50 focus:border-signal focus:outline-none"
                    />
                    <KeyRound size={14} className="text-muted absolute left-3 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-11 w-full border border-signal bg-signal/15 px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-widest text-strong hover:bg-signal/25 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
                  <ArrowRight size={13} className="text-signal" />
                </button>
              </form>
            )}

            {/* MODE: FORGOT PASSWORD */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-xs text-muted leading-relaxed">
                  Enter your registered account address. We will verify your account status against the ECHO backend authority and dispatch recovery instructions.
                </p>
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted">
                    Account Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="analyst@organization.com"
                      required
                      className="min-h-11 w-full border border-hairline bg-bg px-3 pl-9 text-xs text-ink placeholder:text-muted/50 focus:border-signal focus:outline-none"
                    />
                    <Mail size={14} className="text-muted absolute left-3 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-11 w-full border border-signal bg-signal/15 px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-widest text-strong hover:bg-signal/25 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Submitting...' : 'Dispatch Reset Instructions'}</span>
                  <ArrowRight size={13} className="text-signal" />
                </button>
              </form>
            )}

            {/* Fast Credentials Autofill (Development & Evaluation) */}
            <div className="pt-3 border-t border-hairline space-y-2">
              <p className="text-[10px] font-mono text-muted uppercase tracking-wider">
                Evaluation Credentials:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => fillCredentials('admin')}
                  className="p-2 border border-hairline bg-surface-2 hover:bg-surface-3 text-left transition-colors"
                >
                  <span className="block text-signal font-semibold">Admin Account</span>
                  <span className="text-[10px] text-muted truncate block">admin@echo.dev</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('analyst')}
                  className="p-2 border border-hairline bg-surface-2 hover:bg-surface-3 text-left transition-colors"
                >
                  <span className="block text-signal font-semibold">Analyst Account</span>
                  <span className="text-[10px] text-muted truncate block">analyst@echo.dev</span>
                </button>
              </div>
            </div>
          </div>

          {/* Legal / Policy Footer */}
          <div className="text-center text-xs font-mono text-muted space-x-3">
            <Link to="/privacy" className="hover:text-strong transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:text-strong transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </main>

      {/* Google OAuth Setup Guidance Modal */}
      <GoogleOAuthModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        instructions={googleInstructions}
      />
    </div>
  )
}
