import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAccountStore } from '../store/accountStore'

const VIEWS = [
  'profile',
  'address',
  'bell',
  'bell-order',
  'bell-promo',
  'bell-system',
  'bell-review',
  'orders',
  'order-detail',
  'cart',
  'wishlist',
  'security',
  'settings',
  'ar',
]

export function useAccountPage() {
  const route = useRoute()
  const router = useRouter()
  const accountStore = useAccountStore()
  const activeView = ref('profile')
  const toast = ref({ open: false, message: '', type: 'success' })

  const profile = computed(() => accountStore.profile)
  const addresses = computed(() => accountStore.addresses)
  const defaultAddress = computed(() => accountStore.defaultAddress)
  const orders = computed(() => accountStore.orders)
  const wishlist = computed(() => accountStore.wishlist)
  const settings = computed(() => accountStore.settings)
  const projects = computed(() => accountStore.projects)
  const stats = computed(() => accountStore.stats)

  function setView(nextView) {
    if (VIEWS.includes(nextView)) activeView.value = nextView
  }

  const selectedOrderId = computed(() => {
    const raw = route.query.orderId
    return typeof raw === 'string' ? raw : ''
  })

  const selectedOrder = computed(() => {
    if (!selectedOrderId.value) return null
    return accountStore.getOrderDetail(selectedOrderId.value)
  })

  function syncViewFromQuery(nextView = route.query.view) {
    if (typeof nextView === 'string' && VIEWS.includes(nextView)) {
      activeView.value = nextView
    }
  }

  function openOrderDetail(orderId) {
    activeView.value = 'order-detail'
    router.push({ path: '/account', query: { view: 'order-detail', orderId } })
  }

  function backToOrders() {
    activeView.value = 'orders'
    router.push({ path: '/account', query: { view: 'orders' } })
  }

  function cancelOrder(orderId) {
    const result = accountStore.cancelOrder(orderId)
    if (!result.ok) {
      showToast(result.message ?? 'Không thể huỷ đơn.', 'error')
      return false
    }
    showToast('Đã huỷ đơn hàng.')
    return true
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
    showToast(payload.isDefault ? 'Đã lưu và đặt làm địa chỉ mặc định.' : 'Đã lưu địa chỉ mới.')
  }

  async function setDefaultAddress(addressId) {
    await accountStore.setDefaultAddress(addressId)
    showToast('Đã cập nhật địa chỉ mặc định.')
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
    syncViewFromQuery()
  })

  watch(() => route.query.view, (nextView) => {
    syncViewFromQuery(nextView)
  })

  return {
    activeView,
    profile,
    addresses,
    defaultAddress,
    orders,
    cartItems,
    wishlist,
    settings,
    projects,
    stats,
    loading: computed(() => accountStore.loading),
    toast,
    setView,
    openOrderDetail,
    backToOrders,
    cancelOrder,
    showToast,
    saveProfile,
    saveAddress,
    setDefaultAddress,
    uploadAvatar,
    removeAvatar,
  }
}
