import { apiClient } from '../../client'
import { withApiLocale } from '../locale'

const baseUrl = '/promotions'

class PromotionsApi {
  getPublicVouchers(params) {
    return apiClient.get(`${baseUrl}/vouchers/public`, { params: withApiLocale(params) })
  }

  getUserVouchers(params) {
    return apiClient.get(`${baseUrl}/vouchers/user`, { params: withApiLocale(params) })
  }

  saveVoucher(code) {
    return apiClient.post(`${baseUrl}/vouchers/save`, null, {
      params: { code },
    })
  }

  recommendVouchers(payload) {
    return apiClient.post(`${baseUrl}/vouchers/recommend`, payload, {
      params: withApiLocale(),
    })
  }

  getCombos(params) {
    return apiClient.get(`${baseUrl}/combos`, { params: withApiLocale(params), skipAuth: true })
  }
}

export const promotionsApi = new PromotionsApi()
