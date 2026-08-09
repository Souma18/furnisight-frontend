const ADMIN_ROLE_KEYS = new Set(['admin', 'super', 'super_admin', 'super admin', 'manager', 'staff'])

export function normalizeRoleName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^role[_-]/, '')
    .replace(/[_-]+/g, ' ')
}

export function accountRoleNames(account = {}) {
  const names = []
  if (account.role) names.push(account.role)
  if (Array.isArray(account.roles)) {
    for (const role of account.roles) {
      names.push(typeof role === 'string' ? role : role?.name)
    }
  }
  return [...new Set(names.map(normalizeRoleName).filter(Boolean))]
}

export function isAdminRoleName(roleName) {
  const normalized = normalizeRoleName(roleName)
  return ADMIN_ROLE_KEYS.has(normalized)
}

export function isAdminAccount(account = {}) {
  return accountRoleNames(account).some(isAdminRoleName)
}
