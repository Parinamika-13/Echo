import { createContext, useContext, useMemo, useState, useCallback, useEffect, type ReactNode } from 'react'
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  API_BASE,
} from '@/lib/constants'

export type AuthRole = 'ADMIN' | 'USER'

export type AuthUser = {
  id: string
  email: string
  name: string | null
  role: AuthRole
  auth_provider?: string
  is_active?: boolean
  created_at?: string
}

export type LocalProfile = {
  name: string
  email: string
  phone: string
  avatarDataUrl: string | null
}

export type LocalSession = {
  active: boolean
  startedAt: string
  kind: 'authenticated' | 'local-development'
  roleLabel: string
}

export type GoogleOAuthStatus = {
  configured: boolean
  client_id?: string | null
  redirect_uri?: string | null
  message: string
  instructions?: string | null
}

export type SignInResult = {
  success: boolean
  user?: AuthUser
  role?: AuthRole
  destination?: string
  error?: string
}

export type SignUpResult = {
  success: boolean
  user?: AuthUser
  role?: AuthRole
  destination?: string
  error?: string
}

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  role: AuthRole | null
  isAuthenticated: boolean
  isAdmin: boolean
  session: LocalSession | null
  profile: LocalProfile
  signIn: (email: string, password: string) => Promise<SignInResult>
  signUp: (email: string, password: string, name: string) => Promise<SignUpResult>
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  signOut: () => void
  persistSession: (newUser: AuthUser, newToken: string) => void
  getGoogleOAuthStatus: () => Promise<GoogleOAuthStatus>
  updateProfile: (patch: Partial<LocalProfile>) => void
}

const defaultProfile: LocalProfile = {
  name: '',
  email: '',
  phone: '',
  avatarDataUrl: null,
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY))
  const [user, setUser] = useState<AuthUser | null>(() =>
    readJson<AuthUser | null>(AUTH_USER_STORAGE_KEY, null),
  )
  const [session, setSession] = useState<LocalSession | null>(() =>
    readJson<LocalSession | null>(SESSION_STORAGE_KEY, null),
  )
  const [profile, setProfile] = useState<LocalProfile>(() => {
    const cachedUser = readJson<AuthUser | null>(AUTH_USER_STORAGE_KEY, null)
    const base = cachedUser
      ? {
          name: cachedUser.name || '',
          email: cachedUser.email,
          phone: '',
          avatarDataUrl: null,
        }
      : defaultProfile
    return {
      ...base,
      ...readJson<Partial<LocalProfile>>(PROFILE_STORAGE_KEY, {}),
    }
  })

  const isAuthenticated = Boolean(user && token)
  const isAdmin = user?.role === 'ADMIN'
  const role = user?.role || null

  const persistSession = useCallback((newUser: AuthUser, newToken: string) => {
    setUser(newUser)
    setToken(newToken)
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(newUser))
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, newToken)

    const nextSession: LocalSession = {
      active: true,
      startedAt: new Date().toISOString(),
      kind: 'authenticated',
      roleLabel: newUser.role === 'ADMIN' ? 'Command Center Administrator' : 'Workspace Intelligence Analyst',
    }
    setSession(nextSession)
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession))

    setProfile((prev) => {
      const nextProfile: LocalProfile = {
        ...prev,
        name: newUser.name || prev.name || '',
        email: newUser.email,
      }
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile))
      return nextProfile
    })
  }, [])

  const signIn = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      try {
        const res = await fetch(`${API_BASE}/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        })
        const data = await res.json()
        if (!res.ok) {
          return {
            success: false,
            error: data.detail || 'Authentication failed. Please verify your credentials.',
          }
        }
        persistSession(data.user, data.token)
        return {
          success: true,
          user: data.user,
          role: data.role as AuthRole,
          destination: data.destination,
        }
      } catch {
        return {
          success: false,
          error: 'Network connectivity error. Unable to communicate with the ECHO API Gateway.',
        }
      }
    },
    [persistSession],
  )

  const signUp = useCallback(
    async (email: string, password: string, name: string): Promise<SignUpResult> => {
      try {
        const res = await fetch(`${API_BASE}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password, name: name.trim() }),
        })
        const data = await res.json()
        if (!res.ok) {
          return {
            success: false,
            error: data.detail || 'Registration failed. Please review your details.',
          }
        }
        persistSession(data.user, data.token)
        return {
          success: true,
          user: data.user,
          role: data.role as AuthRole,
          destination: data.destination,
        }
      } catch {
        return {
          success: false,
          error: 'Network connectivity error. Unable to communicate with the ECHO API Gateway.',
        }
      }
    },
    [persistSession],
  )

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      return {
        success: res.ok,
        message: data.message || 'Password reset request recorded.',
      }
    } catch {
      return {
        success: false,
        message: 'Could not connect to the authentication server.',
      }
    }
  }, [])

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      try {
        const res = await fetch(`${API_BASE}/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || ''}`,
          },
          body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
        })
        const data = await res.json()
        if (!res.ok) {
          return { success: false, message: data.detail || 'Failed to update password.' }
        }
        return { success: true, message: data.message || 'Password updated successfully.' }
      } catch {
        return { success: false, message: 'Could not connect to the authentication server.' }
      }
    },
    [token],
  )

  const signOut = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setUser(null)
    setToken(null)
    setSession(null)
  }, [])

  // Authoritative backend validation of session on startup
  useEffect(() => {
    if (!token) return

    let isMounted = true
    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Session invalid or unauthorized')
        return res.json()
      })
      .then((data) => {
        if (!isMounted) return
        if (data.success && data.user) {
          setUser(data.user)
          localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(data.user))
        }
      })
      .catch(() => {
        // If the token is invalid/expired on the backend, sign out
        if (!isMounted) return
        signOut()
      })

    return () => {
      isMounted = false
    }
  }, [token, signOut])


  const getGoogleOAuthStatus = useCallback(async (): Promise<GoogleOAuthStatus> => {
    try {
      const res = await fetch(`${API_BASE}/auth/google/status`)
      if (res.ok) {
        return await res.json()
      }
    } catch {
      // Fallback
    }
    return {
      configured: false,
      client_id: null,
      message: 'Google OAuth provider is unconfigured.',
      instructions: 'Backend requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.',
    }
  }, [])

  const updateProfile = useCallback((patch: Partial<LocalProfile>) => {
    setProfile((current) => {
      const next = { ...current, ...patch }
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      role,
      isAuthenticated,
      isAdmin,
      session,
      profile,
      signIn,
      signUp,
      forgotPassword,
      changePassword,
      signOut,
      persistSession,
      getGoogleOAuthStatus,
      updateProfile,
    }),
    [
      user,
      token,
      role,
      isAuthenticated,
      isAdmin,
      session,
      profile,
      signIn,
      signUp,
      forgotPassword,
      changePassword,
      signOut,
      persistSession,
      getGoogleOAuthStatus,
      updateProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
