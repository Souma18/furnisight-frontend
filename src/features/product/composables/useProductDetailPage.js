import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@features/auth/store/authStore'
import { useLocaleStore } from '@shared/stores/localeStore'
import { useProducts } from './useProducts'
import { useProductReviews } from './useProductReviews'
import { useProductVariants } from './useProductVariants'
import { useProductWishlist } from './useProductWishlist'
import { useProductCart } from './useProductCart'
import { useProductNavigation } from './useProductNavigation'

export function useProductDetailPage(props) {
  const route = useRoute()
  const authStore = useAuthStore()
  const localeStore = useLocaleStore()
  const { locale } = storeToRefs(localeStore)
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

  const { resolveSelectedVariant, buildCartPayload } = useProductVariants({ product, selectedColor, selectedSize, qty, activeImage })
  const { wished, checkWishlist, addToWishlist } = useProductWishlist({ product })
  const { cartAdding, cartAdded, cartError, resetCartButtonState, addToCart, buyNow } = useProductCart({ product, buildCartPayload })
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

  const activeVariant = computed(() => resolveSelectedVariant())
  const activeGallery = computed(() => {
    const imageCandidates = [
      ...(Array.isArray(activeVariant.value?.imageUrls) ? activeVariant.value.imageUrls : []),
      ...(Array.isArray(product.value?.gallery) ? product.value.gallery : []),
    ]
    if (activeVariant.value?.image) imageCandidates.push(activeVariant.value.image)
    if (product.value?.image) imageCandidates.push(product.value.image)
    return [...new Set(imageCandidates.filter(Boolean))]
  })
  const selectedStock = computed(() => {
    const variantStock = activeVariant.value?.stockQuantity
    const stock = variantStock ?? product.value?.stock ?? 0
    return Math.max(0, Number(stock) || 0)
  })
  const selectedOutOfStock = computed(() => product.value?.outOfStock || selectedStock.value <= 0)
  const has3dModel = computed(() => activeVariant.value?.supports3d ?? false)
  const activeModelUrl = computed(() => activeVariant.value?.modelUrl || '')

  async function loadProduct(id) {
    loading.value = true
    error.value = null
    product.value = null
    try {
      const loadedProduct = await loadDetail(id)
      if (!loadedProduct) throw new Error('not_found')
      product.value = loadedProduct

      selectedColor.value = product.value.colors?.[0] ?? ''
      selectedSize.value = product.value.sizes?.[0] ?? ''
      activeImage.value = activeGallery.value[0] ?? ''
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
    const stockLimit = selectedStock.value
    if (stockLimit <= 0) {
      qty.value = 1
      return
    }
    qty.value = Math.max(1, Math.min(stockLimit, qty.value + delta))
  }

  function setQty(value) {
    const stockLimit = selectedStock.value
    const nextQty = Math.max(1, Math.floor(Number(value) || 1))
    qty.value = stockLimit > 0 ? Math.min(nextQty, stockLimit) : 1
  }

  watch([selectedColor, selectedSize, selectedStock], () => {
    if (selectedStock.value <= 0) {
      qty.value = 1
      return
    }
    qty.value = Math.min(qty.value, selectedStock.value)
  })
  watch(activeGallery, (gallery) => {
    const nextGallery = Array.isArray(gallery) ? gallery : []
    if (!nextGallery.length) {
      activeImage.value = ''
      return
    }
    if (!nextGallery.includes(activeImage.value)) {
      activeImage.value = nextGallery[0]
    }
  })

  watch(() => props.id, (id) => loadProduct(id))
  watch(locale, () => loadProduct(props.id))
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
    selectedStock,
    selectedOutOfStock,
    qty,
    wished,
    activeImage,
    activeTab,
    show3DModal,
    cartAdding,
    cartAdded,
    cartError,
    reviewEligibility,
    reviewForm,
    reviewSubmitting,
    reviewSubmitError,
    reviewSubmitSuccess,
    reviewCanSubmit,
    reviewIsAuthenticated,
    breadcrumbLinks,
    activeVariant,
    activeGallery,
    has3dModel,
    activeModelUrl,
    retry,
    changeQty,
    setQty,
    openRoom3D,
    addToCart,
    buyNow,
    addToWishlist,
    updateReviewField,
    openReviewLogin,
    submitReview,
  }
}
