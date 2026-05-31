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

  verify(payload) { return apiClient.post(`${authBaseUrl}/verify`, payload, { skipAuth: true }) }
  requestVerification(payload) { return apiClient.post(`${authBaseUrl}/verify/request`, payload, { skipAuth: true }) }
  
  changePassword(payload) { return apiClient.post(`${authBaseUrl}/password/change`, payload) }
  forgotPassword(payload) { return apiClient.post(`${authBaseUrl}/password/forgot`, payload, { skipAuth: true }) }
  resetPassword(payload) { return apiClient.post(`${authBaseUrl}/password/reset`, payload, { skipAuth: true }) }
  verifyResetPasswordCode(payload) { return apiClient.post(`${authBaseUrl}/password/verify`, payload, { skipAuth: true }) }
  
  deleteAccount() { return apiClient.delete(`${authBaseUrl}`) }
}

export const authApi = new AuthApi()
