import { i18n } from '../../i18n'




const TECHNICAL_MESSAGE_PATTERNS = [
  /internal server error/i,
  /unexpected error/i,
  /java\./i,
  /exception/i,
  /stacktrace/i,
  /sql/i,
  /grpc/i,
  /failed to/i,
]

function normalizeCode(code, status) {
  if (typeof code === 'string' && code.trim()) return code.trim()
  if (typeof code === 'number' && MESSAGE_BY_STATUS[code]) return statusCodeToCode(code)
  if (typeof status === 'number') return statusCodeToCode(status)
  return 'UNKNOWN_ERROR'
}

function pickServerMessage(data, error) {
  if (typeof data?.message === 'string') return data.message
  if (typeof data?.detail === 'string') return data.detail
  if (typeof data?.error === 'string') return data.error
  if (typeof data?.error?.message === 'string') return data.error.message
  if (typeof data?.errors?.[0]?.message === 'string') return data.errors[0].message
  return error?.message
}

function statusCodeToCode(status) {
  const codeByStatus = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
    504: 'GATEWAY_TIMEOUT',
  }
  return codeByStatus[status] || `HTTP_${status}`
}

function isTechnicalMessage(message) {
  return TECHNICAL_MESSAGE_PATTERNS.some((pattern) => pattern.test(message))
}

function pickFriendlyMessage({ code, status, serverMessage, fallbackMessage }) {
  const trimmed = typeof serverMessage === 'string' ? serverMessage.trim() : ''
  if (trimmed && !isTechnicalMessage(trimmed)) return trimmed

  const { t, te } = i18n.global
  
  const codeKey = `api.errors.${code}`
  if (te(codeKey)) return t(codeKey)

  const statusKey = `api.errors.status.${status}`
  if (te(statusKey)) return t(statusKey)

  return fallbackMessage || t('api.errors.GENERIC')
}

export function normalizeApiError(error, fallbackMessage) {
  const response = error?.response
  const data = response?.data ?? {}
  const status = Number(data.status || response?.status || 0) || undefined

  if (!response) {
    const isTimeout = error?.code === 'ECONNABORTED' || /timeout/i.test(error?.message || '')
    const message = isTimeout ? i18n.global.t('api.errors.TIMEOUT') : i18n.global.t('api.errors.NETWORK')
    return {
      code: isTimeout ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
      status,
      message,
      serverMessage: error?.message,
      details: null,
      path: error?.config?.url,
    }
  }

  const code = normalizeCode(data.code, status)
  const serverMessage = pickServerMessage(data, error)
  const message = pickFriendlyMessage({
    code,
    status,
    serverMessage,
    fallbackMessage,
  })

  return {
    code,
    status,
    message,
    serverMessage: serverMessage || error?.message,
    details: data.details || data.errors || null,
    path: data.path || error?.config?.url,
  }
}

export function attachNormalizedApiError(error, fallbackMessage) {
  if (!error || typeof error !== 'object') {
    error = new Error(fallbackMessage || i18n.global.t('api.errors.GENERIC'))
  }

  const appError = normalizeApiError(error, fallbackMessage)
  error.appError = appError
  error.code = appError.code
  error.friendlyMessage = appError.message
  error.message = appError.message

  if (error.response) {
    const originalData = error.response.data && typeof error.response.data === 'object'
      ? error.response.data
      : {}
    error.response.data = {
      ...originalData,
      status: appError.status,
      code: appError.code,
      message: appError.message,
      serverMessage: appError.serverMessage,
      details: appError.details,
      path: appError.path,
    }
  }

  return error
}

export function getApiErrorMessage(error, fallbackMessage = i18n.global.t('api.errors.GENERIC')) {
  return error?.friendlyMessage
    || error?.appError?.message
    || error?.response?.data?.message
    || fallbackMessage
}
