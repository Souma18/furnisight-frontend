import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAccountStore } from '../store/accountStore'
import { useProfileStore } from '../store/profileStore'
import { useAddressStore } from '../store/addressStore'
import { useOrderStore } from '../store/orderStore'
import { useWishlistStore } from '../store/wishlistStore'

const VIEWS = [
  'profile',
  'address',
  'bell',
  'bell-order',
  'bell-promo',
  'bell-system',
  'bell-review',
  'orders',
  'vouchers',
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
  const profileStore = useProfileStore()
  const addressStore = useAddressStore()
  const orderStore = useOrderStore()
  const wishlistStore = useWishlistStore()

  const activeView = ref('profile')
  const toast = ref({ open: false, message: '', type: 'success' })

  const profile = computed(() => profileStore.profile)
  const addresses = computed(() => addressStore.addresses)
  const defaultAddress = computed(() => addressStore.defaultAddress)
  const wishlist = computed(() => wishlistStore.wishlist)
  const settings = computed(() => accountStore.settings)
  const projects = computed(() => accountStore.projects)
  const stats = computed(() => ({
    totalOrders: orderStore.orders.length,
    deliveringOrders: orderStore.orders.filter((o) => o.status === 'delivering').length,
    wishlistCount: wishlistStore.wishlist.length,
  }))

  function setView(nextView) {
    if (VIEWS.includes(nextView)) activeView.value = nextView
  }

  function syncViewFromQuery(nextView = route.query.view) {
    if (typeof nextView === 'string' && VIEWS.includes(nextView)) {
      activeView.value = nextView
    }
  }

  let toastTimer = null
  function showToast(message, type = 'success') {
    clearTimeout(toastTimer)
    toast.value = { open: true, message, type }
    toastTimer = setTimeout(() => {
      toast.value.open = false
    }, 2600)
  }

  async function removeWishlistFavorite(productId) {
    if (!productId) return

    try {
      await wishlistStore.removeFavorite(productId)
      showToast('Đã bỏ sản phẩm khỏi danh sách yêu thích.')
    } catch (error) {
      console.error('Failed to remove favorite product:', error)
      showToast('Không thể bỏ yêu thích sản phẩm. Vui lòng thử lại.', 'error')
    }
  }

  const loading = ref(false)

  async function hydrate() {
    loading.value = true
    try {
      await Promise.allSettled([
        profileStore.fetchProfile(),
        addressStore.fetchAddresses(),
        orderStore.fetchOrders(),
        wishlistStore.loadWishlist()
      ])
      // accountStore settings and projects are locally handled if needed
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    hydrate()
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
    wishlist,
    settings,
    projects,
    stats,
    loading: computed(() => loading.value),
    toast,
    setView,
    showToast,
    removeWishlistFavorite,
  }
}
