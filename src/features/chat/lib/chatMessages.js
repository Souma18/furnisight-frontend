export function createMessageId(prefix = 'msg') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function createLocalMessage(message) {
  return {
    id: message.id ?? createMessageId(),
    role: message.role,
    content: message.content ?? '',
    products: message.products ?? [],
    createdAt: message.createdAt ?? new Date().toISOString(),
    clientTempId: message.clientTempId,
  }
}

export function appendMessage(messages, message) {
  messages.value.push(createLocalMessage(message))
}

export function upsertMessage(messages, mapped) {
  const byId = messages.value.findIndex((message) => message.id === mapped.id)
  if (byId !== -1) {
    messages.value[byId] = mapped
    return
  }

  if (mapped.clientTempId) {
    const byTemp = messages.value.findIndex((message) => message.clientTempId === mapped.clientTempId)
    if (byTemp !== -1) {
      messages.value[byTemp] = mapped
      return
    }
  }

  if (mapped.role === 'user') {
    const byContent = messages.value.findIndex(
      (message) => message.role === 'user' && message.clientTempId && message.content === mapped.content,
    )
    if (byContent !== -1) {
      messages.value[byContent] = mapped
      return
    }
  }

  appendMessage(messages, mapped)
}
