import { apiClient } from './client'
import { registerApiInterceptors } from './interceptors'

registerApiInterceptors()

export { apiClient }
export { registerApiInterceptors }
export { getApiErrorMessage, normalizeApiError } from './errors'
