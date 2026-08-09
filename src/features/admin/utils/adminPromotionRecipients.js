import { isAdminAccount } from './adminAccountRoles'

export function isPromotionRecipient(account = {}) {
  return Boolean(account.id || account.userId)
    && account.isAdmin !== true
    && account.admin !== true
    && !isAdminAccount(account)
}

export function mapPromotionRecipient(account = {}) {
  const name = account.displayName
    || account.fullName
    || account.name
    || account.fullName
    || account.username
    || account.email
    || account.id
    || account.userId

  return {
    id: account.id || account.userId,
    name,
    email: account.email || '',
    avatar: String(name || 'U').trim().slice(0, 2).toUpperCase(),
  }
}

export function filterPromotionRecipients(users, query = '') {
  const normalizedQuery = String(query).trim().toLowerCase()
  if (!normalizedQuery) return users

  return users.filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(normalizedQuery),
  )
}

export function filterPromotionRecipientIds(userIds, users) {
  if (!Array.isArray(userIds) || !Array.isArray(users)) return []

  const selectedIds = new Set(userIds.map(String))
  return users
    .filter((user) => selectedIds.has(String(user.id)))
    .map((user) => user.id)
}
