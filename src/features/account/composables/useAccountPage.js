import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProfileStore } from '../store/profileStore'
import { useOrderStore } from '../store/orderStore'
import { useWishlistStore } from '../store/wishlistStore'
import { normalizeOrderUiStatus } from '@shared/lib/orders/orderStatusMapper'
import { useToast } from '@shared/composables/useToast'

const VIEWS = [
  'profile',
  'bell',
  'bell-order',
  'bell-promo',
  'bell-system',
  'bell-review',
  'orders',
  'order-detail',
  'cart',
  'wishlist',
  'settings',
]

export function useAccountPage() {
  const route = useRoute()
  const router = useRouter()
  
  const profileStore = useProfileStore()
  const orderStore = useOrderStore()
  const wishlistStore = useWishlistStore()

  const activeView = ref('profile')
  const { show: showToast } = useToast()

  const profile = computed(() => profileStore.profile)
  const stats = computed(() => ({
    totalOrders: orderStore.orders.length,
    deliveringOrders: orderStore.orders.filter((order) => normalizeOrderUiStatus(order) === 'delivering').length,
    wishlistCount: wishlistStore.wishlist.length,
  }))

  async function setView(nextView) {
    if (!VIEWS.includes(nextView)) return

    activeView.value = nextView

    const query = {
      ...route.query,
      view: nextView,
    }

    if (nextView !== 'order-detail') {
      delete query.orderCode
      delete query.orderId
    }

    await router.push({
      name: 'account',
      query,
    })
  }

  async function cleanOrderDetailQuery(nextView) {
    if (nextView === 'order-detail' || (!route.query.orderCode && !route.query.orderId)) return

    const query = { ...route.query }
    delete query.orderCode
    delete query.orderId
    await router.replace({
      name: 'account',
      query,
    })
  }

  function syncViewFromQuery(nextView = route.query.view) {
    const normalizedView = typeof nextView === 'string' && VIEWS.includes(nextView) ? nextView : 'profile'
    activeView.value = normalizedView
    cleanOrderDetailQuery(normalizedView)
  }



  onMounted(() => {
    syncViewFromQuery()
    profileStore.fetchProfile().catch(() => null)
  })

  watch(
    () => route.query,
    (query) => {
      syncViewFromQuery(query.view)
    },
  )

  return {
    activeView,
    profile,
    stats,
    setView,
    showToast,
  }
}
