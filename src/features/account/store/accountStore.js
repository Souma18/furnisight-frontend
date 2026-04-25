import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchAccountOverviewMock,
  saveAddressMock,
  uploadAvatarMock,
} from '../api/accountMockApi'
import { getProfile, updateProfile } from '../api/profileApi'
// TODO(BE): replace mock imports with accountApi calls in production

export const useAccountStore = defineStore('account', () => {
  const loading = ref(false)
  const profile = ref(null)
  const addresses = ref([])
  const orders = ref([])
  const cartItems = ref([])
  const wishlist = ref([])
  const settings = ref({})
  const projects = ref([])

  const stats = computed(() => ({
    totalOrders: orders.value.length,
    deliveringOrders: orders.value.filter((order) => order.status === 'delivering').length,
    wishlistCount: wishlist.value.length,
  }))

  async function hydrate() {
    loading.value = true
    try {
      // Load real profile from backend
      const profileRes = await getProfile().catch(() => null)
      
      const data = await fetchAccountOverviewMock()
      
      if (profileRes && profileRes.data) {
        // profile.value = profileRes.data
        const beProfile = profileRes.data
        const merged = { ...data.profile }
        Object.keys(beProfile).forEach((key) => {
          if (beProfile[key] !== null && beProfile[key] !== undefined && beProfile[key] !== '') {
            merged[key] = beProfile[key]
          }
        })
        profile.value = merged
      } else {
        profile.value = data.profile // fallback to mock if backend not ready
      }
      addresses.value = data.addresses
      orders.value = data.orders
      cartItems.value = data.cartItems
      wishlist.value = data.wishlist
      settings.value = data.settings
      projects.value = data.projects
    } finally {
      loading.value = false
    }
  }

  async function saveProfile(payload) {
    const response = await updateProfile(payload)
    profile.value = response.data || response
  }

  async function addAddress(payload) {
    const createdAddress = await saveAddressMock(payload)
    addresses.value = [createdAddress, ...addresses.value]
    return createdAddress
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

  return {
    loading,
    profile,
    addresses,
    orders,
    cartItems,
    wishlist,
    settings,
    projects,
    stats,
    hydrate,
    saveProfile,
    addAddress,
    uploadAvatar,
    removeAvatar,
  }
})
