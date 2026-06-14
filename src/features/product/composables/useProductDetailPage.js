import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@features/cart/store/cartStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import { useWishlistStore } from '@features/account/store/wishlistStore'
import { ordersApi } from '@shared/lib/api/services/orders/orders.api'
import { productsApi } from '@shared/lib/api/services/products/products.api'
import { ReviewResponse } from '@shared/lib/api/services/products/products.model'
import { useProducts } from './useProducts'

export function useProductDetailPage(props) {
  const route = useRoute()
  const router = useRouter()
  const cartStore = useCartStore()
  const authStore = useAuthStore()
  const wishlistStore = useWishlistStore()
  const { loadDetail } = useProducts()
  const product = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const selectedColor = ref('')
  const selectedSize = ref('')
  const qty = ref(1)
  const wished = ref(false)
  const activeImage = ref('')
  const activeTab = ref('desc')
  const show3DModal = ref(false)
  const cartAdding = ref(false)
  const cartAdded = ref(false)
  const reviewEligibility = ref({
    loading: false,
    checked: false,
    purchased: false,
    orderItemId: null,
    error: null,
  })
  const reviewForm = ref({
    rating: 5,
    title: '',
    content: '',
  })
  const reviewSubmitting = ref(false)
  const reviewSubmitError = ref('')
  const reviewSubmitSuccess = ref('')
  let reviewEligibilityRequestId = 0
  let cartAddedTimer = null

  const reviewCanSubmit = computed(() => {
    return Boolean(
      authStore.isAuthenticated &&
      reviewEligibility.value.purchased &&
      reviewEligibility.value.orderItemId &&
      !reviewEligibility.value.loading &&
      !reviewSubmitting.value &&
      String(reviewForm.value.content || '').trim() &&
      Number(reviewForm.value.rating) >= 1 &&
      Number(reviewForm.value.rating) <= 5,
    )
  })
  const reviewIsAuthenticated = computed(() => authStore.isAuthenticated)

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
      wished.value = false
      activeTab.value = route.query.tab === 'review' ? 'review' : 'desc'
      show3DModal.value = false
      resetCartButtonState()
      resetReviewState()

      if (authStore.isAuthenticated) {
        await wishlistStore.loadWishlist().catch(() => [])
        wished.value = wishlistStore.hasFavoriteProduct(product.value.id)
      }

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

  function resetCartButtonState() {
    clearTimeout(cartAddedTimer)
    cartAdding.value = false
    cartAdded.value = false
  }

  function resetReviewState() {
    reviewEligibilityRequestId += 1
    reviewEligibility.value = {
      loading: false,
      checked: false,
      purchased: false,
      orderItemId: null,
      error: null,
    }
    reviewForm.value = {
      rating: 5,
      title: '',
      content: '',
    }
    reviewSubmitting.value = false
    reviewSubmitError.value = ''
    reviewSubmitSuccess.value = ''
  }

  function normalizeReviewsPayload(data) {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.content)) return data.content
    if (Array.isArray(data?.items)) return data.items
    return []
  }

  async function loadProductReviews(productId) {
    if (!productId || !product.value) return

    try {
      const response = await productsApi.getReviews(productId)
      const reviews = normalizeReviewsPayload(response.data)
      product.value.reviews = reviews.map((review) => new ReviewResponse(review))
      product.value.ratingCount = response.data?.totalElements ?? reviews.length
      if (reviews.length) {
        const totalRating = product.value.reviews.reduce((total, review) => total + Number(review.rating || 0), 0)
        product.value.rating = totalRating / product.value.reviews.length
      }
    } catch (e) {
      console.error('Failed to load product reviews:', e)
    }
  }

  async function checkReviewEligibility() {
    const currentProduct = product.value
    const requestId = ++reviewEligibilityRequestId
    reviewSubmitError.value = ''

    if (!currentProduct?.id) {
      reviewEligibility.value = {
        loading: false,
        checked: false,
        purchased: false,
        orderItemId: null,
        error: null,
      }
      return
    }

    if (!authStore.isAuthenticated) {
      reviewEligibility.value = {
        loading: false,
        checked: true,
        purchased: false,
        orderItemId: null,
        error: null,
      }
      return
    }

    reviewEligibility.value = {
      loading: true,
      checked: false,
      purchased: false,
      orderItemId: null,
      error: null,
    }

    try {
      const response = await ordersApi.checkProductPurchased(currentProduct.id)
      if (requestId !== reviewEligibilityRequestId) return
      reviewEligibility.value = {
        loading: false,
        checked: true,
        purchased: Boolean(response.data?.purchased),
        orderItemId: response.data?.orderItemId ?? null,
        error: null,
      }
    } catch (e) {
      if (requestId !== reviewEligibilityRequestId) return
      reviewEligibility.value = {
        loading: false,
        checked: true,
        purchased: false,
        orderItemId: null,
        error: 'Không thể kiểm tra điều kiện đánh giá. Vui lòng thử lại sau.',
      }
    }
  }

  function updateReviewField({ field, value }) {
    if (!Object.prototype.hasOwnProperty.call(reviewForm.value, field)) return
    reviewForm.value = {
      ...reviewForm.value,
      [field]: value,
    }
    reviewSubmitError.value = ''
    reviewSubmitSuccess.value = ''
  }

  function openReviewLogin() {
    openAuthModal()
  }

  async function submitReview() {
    if (!product.value) return

    if (!authStore.isAuthenticated) {
      openAuthModal()
      return
    }

    if (!reviewEligibility.value.purchased || !reviewEligibility.value.orderItemId) {
      reviewSubmitError.value = 'Bạn cần mua và nhận sản phẩm trước khi đánh giá.'
      return
    }

    const content = String(reviewForm.value.content || '').trim()
    if (!content) {
      reviewSubmitError.value = 'Vui lòng nhập nội dung đánh giá.'
      return
    }

    reviewSubmitting.value = true
    reviewSubmitError.value = ''
    reviewSubmitSuccess.value = ''

    try {
      await productsApi.submitReview(product.value.id, {
        orderItemId: reviewEligibility.value.orderItemId,
        title: String(reviewForm.value.title || '').trim(),
        content,
        rating: Number(reviewForm.value.rating) || 5,
      })
      reviewForm.value = {
        rating: 5,
        title: '',
        content: '',
      }
      reviewSubmitSuccess.value = 'Đã gửi đánh giá của bạn.'
      await loadProductReviews(product.value.id)
    } catch (e) {
      reviewSubmitError.value = 'Không thể gửi đánh giá. Có thể bạn đã đánh giá sản phẩm này rồi.'
    } finally {
      reviewSubmitting.value = false
    }
  }

  function changeQty(delta) {
    qty.value = Math.max(1, Math.min(product.value?.stock ?? 99, qty.value + delta))
  }

  function openRoom3D() {
    router.push({
      name: 'room3d',
      query: {
        productId: product.value?.id ?? '',
        roomType: product.value?.roomTypeHint ?? '',
      },
    })
  }

  function resolveSelectedVariant() {
    const variants = product.value?.variants ?? []
    if (!variants.length) return null

    return (
      variants.find((variant) => {
        const matchesColor = !selectedColor.value || variant.color === selectedColor.value
        const matchesSize = !selectedSize.value || variant.dimensionText === selectedSize.value
        return matchesColor && matchesSize
      }) ??
      variants.find((variant) => !selectedColor.value || variant.color === selectedColor.value) ??
      variants[0]
    )
  }

  async function addToCart() {
    if (!product.value || cartAdding.value) return

    if (!authStore.isAuthenticated) {
      openAuthModal()
      return
    }

    const selectedVariant = resolveSelectedVariant()

    clearTimeout(cartAddedTimer)
    cartAdding.value = true
    cartAdded.value = false

    try {
      await cartStore.addItem({
        productId: product.value.id,
        detailId: product.value.slug || product.value.id,
        variantId: selectedVariant?.id ?? null,
        name: product.value.name,
        price: selectedVariant?.price ?? product.value.price ?? 0,
        imageUrl: activeImage.value || product.value.image || product.value.gallery?.[0] || '',
        quantity: qty.value,
        selectedColor: selectedColor.value,
        selectedSize: selectedSize.value,
        room3dProductId: product.value.room3dProductId ?? null,
      })
      cartAdded.value = true
      cartAddedTimer = setTimeout(() => {
        cartAdded.value = false
      }, 900)
    } catch (e) {
      cartAdded.value = false
      console.error('Failed to add product to cart:', e)
    } finally {
      cartAdding.value = false
    }
  }

  async function addToWishlist() {
    if (!product.value) return

    if (!authStore.isAuthenticated) {
      openAuthModal()
      return
    }

    try {
      if (wishlistStore.hasFavoriteProduct(product.value.id)) {
        await wishlistStore.removeFavorite(product.value.id)
        wished.value = false
      } else {
        await wishlistStore.addFavorite(product.value.id)
        wished.value = true
      }
    } catch (e) {
      console.error('Failed to toggle favorite product:', e)
    }
  }

  const breadcrumbLinks = ref([])
  watch(product, (p) => {
    if (!p) { breadcrumbLinks.value = []; return }
    breadcrumbLinks.value = (p.breadcrumb ?? []).map((crumb) => ({
      label: crumb.label ?? crumb,
      to: (crumb.id === 'home' || crumb === 'Trang chủ')
        ? { name: 'home' }
        : { name: 'products', query: { category: crumb.id } },
    }))
  })

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
    reviewEligibilityRequestId += 1
    reviewEligibility.value = {
      loading: false,
      checked: true,
      purchased: false,
      orderItemId: null,
      error: null,
    }
  })
  onMounted(() => loadProduct(props.id))
  onBeforeUnmount(() => clearTimeout(cartAddedTimer))

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
    addToWishlist,
    updateReviewField,
    openReviewLogin,
    submitReview,
  }
}
