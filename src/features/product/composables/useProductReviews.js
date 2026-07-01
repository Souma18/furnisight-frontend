import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@features/auth/store/authStore'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import { useProfileStore } from '@features/account/store/profileStore'
import { ordersApi } from '@shared/lib/api/services/orders/orders.api'
import { productsApi } from '@shared/lib/api/services/products/products.api'
import { ReviewResponse } from '@shared/lib/api/services/products/products.model'

function createEmptyEligibility() {
  return {
    loading: false,
    checked: false,
    purchased: false,
    orderItemId: null,
    reviewed: false,
    rating: null,
    error: null,
  }
}

function createEmptyReviewForm() {
  return {
    rating: 5,
    title: '',
    content: '',
  }
}

function normalizeReviewsPayload(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  return []
}

export function useProductReviews(product) {
  const route = useRoute()
  const authStore = useAuthStore()
  const profileStore = useProfileStore()
  const reviewEligibility = ref(createEmptyEligibility())
  const reviewForm = ref(createEmptyReviewForm())
  const reviewSubmitting = ref(false)
  const reviewSubmitError = ref('')
  const reviewSubmitSuccess = ref('')
  let reviewEligibilityRequestId = 0

  const reviewCanSubmit = computed(() => Boolean(
    authStore.isAuthenticated &&
    reviewEligibility.value.purchased &&
    reviewEligibility.value.orderItemId &&
    !reviewEligibility.value.reviewed &&
    !reviewEligibility.value.loading &&
    !reviewSubmitting.value &&
    String(reviewForm.value.content || '').trim() &&
    Number(reviewForm.value.rating) >= 1 &&
    Number(reviewForm.value.rating) <= 5,
  ))
  const reviewIsAuthenticated = computed(() => authStore.isAuthenticated)

  function resetReviewState() {
    reviewEligibilityRequestId += 1
    reviewEligibility.value = createEmptyEligibility()
    reviewForm.value = createEmptyReviewForm()
    reviewSubmitting.value = false
    reviewSubmitError.value = ''
    reviewSubmitSuccess.value = ''
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
    } catch {
      // Silent fail
    }
  }

  async function checkReviewEligibility() {
    const currentProduct = product.value
    const requestId = ++reviewEligibilityRequestId
    reviewSubmitError.value = ''
    const routeOrderItemId = resolveRouteOrderItemId(route.query.orderItemId)

    if (!currentProduct?.id) {
      reviewEligibility.value = createEmptyEligibility()
      return
    }

    if (!authStore.isAuthenticated) {
      reviewEligibility.value = {
        ...createEmptyEligibility(),
        checked: true,
      }
      return
    }

    if (routeOrderItemId) {
      reviewEligibility.value = {
        ...createEmptyEligibility(),
        checked: true,
        purchased: true,
        orderItemId: routeOrderItemId,
      }
      return
    }

    reviewEligibility.value = {
      ...createEmptyEligibility(),
      loading: true,
    }

    try {
      const response = await ordersApi.checkProductPurchased(currentProduct.id)
      if (requestId !== reviewEligibilityRequestId) return
      reviewEligibility.value = {
        loading: false,
        checked: true,
        purchased: Boolean(response.data?.purchased),
        orderItemId: response.data?.orderItemId ?? null,
        reviewed: Boolean(response.data?.reviewed),
        rating: response.data?.rating ?? null,
        error: null,
      }
    } catch {
      if (requestId !== reviewEligibilityRequestId) return
      reviewEligibility.value = {
        loading: false,
        checked: true,
        purchased: false,
        orderItemId: null,
        error: t('productDetail.alerts.eligibilityError'),
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
      reviewSubmitError.value = t('productDetail.review.purchaseReq')
      return
    }

    const content = String(reviewForm.value.content || '').trim()
    if (!content) {
      reviewSubmitError.value = t('productDetail.alerts.emptyContent')
      return
    }

    reviewSubmitting.value = true
    reviewSubmitError.value = ''
    reviewSubmitSuccess.value = ''

    try {
      const reviewer = await getReviewerSnapshot()
      const submittedRating = Number(reviewForm.value.rating) || 5
      await productsApi.submitReview(product.value.id, {
        orderItemId: reviewEligibility.value.orderItemId,
        title: String(reviewForm.value.title || '').trim(),
        content,
        rating: submittedRating,
        userName: reviewer.userName,
        userAvatarMediaId: reviewer.userAvatarMediaId,
      })
      reviewForm.value = createEmptyReviewForm()
      reviewEligibility.value = {
        ...reviewEligibility.value,
        purchased: false,
        reviewed: true,
        rating: submittedRating,
        orderItemId: null,
      }
      reviewSubmitSuccess.value = t('productDetail.alerts.submitSuccess')
      await loadProductReviews(product.value.id)
    } catch {
      reviewSubmitError.value = t('productDetail.alerts.submitError')
    } finally {
      reviewSubmitting.value = false
    }
  }

  async function getReviewerSnapshot() {
    if (!profileStore.profile) {
      try {
        await profileStore.fetchProfile()
      } catch {
        // Auth profile is enough for the name fallback; avatar media id is optional.
      }
    }

    const profile = profileStore.profile
    const authUser = authStore.user
    const profileName = [profile?.lastName, profile?.firstName]
      .map((part) => String(part || '').trim())
      .filter(Boolean)
      .join(' ')
    const authName = authUser?.displayName || [authUser?.lastName, authUser?.firstName]
      .map((part) => String(part || '').trim())
      .filter(Boolean)
      .join(' ')

    return {
      userName: profileName || authName || authUser?.email || t('productDetail.review.customer'),
      userAvatarMediaId: profile?.avatarMediaId || null,
    }
  }

  function resetAuthenticatedReviewState() {
    reviewEligibilityRequestId += 1
    reviewEligibility.value = {
      ...createEmptyEligibility(),
      checked: true,
    }
  }

  return {
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
  }
}

function resolveRouteOrderItemId(value) {
  const rawValue = Array.isArray(value) ? value[0] : value
  const normalized = String(rawValue || '').trim()
  return normalized || null
}
