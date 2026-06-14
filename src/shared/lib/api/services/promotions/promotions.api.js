import { apiClient } from '../../client'

const baseUrl = '/promotions'

class PromotionsApi {
  getPublicVouchers(params) {
    return apiClient.get(`${baseUrl}/vouchers/public`, { params, skipAuth: true })
  }

  getUserVouchers(params) {
    return apiClient.get(`${baseUrl}/vouchers/user`, { params })
  }

  saveVoucher(code) {
    return apiClient.post(`${baseUrl}/vouchers/save`, null, {
      params: { code },
    })
  }

  getCombos(params) {
    return apiClient.get(`${baseUrl}/combos`, { params, skipAuth: true })
  }
}

export const promotionsApi = new PromotionsApi()
