import { AuthProfileResponse } from '@shared/lib/api/services/auth/auth.model'

export function normalizeJwtToken(value) {
  if (typeof value !== 'string') return null

  const token = value.trim().replace(/^Bearer\s+/i, '')
  if (!token) return null

  return token
}

export function normalizeStoredToken(value) {
  if (typeof value !== 'string') return null

  const token = value.trim()
  return token || null
}

export function normalizeStoredProfile(value) {
  if (!value || typeof value !== 'object') return null
  return new AuthProfileResponse(value)
}

export function normalizeRoles(roles = []) {
  if (!Array.isArray(roles)) {
    return []
  }
  return roles.map(r => r.startsWith('ROLE_') ? r : `ROLE_${r}`)
}

export function isAdminRole(roleOrRoles) {
  if (Array.isArray(roleOrRoles)) {
    return roleOrRoles.some(r => r === 'ADMIN' || r === 'ROLE_ADMIN')
  }
  return roleOrRoles === 'ADMIN' || roleOrRoles === 'ROLE_ADMIN'
}

export function unwrapApiData(response) {
  return response?.data?.data ?? response?.data ?? response
}
