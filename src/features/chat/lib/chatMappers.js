const AVATAR_PALETTE = [
  { avClass: 'av-gold', avColor: 'linear-gradient(135deg,#e5b84a,#c9922a)', textColor: 'var(--navy)' },
  { avClass: 'av-blue', avColor: 'linear-gradient(135deg,#60a5fa,#2563eb)', textColor: '#fff' },
  { avClass: 'av-purple', avColor: 'linear-gradient(135deg,#a78bfa,#7c3aed)', textColor: '#fff' },
  { avClass: 'av-red', avColor: 'linear-gradient(135deg,#f87171,#dc2626)', textColor: '#fff' },
]

const STATUS_TO_KEY = {
  OPEN: 'pending',
  ASSIGNED: 'pending',
  IN_PROGRESS: 'pending',
  WAITING_CUSTOMER: 'waiting',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
}

const KEY_TO_STATUS = {
  new: 'OPEN',
  pending: 'IN_PROGRESS',
  waiting: 'WAITING_CUSTOMER',
  resolved: 'RESOLVED',
  closed: 'CLOSED',
}

const PRIORITY_TO_UI = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
}

export function mapStatusToApi(statusKey) {
  return KEY_TO_STATUS[statusKey] ?? String(statusKey || 'OPEN').toUpperCase()
}

export function formatTimeLabel(iso) {
  const date = iso ? new Date(iso) : new Date()
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function pickAvatarPalette(seed) {
  const n = Number(seed) || 0
  return AVATAR_PALETTE[Math.abs(n) % AVATAR_PALETTE.length]
}

function messageContent(raw) {
  if (!raw) return ''
  if (raw.messageType && raw.messageType !== 'TEXT') {
    return raw.content || '[Đính kèm]'
  }
  return raw.content ?? ''
}

export function mapMessageToCustomer(raw, buyerId) {
  const senderId = Number(raw.senderId)
  const role = senderId === Number(buyerId) ? 'user' : 'assistant'
  return {
    id: raw.id ?? raw.messageId ?? `msg-${Date.now()}`,
    role,
    content: messageContent(raw),
    products: [],
    createdAt: raw.createdAt ?? new Date().toISOString(),
    clientTempId: raw.clientTempId,
    senderId,
  }
}

export function mapMessageToAdminTimeline(raw, { buyerId, staffId, staffName } = {}) {
  if (raw.isInternal) {
    return {
      id: raw.id ?? raw.messageId,
      type: 'note',
      text: messageContent(raw),
      time: formatTimeLabel(raw.createdAt),
      senderName: staffName || `Admin #${raw.senderId}`,
    }
  }

  const senderId = Number(raw.senderId)
  const isCustomer = senderId === Number(buyerId)

  return {
    id: raw.id ?? raw.messageId,
    type: isCustomer ? 'customer' : 'admin',
    text: messageContent(raw),
    time: formatTimeLabel(raw.createdAt),
    senderName: isCustomer ? `Khách #${buyerId}` : staffName || `Admin #${staffId}`,
    senderRole: isCustomer ? undefined : 'AD',
  }
}

export function mapConversationToAdminList(raw) {
  const buyerId = raw.buyerId
  const palette = pickAvatarPalette(buyerId)
  const name = raw.buyerName || `Khách #${buyerId}`
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return {
    id: raw.id,
    buyerId,
    staffId: raw.staffId ?? raw.assignedAdminId ?? null,
    name,
    av: initials || 'KH',
    ...palette,
    status: raw.status || 'OPEN',
    statusKey: STATUS_TO_KEY[raw.status] ?? 'pending',
    online: 'online-away',
    onlinePill: 'pill-away',
    pillText: 'Hỗ trợ',
    email: raw.buyerEmail || `buyer-${buyerId}@luxnest.vn`,
    priority: PRIORITY_TO_UI[raw.priority] ?? 'medium',
    vip: false,
    isAi: false,
    unread: Boolean(raw.unread ?? raw.hasUnread),
    lastMessage: raw.lastMessageContent || '',
    preview: raw.lastMessageContent || '',
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    channel: raw.channel || 'SUPPORT',
  }
}

export function normalizeMessagePage(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data?.items)) return data.items
  return []
}

export function normalizeConversationList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data?.items)) return data.items
  return []
}

export function pickLatestConversation(conversations, channel = 'SUPPORT') {
  const list = normalizeConversationList(conversations)
  if (!list.length) return null

  const filtered = channel ? list.filter((c) => !c.channel || c.channel === channel) : list
  const pool = filtered.length ? filtered : list

  return [...pool].sort((a, b) => {
    const ta = new Date(a.lastMessageAt || a.updatedAt || a.createdAt || 0).getTime()
    const tb = new Date(b.lastMessageAt || b.updatedAt || b.createdAt || 0).getTime()
    return tb - ta
  })[0]
}
