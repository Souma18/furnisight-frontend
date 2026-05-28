import { apiClient } from '../../client'

const authBaseUrl = '/users/auth'

class AuthApi {
  login(payload) { return apiClient.post(`${authBaseUrl}/login`, payload, { skipAuth: true }) }
  loginGoogle() { return apiClient.get(`${authBaseUrl}/login/google`, { skipAuth: true }) }
  register(payload) { return apiClient.post(`${authBaseUrl}/register`, payload, { skipAuth: true }) }
  logout(payload) { return apiClient.post(`${authBaseUrl}/logout`, payload) }
  logoutAll() { return apiClient.post(`${authBaseUrl}/logout-all`) }
  renewAccessToken(payload) { return apiClient.post(`${authBaseUrl}/refresh-token`, payload, { skipAuth: true }) }
  verifyEmail(otpCode) {
    return apiClient.get(`${authBaseUrl}/verify`, { params: { otpCode }, skipAuth: true })
  }

  verify(payload) { return apiClient.post('/auth/verify', payload) }
  requestVerification(payload) { return apiClient.post('/auth/verify/request', payload) }
  
  changePassword(payload) { return apiClient.post('/auth/password/change', payload) }
  forgotPassword(payload) { return apiClient.post('/auth/password/forgot', payload, { skipAuth: true }) }
  resetPassword(payload) { return apiClient.post('/auth/password/reset', payload, { skipAuth: true }) }
  verifyResetPasswordCode(payload) { return apiClient.post('/auth/password/verify', payload, { skipAuth: true }) }
  
  deleteAccount() { return apiClient.delete('/auth') }
}

export const authApi = new AuthApi()
