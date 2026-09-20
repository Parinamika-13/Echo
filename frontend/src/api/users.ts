import { apiFetch } from './client'
import type { AuthUser } from '@/context/AuthContext'

export function listUsers() {
  return apiFetch<AuthUser[]>('/auth/users')
}

export function getUser(userId: string) {
  return apiFetch<AuthUser>(`/auth/users/${encodeURIComponent(userId)}`)
}
