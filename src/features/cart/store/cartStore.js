import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@features/auth/store/authStore'
import {
  addCartItem,
  clearCart as clearCartRequest,
  getCart,
  removeCartItem,
  updateCartItem,
} from '../api/cartApi'

const STORAGE_KEY = 'luxnest-cart-store-v2'
const LEGACY_STORAGE_KEYS = ['luxnest-cart-store-v1']

function cloneItems(items = []) {
  return items.map((item) => ({
    ...item,
    colors: Array.isArray(item.colors) ? [...item.colors] : [],
    sizes: Array.isArray(item.sizes) ? [...item.sizes] : [],
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
  const authStore = useAuthStore()
  const items = ref([])
  const loading = ref(false)
  const hydrated = ref(false)
  let hydratePromise = null

  function restorePersistedItems() {
    if (typeof window === 'undefined') return false

    try {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        window.localStorage.removeItem(legacyKey)
      }

      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return false

      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed?.items)) return false
      if (!parsed.items.every(isApiBackedCartLine)) {
        window.localStorage.removeItem(STORAGE_KEY)
        return false
      }

      items.value = cloneItems(parsed.items)
      hydrated.value = true
      return true
    } catch {
      return false
    }
  }

  function persistItems() {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          items: items.value,
        }),
      )
    } catch {
      // Ignore storage write failures.
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

  watch(
    items,
    () => {
      persistItems()
    },
    { deep: true },
  )

  async function hydrate(options = {}) {
    const { force = false } = options

    if (hydrated.value && !force) return items.value
    if (hydratePromise && !force) return hydratePromise

    hydratePromise = (async () => {
      loading.value = true

      try {
        const response = await getCart()
        items.value = cloneItems(response?.data?.items ?? [])
        hydrated.value = true
        return items.value
      } catch (error) {
        if (typeof window !== 'undefined' && error?.response?.status === 401) {
          items.value = []
          hydrated.value = false
          window.localStorage.removeItem(STORAGE_KEY)
          authStore.logout()
          return items.value
        }
        throw error
      } finally {
        loading.value = false
        hydratePromise = null
      }
    })()

    return hydratePromise
  }

  async function ensureHydrated() {
    return hydrate()
  }

  async function addItem(productOrLine, options = {}) {
    loading.value = true

    try {
      const payload = {
        ...(productOrLine ?? {}),
        ...(options ?? {}),
      }
      const response = await addCartItem(payload)
      items.value = cloneItems(response?.data?.items ?? [])
      hydrated.value = true
      return items.value
    } finally {
      loading.value = false
    }
  }

  async function updateItem(lineId, patch) {
    loading.value = true

    try {
      const response = await updateCartItem(lineId, patch)
      items.value = cloneItems(response?.data?.items ?? [])
      hydrated.value = true
      return response?.data?.item ?? null
    } finally {
      loading.value = false
    }
  }

  async function updateQty(lineId, nextQty) {
    return updateItem(lineId, { qty: Math.max(1, Number(nextQty) || 1) })
  }

  async function removeItem(lineId) {
    loading.value = true

    try {
      const response = await removeCartItem(lineId)
      items.value = cloneItems(response?.data?.items ?? [])
      hydrated.value = true
      return items.value
    } finally {
      loading.value = false
    }
  }

  async function clearCart() {
    loading.value = true

    try {
      const response = await clearCartRequest()
      items.value = cloneItems(response?.data?.items ?? [])
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
  }
})
