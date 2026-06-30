import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { pinia } from '@app/plugins/pinia'
import { useAuthStore } from '@features/auth/store/authStore'
import { cartApi } from '@shared/lib/api/services'
import { i18n, normalizeLocale } from '@shared/i18n'
import { clampPurchaseQuantity, resolveStockLimit } from '../lib/stockGuards'

const STORAGE_KEY = 'furnisight-cart-store-v4'
const LEGACY_STORAGE_KEYS = [
  'furnisight-cart-store-v1',
  'furnisight-cart-store-v2',
  'furnisight-cart-store-v3',
]

function getCurrentLocale() {
  return normalizeLocale(i18n.global.locale.value)
}

function cloneItems(items = []) {
  return items.map((item) => ({
    ...item,
    qty: clampPurchaseQuantity(item.qty ?? item.quantity ?? 1, item),
    quantity: clampPurchaseQuantity(item.qty ?? item.quantity ?? 1, item),
    colors: Array.isArray(item.colors) ? [...item.colors] : [],
    sizes: Array.isArray(item.sizes) ? [...item.sizes] : [],
    variants: Array.isArray(item.variants)
      ? item.variants.map((variant) => ({ ...variant }))
      : [],
  }))
}

function isApiBackedCartLine(item = {}) {
  if (!item || typeof item !== 'object') return false

  const lineId = String(item.id ?? '')
  const productId = String(item.productId ?? '')

  if (!lineId.includes('::')) return false
  if (!productId || productId.startsWith('cart-')) return false

  return true
}

export const useCartStore = defineStore('cart', () => {
  const authStore = useAuthStore(pinia)
  const items = ref([])
  const loading = ref(false)
  const hydrated = ref(false)
  const hydratedLocale = ref('')
  let hydratePromise = null

  function restorePersistedItems() {
    if (typeof window === 'undefined') return false
    const currentLocale = getCurrentLocale()

    try {
      for (const storageKey of LEGACY_STORAGE_KEYS) {
        window.localStorage.removeItem(storageKey)
      }

      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return false

      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed?.items)) return false
      if (parsed.locale !== currentLocale) {
        window.localStorage.removeItem(STORAGE_KEY)
        return false
      }
      if (!parsed.items.every(isApiBackedCartLine)) {
        window.localStorage.removeItem(STORAGE_KEY)
        return false
      }

      items.value = cloneItems(parsed.items)
      hydrated.value = true
      hydratedLocale.value = currentLocale
      return true
    } catch {
      return false
    }
  }

  function persistItems() {
    if (typeof window === 'undefined') return

    try {
      const currentLocale = getCurrentLocale()
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          locale: currentLocale,
          items: items.value,
        }),
      )
      hydratedLocale.value = currentLocale
    } catch {
      // Ignore storage write failures.
    }
  }

  function resetCartState() {
    items.value = []
    loading.value = false
    hydrated.value = false
    hydratedLocale.value = ''
    hydratePromise = null

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
      for (const storageKey of LEGACY_STORAGE_KEYS) {
        window.localStorage.removeItem(storageKey)
      }
    }
  }

  restorePersistedItems()

  const lineCount = computed(() => items.value.length)
  const itemCount = computed(() =>
    items.value.reduce((count, line) => count + (Number(line.qty) || 0), 0),
  )
  const totalAmount = computed(() =>
    items.value.reduce(
      (total, line) => total + (Number(line.price) || 0) * (Number(line.qty) || 0),
      0,
    ),
  )
  const room3dProductIds = computed(() =>
    items.value
      .map((item) => item.room3dProductId)
      .filter((value, index, arr) => Number.isFinite(value) && arr.indexOf(value) === index),
  )



  async function hydrate(options = {}) {
    const { force = false } = options
    const currentLocale = getCurrentLocale()

    if (hydrated.value && hydratedLocale.value === currentLocale && !force) return items.value
    if (hydratePromise && !force) return hydratePromise

    hydratePromise = (async () => {
      loading.value = true

      try {
        const response = await cartApi.getCart(undefined, authStore.isAdmin ? { skipAuth: true } : {})
        items.value = cloneItems(response?.data?.items ?? [])
        persistItems()
        hydrated.value = true
        hydratedLocale.value = currentLocale
        return items.value
      } catch (error) {
        if (typeof window !== 'undefined' && error?.response?.status === 401) {
          resetCartState()
          if (!authStore.isAdmin) {
            authStore.logout()
          }
          return items.value
        }

        hydrated.value = items.value.length > 0
        throw error
      } finally {
        loading.value = false
        hydratePromise = null
      }
    })()

    return hydratePromise
  }

  async function ensureHydrated(options = {}) {
    return hydrate(options)
  }

  async function addItem(productOrLine, options = {}) {
    loading.value = true

    try {
      const payload = {
        ...(productOrLine ?? {}),
        ...(options ?? {}),
      }
      const existingQty = items.value.find((item) =>
        String(item.productId ?? '') === String(payload.productId ?? '') &&
        String(item.variantId ?? '') === String(payload.variantId ?? ''),
      )?.qty ?? 0
      const stockLimit = resolveStockLimit(payload)
      const requestedQty = Math.max(1, Number(payload.quantity ?? payload.qty ?? 1) || 1)
      const allowedAddQty = stockLimit == null
        ? requestedQty
        : Math.max(0, stockLimit - Number(existingQty || 0))

      if (payload.outOfStock || (stockLimit != null && stockLimit <= 0)) {
        throw new Error('out_of_stock')
      }

      if (stockLimit != null && allowedAddQty <= 0) {
        throw new Error('stock_limit_reached')
      }

      payload.quantity = stockLimit == null ? requestedQty : Math.min(requestedQty, allowedAddQty)
      payload.qty = payload.quantity
      const response = await cartApi.addToCart(payload)
      items.value = cloneItems(response?.data?.items ?? [])
      persistItems()
      hydrated.value = true
      return items.value
    } finally {
      loading.value = false
    }
  }

  async function updateItem(lineId, patch) {
    loading.value = true

    try {
      const response = await cartApi.updateCartItem(lineId, patch)
      items.value = cloneItems(response?.data?.items ?? [])
      persistItems()
      hydrated.value = true
      return response?.data?.item ?? null
    } finally {
      loading.value = false
    }
  }

  async function updateQty(lineId, nextQty) {
    const line = items.value.find((item) => item.id === lineId)
    return updateItem(lineId, { qty: clampPurchaseQuantity(nextQty, line) })
  }

  async function removeItem(lineId) {
    loading.value = true

    try {
      const response = await cartApi.removeCartItem(lineId)
      items.value = cloneItems(response?.data?.items ?? [])
      persistItems()
      hydrated.value = true
      return items.value
    } finally {
      loading.value = false
    }
  }

  async function clearCart() {
    loading.value = true

    try {
      const response = await cartApi.clearCart()
      items.value = cloneItems(response?.data?.items ?? [])
      persistItems()
      hydrated.value = true
      return items.value
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    hydrated,
    lineCount,
    itemCount,
    totalAmount,
    room3dProductIds,
    hydrate,
    ensureHydrated,
    addItem,
    updateItem,
    updateQty,
    removeItem,
    clearCart,
    resetCartState,
  }
})
