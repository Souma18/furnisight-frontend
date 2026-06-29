import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useToast } from '@shared/composables/useToast'
import { useWishlistStore } from '@features/account/store/wishlistStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import { CategoryResponse, ProductResponse, productsApi, promotionsApi } from '@shared/lib/api/services'
import { useLocaleStore } from '@shared/stores/localeStore'
import { useComboCart } from '@features/promotions/composables/useComboCart'
import { comboStockIssue } from '@features/promotions/lib/comboStock'
import { useRevealOnScroll } from './useRevealOnScroll'

export function useHomePage() {
  const wishlistStore = useWishlistStore()
  const authStore = useAuthStore()
  const localeStore = useLocaleStore()
  const { locale } = storeToRefs(localeStore)
  const { t } = useI18n()
  const { show: showToast } = useToast()

  const categories = ref([])
  const combos = ref([])
  const products = ref([])
  const activeCategoryId = ref('')
  const topReviews = ref([])
  const comboMessage = ref('')
  const wishedProductIds = computed(() => wishlistStore.wishlistProductIds)
  const {
    addingComboId: comboAddingId,
    buyingComboId: comboBuyingId,
    addComboToCart,
    buyCombo,
    enrichComboItemImage,
  } = useComboCart({
    authRequired: true,
    onAuthRequired: openAuthModal,
    onMessage(message) {
      comboMessage.value = message
    },
  })

  useRevealOnScroll('.fade-up')

  async function loadCategories() {
    try {
      const response = await productsApi.getRootCategories()
      const data = response?.data
      const items = Array.isArray(data)
        ? data
        : data?.items ?? []

      categories.value = items.map((item) => {
        const category = new CategoryResponse(item)
        return {
          ...category,
          icon: category.iconUrl || 'sofa',
          count: t('home.categories.count', { count: category.productCount || 0 }),
        }
      })

      if (categories.value.length > 0 && !activeCategoryId.value) {
        activeCategoryId.value = categories.value[0].id
      }
    } catch (error) {
      categories.value = []
    }
  }

  async function loadCombos() {
    try {
      const { data } = await promotionsApi.getCombos({
        availableOnly: true,
        page: 0,
        size: 3,
        sort: 'save-desc',
      })
      const items = Array.isArray(data)
        ? data
        : data?.items ?? []
      combos.value = await Promise.all(items
        .filter((combo) => combo?.id)
        .map(async (combo) => ({
          ...combo,
          imageUrl: combo.imageUrl || '',
          originalAmount: Number(combo.originalAmount || 0),
          finalAmount: Number(combo.finalAmount || 0),
          savedAmount: Number(combo.savedAmount || 0),
          items: Array.isArray(combo.items)
            ? await Promise.all(combo.items
                .filter((item) => item?.productId)
                .map(async (item) => {
                  const enriched = await enrichComboItemImage(item)
                  return {
                    ...enriched,
                    quantity: Math.max(1, Number(enriched.quantity) || 1),
                    price: Number(enriched.price || 0),
                  }
                }))
            : [],
        })))
      combos.value = combos.value.map((combo) => ({ ...combo, stockIssue: combo.available === false ? 'unavailable' : comboStockIssue(combo) }))
    } catch (error) {
      combos.value = []
    }
  }

  async function loadProductsForCategory(categoryId) {
    if (!categoryId) return
    const selectedCategory = categories.value.find((category) => category.id === categoryId)
    if (!selectedCategory) return

    try {
      const { data } = await productsApi.getProducts({
        category: selectedCategory.slug || selectedCategory.name,
        size: 8,
      })
      const rawProducts = Array.isArray(data) ? data : data?.items ?? []
      products.value = rawProducts.map((item) => new ProductResponse(item))
    } catch (error) {
      // Silent fail
    }
  }

  async function loadTopReviews() {
    try {
      const { data } = await productsApi.getTopRandomReviews(3)
      topReviews.value = (data || []).map((review) => ({
        id: review.id,
        name: review.userName || t('home.testimonials.anonymous'),
        role: '',
        avatar: review.userAvatarUrl || null,
        text: review.content,
        rating: Number(review.rating) || 5,
      }))
    } catch (error) {
      // Silent fail
    }
  }

  async function toggleWish(productId) {
    if (!productId) return

    if (!authStore.isAuthenticated) {
      openAuthModal()
      return
    }

    try {
      if (wishlistStore.hasFavoriteProduct(productId)) {
        await wishlistStore.removeFavorite(productId)
      } else {
        await wishlistStore.addFavorite(productId)
      }
    } catch (error) {
      showToast('Không thể cập nhật danh sách yêu thích', 'error')
    }
  }

  watch(activeCategoryId, loadProductsForCategory)
  watch(locale, async () => {
    await loadCategories()
    await loadProductsForCategory(activeCategoryId.value)
    await loadTopReviews()
  })

  onMounted(() => {
    loadCategories()
    loadCombos()
    loadTopReviews()

    if (authStore.isAuthenticated) {
      wishlistStore.loadWishlist().catch(() => [])
    }
  })

  return {
    categories,
    combos,
    products,
    activeCategoryId,
    wishedProductIds,
    topReviews,
    comboBuyingId,
    comboAddingId,
    comboMessage,
    addComboToCart,
    buyCombo,
    toggleWish,
  }
}
