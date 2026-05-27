import axios from 'axios'

const messageServiceClient = axios.create({
  baseURL: import.meta.env.VITE_MESSAGE_SERVICE_BASE_URL ?? '',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const PREFIX = import.meta.env.VITE_MESSAGE_SERVICE_PREFIX ?? ''

export function unwrapMessageService(response) {
  const body = response?.data ?? response
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
  const res = await messageServiceClient.post(msUrl('/conversation/create'), payload)
  return unwrapMessageService(res)
}

export async function getConversationsByUser(userId) {
  const res = await messageServiceClient.get(msUrl(`/conversation/all/${userId}`))
  return unwrapMessageService(res)
}

export async function getConversation(conversationId) {
  const res = await messageServiceClient.get(msUrl(`/conversation/${conversationId}`))
  return unwrapMessageService(res)
}

export async function getAdminInbox(params = {}) {
  const res = await messageServiceClient.get(msUrl('/conversation/admin/inbox'), { params })
  return unwrapMessageService(res)
}

export async function getMessages({ conversationId, page = 0, size = 50, includeInternal = false } = {}) {
  const res = await messageServiceClient.get(msUrl('/message'), {
    params: {
      conversationID: conversationId,
      page,
      size,
      ...(includeInternal ? { includeInternal: true } : {}),
    },
  })
  return unwrapMessageService(res)
}

export async function markMessageRead(messageId) {
  const res = await messageServiceClient.patch(msUrl(`/message/${messageId}/read`))
  return unwrapMessageService(res)
}

export async function postInternalNote(conversationId, payload) {
  const res = await messageServiceClient.post(msUrl(`/message/${conversationId}/internal-note`), payload)
  return unwrapMessageService(res)
}

export async function patchAssign(conversationId, adminId) {
  const res = await messageServiceClient.patch(msUrl(`/conversation/${conversationId}/assign/${adminId}`))
  return unwrapMessageService(res)
}

export async function patchStatus(conversationId, status) {
  const res = await messageServiceClient.patch(msUrl(`/conversation/${conversationId}/status/${status}`))
  return unwrapMessageService(res)
}

export async function patchPriority(conversationId, priority) {
  const res = await messageServiceClient.patch(msUrl(`/conversation/${conversationId}/priority/${priority}`))
  return unwrapMessageService(res)
}

export async function closeConversation(conversationId) {
  const res = await messageServiceClient.patch(msUrl(`/conversation/${conversationId}/close`))
  return unwrapMessageService(res)
}
