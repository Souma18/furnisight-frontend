import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@features/auth/store/authStore'
import { useProducts } from './useProducts'
import { useProductReviews } from './useProductReviews'
import { useProductVariants } from './useProductVariants'
import { useProductWishlist } from './useProductWishlist'
import { useProductCart } from './useProductCart'
import { useProductNavigation } from './useProductNavigation'

export function useProductDetailPage(props) {
  const route = useRoute()
  const authStore = useAuthStore()
  const { loadDetail } = useProducts()

  const product = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const selectedColor = ref('')
  const selectedSize = ref('')
  const qty = ref(1)
  const activeImage = ref('')
  const activeTab = ref('desc')
  const show3DModal = ref(false)

  const { buildCartPayload } = useProductVariants({ product, selectedColor, selectedSize, qty, activeImage })
  const { wished, checkWishlist, addToWishlist } = useProductWishlist({ product })
  const { cartAdding, cartAdded, resetCartButtonState, addToCart, buyNow } = useProductCart({ product, buildCartPayload })
  const { breadcrumbLinks, openRoom3D } = useProductNavigation({ product })

  const {
    reviewEligibility,
    reviewForm,
    reviewSubmitting,
    reviewSubmitError,
    reviewSubmitSuccess,
    reviewCanSubmit,
    reviewIsAuthenticated,
    resetReviewState,
    loadProductReviews,
    checkReviewEligibility,
    updateReviewField,
    openReviewLogin,
    submitReview,
    resetAuthenticatedReviewState,
  } = useProductReviews(product)

  async function loadProduct(id) {
    loading.value = true
    error.value = null
    product.value = null
    try {
      product.value = await loadDetail(id)
      if (!product.value) throw new Error('not_found')

      selectedColor.value = product.value.colors?.[0] ?? ''
      selectedSize.value = product.value.sizes?.[0] ?? ''
      activeImage.value = product.value.gallery?.[0] ?? product.value.image ?? ''
      qty.value = 1
      activeTab.value = route.query.tab === 'review' ? 'review' : 'desc'
      show3DModal.value = false
      resetCartButtonState()
      resetReviewState()

      await checkWishlist()

      await Promise.all([
        loadProductReviews(product.value.id),
        checkReviewEligibility(),
      ])
    } catch (e) {
      if (e.message === 'not_found' || e.response?.status === 404) {
        error.value = 'not_found'
      } else {
        error.value = 'api_error'
      }
    } finally {
      loading.value = false
    }
  }

  function retry() {
    loadProduct(props.id)
  }

  function changeQty(delta) {
    qty.value = Math.max(1, Math.min(product.value?.stock ?? 99, qty.value + delta))
  }

  watch(() => props.id, (id) => loadProduct(id))
  watch(() => route.query.tab, (tab) => {
    if (tab === 'review') activeTab.value = 'review'
  })
  watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
    if (!product.value) return
    if (isAuthenticated) {
      await checkReviewEligibility()
      return
    }
    resetAuthenticatedReviewState()
  })
  onMounted(() => loadProduct(props.id))

  return {
    product,
    loading,
    error,
    selectedColor,
    selectedSize,
    qty,
    wished,
    activeImage,
    activeTab,
    show3DModal,
    cartAdding,
    cartAdded,
    reviewEligibility,
    reviewForm,
    reviewSubmitting,
    reviewSubmitError,
    reviewSubmitSuccess,
    reviewCanSubmit,
    reviewIsAuthenticated,
    breadcrumbLinks,
    retry,
    changeQty,
    openRoom3D,
    addToCart,
    buyNow,
    addToWishlist,
    updateReviewField,
    openReviewLogin,
    submitReview,
  }
}
