import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchAccountOverviewMock,
  saveAddressMock,
  setDefaultAddressMock,
  uploadAvatarMock,
} from '../api/accountMockApi'
import {
  ORDER_DETAIL_SEED,
  buildOrderDetailFromCheckout,
  buildOrderListItemFromCheckout,
} from '../mock/ordersMockData'
import { favoriteProduct, unfavoriteProduct, getWishlist } from '../api/accountApi'
import { FavoriteProductModel } from '../models/favoriteProduct'
import { getProfile, updateProfile } from '../api/profileApi'
// TODO(BE): replace mock imports with accountApi calls in production

function sortAddressesByDefault(list) {
  return [...list].sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
}

export const useAccountStore = defineStore('account', () => {
  const loading = ref(false)
  const profile = ref(null)
  const addresses = ref([])
  const orders = ref([])
  const orderDetails = ref({ ...ORDER_DETAIL_SEED })
  const wishlist = ref([])
  const wishlistHydrated = ref(false)
  const settings = ref({})
  const projects = ref([])
  let wishlistPromise = null

  const stats = computed(() => ({
    totalOrders: orders.value.length,
    deliveringOrders: orders.value.filter((order) => order.status === 'delivering').length,
    wishlistCount: wishlist.value.length,
  }))

  const defaultAddress = computed(
    () => addresses.value.find((item) => item.isDefault) ?? addresses.value[0] ?? null,
  )

  async function hydrate() {
    loading.value = true
    try {
      // Load real profile from backend
      const profileRes = await getProfile().catch(() => null)
      
      const data = await fetchAccountOverviewMock()
      
      if (profileRes && profileRes.data) {
        // profile.value = profileRes.data
        const beProfile = profileRes.data
        const merged = { ...data.profile, ...beProfile }
        profile.value = merged
      } else {
        profile.value = data.profile // fallback to mock if backend not ready
      }
      addresses.value = sortAddressesByDefault(data.addresses)
      orders.value = data.orders
      await loadWishlist().catch(() => {
        wishlist.value = []
      })
      settings.value = data.settings
      projects.value = data.projects
    } finally {
      loading.value = false
    }
  }

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
    const favorite = rawFavorite instanceof FavoriteProductModel
      ? rawFavorite
      : new FavoriteProductModel(rawFavorite)

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
      const { data } = await getWishlist()
      wishlist.value = Array.isArray(data)
        ? data.map((item) => new FavoriteProductModel(item))
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

    const { data } = await favoriteProduct(productId)
    return upsertFavorite(data)
  }

  async function removeFavorite(productId) {
    if (!productId) return null

    const existingIndex = wishlist.value.findIndex((item) =>
      (item.productId || item.id) === productId,
    )
    if (existingIndex < 0) return true

    await unfavoriteProduct(productId)
    wishlist.value = wishlist.value.filter((item) =>
      (item.productId || item.id) !== productId,
    )
    return true
  }

  async function saveProfile(payload) {
    const response = await updateProfile(payload)
    profile.value = response.data || response
  }

  async function addAddress(payload) {
    const createdAddress = await saveAddressMock(payload)
    // TODO(BE): replace with saveAddress + refresh getAddresses when backend is ready.
    if (createdAddress.isDefault) {
      addresses.value = addresses.value.map((item) => ({ ...item, isDefault: false }))
    }
    addresses.value = sortAddressesByDefault([createdAddress, ...addresses.value])
    return createdAddress
  }

  async function setDefaultAddress(addressId) {
    // TODO(BE): replace mock with accountApi.setDefaultAddress(addressId)
    const nextAddresses = await setDefaultAddressMock(addressId)
    addresses.value = sortAddressesByDefault(nextAddresses)
    return defaultAddress.value
  }

  async function uploadAvatar(file) {
    if (!profile.value) return null
    const { avatarUrl } = await uploadAvatarMock(file)
    profile.value = { ...profile.value, avatarUrl }
    return avatarUrl
  }

  function removeAvatar() {
    if (!profile.value) return
    profile.value = { ...profile.value, avatarUrl: '' }
  }

  function addOrderFromCheckout(payload) {
    const listItem = buildOrderListItemFromCheckout(payload)
    const detail = buildOrderDetailFromCheckout(payload)
    orders.value = [listItem, ...orders.value]
    orderDetails.value = { ...orderDetails.value, [detail.id]: detail }
    return detail
  }

  function getOrderDetail(orderId) {
    return orderDetails.value[orderId] ?? null
  }

  function cancelOrder(orderId) {
    const detail = orderDetails.value[orderId]
    if (!detail || detail.status !== 'pending') {
      return { ok: false, message: 'Chỉ huỷ được đơn đang chờ xác nhận.' }
    }

    const cancelledAt = new Date().toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const nextDetail = {
      ...detail,
      status: 'cancel',
      eta: 'Đã huỷ',
      trackingCode: null,
      timeline: [
        { title: 'Đặt hàng thành công', sub: detail.timeline?.[0]?.sub ?? '', time: detail.placedAt, done: true },
        {
          title: 'Đã huỷ đơn hàng',
          sub: 'Đơn đã được huỷ theo yêu cầu của bạn',
          time: cancelledAt,
          active: true,
        },
      ],
    }

    orderDetails.value = { ...orderDetails.value, [orderId]: nextDetail }
    orders.value = orders.value.map((item) =>
      item.id === orderId ? { ...item, status: 'cancel' } : item,
    )

    return { ok: true }
  }

  return {
    loading,
    profile,
    addresses,
    orders,
    orderDetails,
    wishlist,
    wishlistHydrated,
    wishlistProductIds,
    settings,
    projects,
    stats,
    defaultAddress,
    hydrate,
    saveProfile,
    addAddress,
    setDefaultAddress,
    uploadAvatar,
    removeAvatar,
    addOrderFromCheckout,
    getOrderDetail,
    cancelOrder,
    loadWishlist,
    addFavorite,
    removeFavorite,
    hasFavoriteProduct,
  }
})
