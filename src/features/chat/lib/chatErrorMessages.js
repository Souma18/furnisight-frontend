import { getApiErrorMessage } from '@shared/lib/api/errors'

function serviceNameFromPath(path = '') {
  if (path.includes('/media')) return 'media-service'
  if (path.includes('/messages')) return 'message-service'
  if (path.includes('/users')) return 'user-service'
  return ''
}

function compactPath(path = '') {
  if (!path) return ''
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    const url = new URL(path, origin)
    return url.pathname
  } catch {
    return String(path).split('?')[0]
  }
}

export function formatChatError(error, fallbackMessage) {
  const appError = error?.appError || error?.response?.data || {}
  const status = appError.status || error?.response?.status
  const code = appError.code || error?.code
  const path = appError.path || error?.config?.url || ''
  const service = serviceNameFromPath(path)
  const message = getApiErrorMessage(error, fallbackMessage)
  const details = []

  if (status) details.push(`HTTP ${status}`)
  if (code && !String(code).startsWith('HTTP_')) details.push(String(code))
  if (service) details.push(service)

  const shortPath = compactPath(path)
  if (shortPath) details.push(shortPath)

  return details.length ? `${message} (${details.join(' · ')})` : message
}
