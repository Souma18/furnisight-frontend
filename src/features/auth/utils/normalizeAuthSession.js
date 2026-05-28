export { normalizeAuthSession } from '@shared/lib/api/services/auth/auth.model'

export function normalizeRole(role) {
  if (!role) return ''
  return String(role).toUpperCase().replace(/^ROLE_/, '')
}

export function isAdminRole(roleOrRoles) {
  if (Array.isArray(roleOrRoles)) {
    return roleOrRoles.some(role => normalizeRole(role) === 'ADMIN')
  }
  return normalizeRole(roleOrRoles) === 'ADMIN'
}
