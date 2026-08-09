import { apiClient } from '../../client'

const baseUrl = '/promotions'

class PromotionsApi {
  getPublicVouchers(params) {
    return apiClient.get(`${baseUrl}/vouchers/public`, { params })
  }

  getUserVouchers(params) {
    return apiClient.get(`${baseUrl}/vouchers/user`, { params })
  }

  saveVoucher(code) {
    return apiClient.post(`${baseUrl}/vouchers/save`, null, {
      params: { code },
    })
  }

  recommendVouchers(payload) {
    return apiClient.post(`${baseUrl}/vouchers/recommend`, payload)
  }

  getCombos(params) {
    return apiClient.get(`${baseUrl}/combos`, { params, skipAuth: true })
  }
}

export const promotionsApi = new PromotionsApi()
