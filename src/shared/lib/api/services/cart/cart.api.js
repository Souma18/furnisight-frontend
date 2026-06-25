import { apiClient } from '../../client'
import { CartResponse, resolveCartImageUrl } from './cart.model'

const baseUrl = '/cart/carts'

function parseCartItemId(cartItemId) {
  const [productId = '', variantId = ''] = String(cartItemId ?? '').split('::')
  return {
    productId,
    variantId: variantId || null,
  }
}

function toAddCartPayload(payload = {}) {
  return {
    productId: payload.productId ?? payload.detailId ?? payload.id ?? '',
    variantId: payload.variantId ?? null,
    name: payload.name ?? '',
    price: payload.price ?? 0,
    imageUrl: resolveCartImageUrl(payload),
    quantity: Math.max(1, Number(payload.quantity ?? payload.qty ?? 1) || 1),
  }
}

function toUpdateCartPayload(payload = {}) {
  return {
    quantity: Math.max(1, Number(payload.quantity ?? payload.qty ?? 1) || 1),
    variantId: payload.variantId ?? null,
  }
}

function toCartResponse(response) {
  if (response.data) {
    response.data = new CartResponse(response.data)
  }
  return response
}

class CartApi {
  async getCart(params, config = {}) {
    const response = await apiClient.get(baseUrl, { params, ...config })
    return toCartResponse(response)
  }

  async addToCart(payload) {
    const response = await apiClient.post(`${baseUrl}/items`, toAddCartPayload(payload))
    return toCartResponse(response)
  }

  async updateCartItem(cartItemId, payload) {
    const { productId, variantId } = parseCartItemId(cartItemId)
    const response = await apiClient.put(`${baseUrl}/items/${productId}`, toUpdateCartPayload(payload), {
      params: variantId ? { variantId } : undefined,
    })
    return toCartResponse(response)
  }

  async removeCartItem(cartItemId) {
    const { productId, variantId } = parseCartItemId(cartItemId)
    const response = await apiClient.delete(`${baseUrl}/items/${productId}`, {
      params: variantId ? { variantId } : undefined,
    })
    return toCartResponse(response)
  }

  async clearCart() {
    const response = await apiClient.delete(baseUrl)
    return toCartResponse(response)
  }
}

export const cartApi = new CartApi()
