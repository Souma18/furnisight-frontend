import { defineStore, storeToRefs } from 'pinia'
import { ref, computed, watch } from 'vue'
import { usersApi } from '@shared/lib/api/services'
import { FavoriteResponse } from '@shared/lib/api/services/users/users.model'
import { useLocaleStore } from '@shared/stores/localeStore'

export const useWishlistStore = defineStore('accountWishlist', () => {
  const localeStore = useLocaleStore()
  const { locale } = storeToRefs(localeStore)
  const wishlist = ref([])
  const wishlistHydrated = ref(false)
  let wishlistPromise = null

  const wishlistProductIds = computed(() =>
    wishlist.value
      .map((item) => item.productId || item.id)
      .filter(Boolean),
  )

  function hasFavoriteProduct(productId) {
    if (!productId) return false
    return wishlistProductIds.value.includes(productId)
  }

  function upsertFavorite(rawFavorite) {
    const favorite = rawFavorite instanceof FavoriteResponse
      ? rawFavorite
      : new FavoriteResponse(rawFavorite)

    if (!favorite.productId) return favorite

    const existingIndex = wishlist.value.findIndex((item) =>
      (item.productId || item.id) === favorite.productId,
    )

    if (existingIndex >= 0) {
      wishlist.value = wishlist.value.map((item, index) =>
        index === existingIndex ? favorite : item,
      )
      return favorite
    }

    wishlist.value = [favorite, ...wishlist.value]
    return favorite
  }

  async function loadWishlist(options = {}) {
    const { force = false } = options

    if (wishlistHydrated.value && !force) return wishlist.value
    if (wishlistPromise && !force) return wishlistPromise

    wishlistPromise = (async () => {
      const { data } = await usersApi.getFavorites()
      wishlist.value = Array.isArray(data)
        ? data.map((item) => new FavoriteResponse(item))
        : []
      wishlistHydrated.value = true
      return wishlist.value
    })()

    try {
      return await wishlistPromise
    } finally {
      wishlistPromise = null
    }
  }

  async function addFavorite(productId) {
    if (!productId) return null

    const existing = wishlist.value.find((item) =>
      (item.productId || item.id) === productId,
    )
    if (existing) return existing

    const { data } = await usersApi.addFavorite(productId)
    return upsertFavorite(data)
  }

  async function removeFavorite(productId) {
    if (!productId) return null

    const existingIndex = wishlist.value.findIndex((item) =>
      (item.productId || item.id) === productId,
    )
    if (existingIndex < 0) return true

    await usersApi.removeFavorite(productId)
    wishlist.value = wishlist.value.filter((item) =>
      (item.productId || item.id) !== productId,
    )
    return true
  }

  function resetWishlistState() {
    wishlist.value = []
    wishlistHydrated.value = false
    wishlistPromise = null
  }

  watch(locale, () => {
    if (!wishlistHydrated.value) return
    loadWishlist({ force: true }).catch(() => null)
  })

  return {
    wishlist,
    wishlistHydrated,
    wishlistProductIds,
    hasFavoriteProduct,
    upsertFavorite,
    loadWishlist,
    addFavorite,
    removeFavorite,
    resetWishlistState,
  }
})
