import { formatTime } from '@shared/lib/formatters/DateFormatter'

const AVATAR_PALETTE = [
  { avClass: 'av-gold', avColor: 'linear-gradient(135deg,#e5b84a,#c9922a)', textColor: 'var(--navy)' },
  { avClass: 'av-blue', avColor: 'linear-gradient(135deg,#60a5fa,#2563eb)', textColor: '#fff' },
  { avClass: 'av-purple', avColor: 'linear-gradient(135deg,#a78bfa,#7c3aed)', textColor: '#fff' },
  { avClass: 'av-red', avColor: 'linear-gradient(135deg,#f87171,#dc2626)', textColor: '#fff' },
]

const STATUS_TO_KEY = {
  OPEN: 'new',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'pending',
  WAITING_CUSTOMER: 'waiting',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
}

const KEY_TO_STATUS = {
  new: 'OPEN',
  assigned: 'ASSIGNED',
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

const KEY_TO_PRIORITY = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  urgent: 'URGENT',
}

export function mapStatusToApi(statusKey) {
  return KEY_TO_STATUS[statusKey] ?? String(statusKey || 'OPEN').toUpperCase()
}

export function mapPriorityToApi(priorityKey) {
  return KEY_TO_PRIORITY[priorityKey] ?? String(priorityKey || 'MEDIUM').toUpperCase()
}

export function formatTimeLabel(iso) {
  return formatTime(iso || new Date().toISOString())
}

function pickAvatarPalette(seed) {
  const n = Number(seed) || 0
  return AVATAR_PALETTE[Math.abs(n) % AVATAR_PALETTE.length]
}

function extractProducts(raw) {
  const text = raw.content ?? ''
  if (text.startsWith('PRODUCT_DATA:')) {
    try {
      const data = JSON.parse(text.substring('PRODUCT_DATA:'.length))
      if (!data.image && raw.attachmentUrl) data.image = raw.attachmentUrl
      return [data]
    } catch (e) {
      return [{
        id: 'debug-error',
        name: 'Lỗi: ' + e.message,
        category: text,
        price: 0,
        image: ''
      }]
    }
  }
  return []
}

function messageContent(raw) {
  if (!raw) return ''
  const text = raw.content ?? ''
  if (text.startsWith('PRODUCT_DATA:')) {
    return 'Đã chia sẻ 1 sản phẩm'
  }
  if (raw.messageType && raw.messageType !== 'TEXT') {
    const firstAttachment = Array.isArray(raw.attachments) ? raw.attachments[0] : null
    return text || raw.attachmentName || firstAttachment?.name || '[Đính kèm]'
  }
  return text
}

function mapAttachment(raw = {}) {
  const url = raw.attachmentUrl || raw.mediaUrl || raw.fileUrl || raw.url || ''
  const name = raw.attachmentName || raw.fileName || raw.name || ''
  const mime = raw.attachmentType || raw.contentType || raw.mimeType || ''
  const type = raw.type || raw.messageType || ''
  if (!url && !name && !raw.mediaId && !raw.fileId) return null
  return {
    url,
    name: name || (type === 'IMAGE' ? 'Ảnh đính kèm' : 'Tệp đính kèm'),
    mime,
    size: raw.attachmentSize || raw.sizeBytes || raw.fileSize || 0,
    mediaId: raw.mediaId || '',
    fileId: raw.fileId || null,
    isImage: String(type).toUpperCase() === 'IMAGE' || String(mime).startsWith('image/'),
  }
}

function mapAttachments(raw = {}) {
  const source = Array.isArray(raw.attachments)
    ? raw.attachments
    : typeof raw.attachments === 'string'
      ? safeParseAttachments(raw.attachments)
      : []
  const mapped = source
    .map((item) => mapAttachment({
      attachmentUrl: item.url,
      attachmentName: item.name,
      attachmentType: item.type,
      attachmentSize: item.size,
      mediaId: item.mediaId,
      messageType: item.isImage ? 'IMAGE' : raw.messageType,
      ...item,
    }))
    .filter(Boolean)

  if (mapped.length) return mapped
  const single = mapAttachment(raw)
  return single ? [single] : []
}

function safeParseAttachments(value) {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function mapMessageToCustomer(raw, buyerId) {
  const senderId = Number(raw.senderId)
  const role = senderId === Number(buyerId) ? 'user' : 'assistant'
  const attachments = mapAttachments(raw)
  return {
    id: raw.id ?? raw.messageId ?? `msg-${Date.now()}`,
    role,
    content: messageContent(raw),
    attachment: attachments[0] || null,
    attachments,
    products: extractProducts(raw),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    clientTempId: raw.clientTempId,
    senderId,
  }
}

export function mapMessageToAdminTimeline(raw, { buyerId, staffId, staffName } = {}) {
  const attachments = mapAttachments(raw)
  if (raw.isInternal) {
    return {
      id: raw.id ?? raw.messageId,
      type: 'note',
      text: messageContent(raw),
      attachment: attachments[0] || null,
      attachments,
      products: extractProducts(raw),
      time: formatTimeLabel(raw.createdAt),
      createdAt: raw.createdAt ?? new Date().toISOString(),
      senderName: staffName || `Admin #${raw.senderId}`,
    }
  }

  const senderId = Number(raw.senderId)
  const isCustomer = senderId === Number(buyerId)

  return {
    id: raw.id ?? raw.messageId,
    type: isCustomer ? 'customer' : 'admin',
    text: messageContent(raw),
    attachment: attachments[0] || null,
    attachments,
    products: extractProducts(raw),
    time: formatTimeLabel(raw.createdAt),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    senderName: isCustomer ? `Khách #${buyerId}` : staffName || `Admin #${staffId}`,
    senderRole: isCustomer ? undefined : 'AD',
  }
}

export function mapConversationToAdminList(raw) {
  const buyerId = raw.buyerId
  const palette = pickAvatarPalette(buyerId)
  const name = raw.buyerName || `Khách #${buyerId}`
  const avatarUrl = raw.buyerAvatarUrl || raw.avatarUrl || raw.buyer?.avatarUrl || ''
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
    assignedAdminId: raw.assignedAdminId ?? raw.staffId ?? null,
    assigneeName: raw.assigneeName ?? raw.staffName ?? raw.assignedAdminName ?? '',
    assigneeRole: raw.assigneeRole ?? raw.staffRole ?? '',
    name,
    av: initials || 'KH',
    avatarUrl,
    ...palette,
    status: raw.status || 'OPEN',
    statusKey: STATUS_TO_KEY[raw.status || 'OPEN'] ?? 'pending',
    email: raw.buyerEmail || `buyer-${buyerId}@furnisight.store`,
    priority: PRIORITY_TO_UI[raw.priority] ?? 'medium',
    unreadCount: 0,
    unread: false,
    lastMessage: raw.lastMessageContent || '',
    preview: raw.lastMessageContent || '',
    lastSenderId: raw.senderId ?? raw.lastSenderId ?? null,
    lastMessageId: raw.messageId ?? raw.lastMessageId ?? null,
    closedAt: raw.closedAt ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    channel: raw.channel || 'SUPPORT',
  }
}

export function normalizeMessagePage(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.content)) return data.content
  return []
}

export function normalizeConversationList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.content)) return data.content
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
