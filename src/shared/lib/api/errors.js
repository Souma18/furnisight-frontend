const GENERIC_ERROR_MESSAGE = 'Có lỗi xảy ra. Vui lòng thử lại sau.'
const NETWORK_ERROR_MESSAGE = 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.'
const TIMEOUT_ERROR_MESSAGE = 'Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.'

const MESSAGE_BY_CODE = {
  ACCOUNT_NOT_FOUND: 'Không tìm thấy tài khoản.',
  ACCOUNT_ALREADY_EXISTS: 'Tài khoản đã tồn tại.',
  ACCOUNT_BANNED: 'Tài khoản đã bị khóa.',
  ACCOUNT_TEMPORARILY_LOCKED: 'Tài khoản đang tạm khóa. Vui lòng thử lại sau.',
  ACCOUNT_NOT_VERIFIED: 'Tài khoản chưa được xác minh.',
  INVALID_PASSWORD: 'Mật khẩu không chính xác.',
  INVALID_TOKEN: 'Mã xác thực không hợp lệ hoặc đã hết hạn.',
  TOKEN_EXPIRED: 'Phiên xác thực đã hết hạn. Vui lòng thử lại.',
  TOKEN_ALREADY_USED: 'Mã xác thực đã được sử dụng.',
  NOT_ENOUGH_PERMISSION: 'Bạn không có quyền thực hiện thao tác này.',

  VALIDATION_ERROR: 'Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.',
  BAD_REQUEST: 'Thông tin gửi lên chưa hợp lệ.',
  MISSING_PARAMETER: 'Thiếu thông tin bắt buộc.',
  UNAUTHORIZED: 'Vui lòng đăng nhập để tiếp tục.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
  CONFLICT: 'Dữ liệu đã tồn tại hoặc đang bị trùng.',
  INTERNAL_SERVER_ERROR: GENERIC_ERROR_MESSAGE,
  INTERNAL_ERROR: GENERIC_ERROR_MESSAGE,

  PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm.',
  CATEGORY_NOT_FOUND: 'Không tìm thấy danh mục.',
  PRODUCT_VARIANT_NOT_FOUND: 'Không tìm thấy phiên bản sản phẩm.',
  DUPLICATE_PRODUCT_NAME: 'Tên sản phẩm đã tồn tại.',
  DUPLICATE_CATEGORY_SLUG: 'Đường dẫn danh mục đã tồn tại.',
  DUPLICATE_CATEGORY_NAME: 'Tên danh mục đã tồn tại.',
  INSUFFICIENT_STOCK: 'Sản phẩm không đủ tồn kho.',
  INVALID_STOCK_QUANTITY: 'Số lượng tồn kho không hợp lệ.',
  INVALID_PRICE: 'Giá sản phẩm không hợp lệ.',
  REVIEW_NOT_FOUND: 'Không tìm thấy đánh giá.',

  ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng.',
  INVALID_ORDER_STATUS: 'Trạng thái đơn hàng không hợp lệ.',
  INVALID_PAYMENT_METHOD: 'Phương thức thanh toán không hợp lệ.',
  INVALID_PAYMENT_AMOUNT: 'Số tiền thanh toán không hợp lệ.',

  MEDIA_NOT_FOUND: 'Không tìm thấy tệp đã tải lên.',
  MEDIA_UPLOAD_FAILED: 'Không thể tải tệp lên. Vui lòng thử lại.',

  MESSAGE_NOT_FOUND: 'Không tìm thấy cuộc trò chuyện hoặc tin nhắn.',
  MESSAGE_FAILED: 'Không thể gửi tin nhắn. Vui lòng thử lại.',

  NOTIFICATION_TEMPLATE_NOT_FOUND: 'Không tìm thấy mẫu thông báo.',
  INBOX_MESSAGE_NOT_FOUND: 'Không tìm thấy thông báo.',
}

const MESSAGE_BY_STATUS = {
  400: 'Thông tin gửi lên chưa hợp lệ.',
  401: 'Vui lòng đăng nhập để tiếp tục.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu yêu cầu.',
  409: 'Dữ liệu đã tồn tại hoặc đang bị trùng.',
  413: 'Tệp tải lên quá lớn.',
  415: 'Định dạng tệp không được hỗ trợ.',
  422: 'Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.',
  429: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.',
  500: GENERIC_ERROR_MESSAGE,
  502: 'Dịch vụ đang gián đoạn. Vui lòng thử lại sau.',
  503: 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.',
  504: 'Dịch vụ phản hồi quá lâu. Vui lòng thử lại sau.',
}

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

  if (MESSAGE_BY_CODE[code]) return MESSAGE_BY_CODE[code]

  if (MESSAGE_BY_STATUS[status]) return MESSAGE_BY_STATUS[status]

  return fallbackMessage || GENERIC_ERROR_MESSAGE
}

export function normalizeApiError(error, fallbackMessage) {
  const response = error?.response
  const data = response?.data ?? {}
  const status = Number(data.status || response?.status || 0) || undefined

  if (!response) {
    const isTimeout = error?.code === 'ECONNABORTED' || /timeout/i.test(error?.message || '')
    const message = isTimeout ? TIMEOUT_ERROR_MESSAGE : NETWORK_ERROR_MESSAGE
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
    error = new Error(fallbackMessage || GENERIC_ERROR_MESSAGE)
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

export function getApiErrorMessage(error, fallbackMessage = GENERIC_ERROR_MESSAGE) {
  return error?.friendlyMessage
    || error?.appError?.message
    || error?.response?.data?.message
    || fallbackMessage
}
