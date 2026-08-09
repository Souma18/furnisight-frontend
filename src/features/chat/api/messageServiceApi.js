import { apiClient } from '@/shared/lib/api'

const PREFIX = '/messages'

export function unwrapMessageService(response) {
  const body = response?.data ?? response
  if (body == null || body === '') return null
  if (body && typeof body === 'object' && 'code' in body) {
    if (body.code !== 200) {
      const err = new Error(body.message || 'MessageService request failed')
      err.code = body.code
      throw err
    }
    return body.data
  }
  return body
}

function msUrl(path) {
  return `${PREFIX}${path}`
}

export async function createConversation(payload) {
  const res = await apiClient.post(msUrl('/conversation/create'), payload)
  return unwrapMessageService(res)
}

export async function getConversationsByUser(userId) {
  if (userId == null || userId === '') return []
  const res = await apiClient.get(msUrl(`/conversation/all/${userId}`))
  return unwrapMessageService(res) ?? []
}

export async function getConversation(conversationId) {
  const res = await apiClient.get(msUrl(`/conversation/${conversationId}`))
  return unwrapMessageService(res)
}

export async function getAdminInbox(params = {}) {
  const queryParts = []
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    if (Array.isArray(v)) {
      v.forEach(item => {
        queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(item)}`)
      })
    } else {
      queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    }
  }
  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : ''
  const res = await apiClient.get(`${msUrl('/conversation/admin/inbox')}${queryString}`)
  return unwrapMessageService(res)
}

export async function getMessages({ conversationId, page = 0, size = 50, includeInternal = false } = {}) {
  const res = await apiClient.get(msUrl('/message'), {
    params: {
      conversationID: conversationId,
      page,
      size,
      ...(includeInternal ? { includeInternal: true } : {}),
    },
  })
  return unwrapMessageService(res)
}

export async function searchMessages({ conversationId, query, page = 0, size = 20, includeInternal = false } = {}) {
  const res = await apiClient.get(msUrl('/message/search'), {
    params: {
      conversationID: conversationId,
      query,
      page,
      size,
      ...(includeInternal ? { includeInternal: true } : {}),
    },
  })
  return unwrapMessageService(res)
}

export async function postMessage(payload) {
  const res = await apiClient.post(msUrl('/message'), payload)
  return unwrapMessageService(res)
}

export async function markMessageRead(messageId) {
  const res = await apiClient.patch(msUrl(`/message/${messageId}/read`))
  return unwrapMessageService(res)
}

export async function postInternalNote(conversationId, payload) {
  const res = await apiClient.post(msUrl(`/message/${conversationId}/internal-note`), payload)
  return unwrapMessageService(res)
}

export async function patchAssign(conversationId, adminId) {
  const res = await apiClient.patch(msUrl(`/conversation/${conversationId}/assign/${adminId}`))
  return unwrapMessageService(res)
}

export async function patchStatus(conversationId, status) {
  const res = await apiClient.patch(msUrl(`/conversation/${conversationId}/status/${status}`))
  return unwrapMessageService(res)
}

export async function patchPriority(conversationId, priority) {
  const res = await apiClient.patch(msUrl(`/conversation/${conversationId}/priority/${priority}`))
  return unwrapMessageService(res)
}

export async function closeConversation(conversationId) {
  const res = await apiClient.patch(msUrl(`/conversation/${conversationId}/close`))
  return unwrapMessageService(res)
}
