import { computed, onMounted, ref } from 'vue'
import { useAccountStore } from '../store/accountStore'

const VIEWS = [
  'profile',
  'address',
  'orders',
  'cart',
  'wishlist',
  'security',
  'settings',
  'ar',
]

export function useAccountPage() {
  const accountStore = useAccountStore()
  const activeView = ref('profile')
  const toast = ref({ open: false, message: '', type: 'success' })

  const profile = computed(() => accountStore.profile)
  const addresses = computed(() => accountStore.addresses)
  const orders = computed(() => accountStore.orders)
  const cartItems = computed(() => accountStore.cartItems)
  const wishlist = computed(() => accountStore.wishlist)
  const settings = computed(() => accountStore.settings)
  const projects = computed(() => accountStore.projects)
  const stats = computed(() => accountStore.stats)

  function setView(nextView) {
    if (VIEWS.includes(nextView)) activeView.value = nextView
  }

  let toastTimer = null
  function showToast(message, type = 'success') {
    clearTimeout(toastTimer)
    toast.value = { open: true, message, type }
    toastTimer = setTimeout(() => {
      toast.value.open = false
    }, 2600)
  }

  async function saveProfile(payload) {
    await accountStore.saveProfile(payload)
    showToast('Đã lưu thông tin cá nhân.')
  }

  async function saveAddress(payload) {
    await accountStore.addAddress(payload)
    showToast('Đã lưu địa chỉ mới.')
  }

  async function uploadAvatar(file) {
    await accountStore.uploadAvatar(file)
    showToast('Đã cập nhật ảnh đại diện.')
  }

  function removeAvatar() {
    accountStore.removeAvatar()
    showToast('Đã xoá ảnh đại diện.')
  }

  onMounted(() => {
    accountStore.hydrate()
  })

  return {
    activeView,
    profile,
    addresses,
    orders,
    cartItems,
    wishlist,
    settings,
    projects,
    stats,
    loading: computed(() => accountStore.loading),
    toast,
    setView,
    showToast,
    saveProfile,
    saveAddress,
    uploadAvatar,
    removeAvatar,
  }
}
