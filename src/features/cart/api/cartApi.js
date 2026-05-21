import { apiClient } from '@shared/lib/api'
import { CartModel } from '../models/cart'

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
    imageUrl: payload.imageUrl ?? '',
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
    response.data = new CartModel(response.data)
  }

  return response
}
const baseUrl = '/cart/carts'

export async function getCart(params) {
  const response = await apiClient.get(baseUrl, { params })
  return toCartResponse(response)
}

export async function addCartItem(payload) {
  const response = await apiClient.post(`${baseUrl}/items`, toAddCartPayload(payload))
  return toCartResponse(response)
}

export async function updateCartItem(cartItemId, payload) {
  const { productId, variantId } = parseCartItemId(cartItemId)
  const response = await apiClient.put(`${baseUrl}/items/${productId}`, toUpdateCartPayload(payload), {
    params: variantId ? { variantId } : undefined,
  })
  return toCartResponse(response)
}

export async function removeCartItem(cartItemId) {
  const { productId, variantId } = parseCartItemId(cartItemId)
  const response = await apiClient.delete(`${baseUrl}/items/${productId}`, {
    params: variantId ? { variantId } : undefined,
  })
  return toCartResponse(response)
}

export async function clearCart() {
  const response = await apiClient.delete(baseUrl)
  return toCartResponse(response)
}
