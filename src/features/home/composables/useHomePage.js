import { computed, onMounted, ref, watch } from 'vue'
import { useWishlistStore } from '@features/account/store/wishlistStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import { CategoryResponse, ProductResponse, productsApi, promotionsApi } from '@shared/lib/api/services'
import { useComboCart } from '@features/promotions/composables/useComboCart'
import { useRevealOnScroll } from './useRevealOnScroll'

export function useHomePage() {
  const wishlistStore = useWishlistStore()
  const authStore = useAuthStore()

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
          count: `${category.productCount || 0} sản phẩm`,
        }
      })

      if (categories.value.length > 0 && !activeCategoryId.value) {
        activeCategoryId.value = categories.value[0].id
      }
    } catch (error) {
      console.error('Failed to load home categories:', error)
      categories.value = []
    }
  }

  async function loadCombos() {
    try {
      const { data } = await promotionsApi.getCombos({
        placement: 'HOME',
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
                .map(async (item) => ({
                  ...(await enrichComboItemImage(item)),
                  quantity: Math.max(1, Number(item.quantity) || 1),
                  price: Number(item.price || 0),
                })))
            : [],
        })))
    } catch (error) {
      console.error('Failed to load home combos:', error)
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
      console.error('Failed to load products for category:', error)
    }
  }

  async function loadTopReviews() {
    try {
      const { data } = await productsApi.getTopRandomReviews(3)
      topReviews.value = (data || []).map((review) => ({
        id: review.id,
        name: review.userName || 'Khách hàng ẩn danh',
        role: '',
        avatar: review.userAvatarUrl || null,
        text: review.content,
        rating: Number(review.rating) || 5,
      }))
    } catch (error) {
      console.error('Failed to load top reviews:', error)
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
      console.error('Failed to toggle favorite home product:', error)
    }
  }

  watch(activeCategoryId, loadProductsForCategory)
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
