import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWishlistStore } from '@features/account/store/wishlistStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { useCartStore } from '@features/cart/store/cartStore'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import { CategoryResponse, ProductResponse, productsApi, promotionsApi } from '@shared/lib/api/services'
import { useRevealOnScroll } from './useRevealOnScroll'

export function useHomePage() {
  const router = useRouter()
  const wishlistStore = useWishlistStore()
  const authStore = useAuthStore()
  const cartStore = useCartStore()

  const categories = ref([])
  const combos = ref([])
  const products = ref([])
  const activeCategoryId = ref('')
  const topReviews = ref([])
  const comboBuyingId = ref('')
  const comboAddingId = ref('')
  const comboMessage = ref('')
  const pendingCombo = ref(null)
  const pendingComboAction = ref('buy')
  const wishedProductIds = computed(() => wishlistStore.wishlistProductIds)

  useRevealOnScroll('.fade-up')

  async function loadCategories() {
    try {
      const response = await productsApi.getRootCategories()
      const data = response?.data
      const items = Array.isArray(data)
        ? data
        : data?.items ?? data?.content ?? data?.data ?? []

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
        : data?.items ?? data?.content ?? data?.data ?? []
      combos.value = items
        .filter((combo) => combo?.id)
        .map((combo) => ({
          ...combo,
          imageUrl: combo.imageUrl || '',
          originalAmount: Number(combo.originalAmount || 0),
          finalAmount: Number(combo.finalAmount || 0),
          savedAmount: Number(combo.savedAmount || 0),
          items: Array.isArray(combo.items)
            ? combo.items
                .filter((item) => item?.productId)
                .map((item) => ({
                  ...item,
                  imageUrl: item.imageUrl || item.image || '',
                  quantity: Math.max(1, Number(item.quantity) || 1),
                  price: Number(item.price || 0),
                }))
            : [],
        }))
    } catch (error) {
      console.error('Failed to load home combos:', error)
      combos.value = []
    }
  }

  function sameComboLine(line, item) {
    return String(line.productId || '') === String(item.productId || '')
      && String(line.variantId || '') === String(item.variantId || '')
  }

  async function ensureComboInCart(combo) {
    if (!Array.isArray(combo.items) || !combo.items.length) {
      throw new Error('Combo chưa có sản phẩm hợp lệ.')
    }

    await cartStore.ensureHydrated()

    for (const item of combo.items || []) {
      const requiredQuantity = Math.max(1, Number(item.quantity) || 1)
      const existing = cartStore.items.find((line) => sameComboLine(line, item))
      const currentQuantity = Math.max(0, Number(existing?.qty ?? existing?.quantity) || 0)

      if (existing && currentQuantity < requiredQuantity) {
        await cartStore.updateQty(existing.id, requiredQuantity)
      } else if (!existing) {
        await cartStore.addItem({
          productId: item.productId,
          variantId: item.variantId || null,
          name: item.productName,
          imageUrl: item.imageUrl || item.image || '',
          price: item.price,
          quantity: requiredQuantity,
        })
      }
    }

    const lineIds = (combo.items || [])
      .map((item) => cartStore.items.find((line) => sameComboLine(line, item))?.id)
      .filter(Boolean)

    if (!lineIds.length || lineIds.length !== (combo.items || []).length) {
      throw new Error('Không thể chuẩn bị đầy đủ sản phẩm trong combo.')
    }

    return lineIds
  }

  async function prepareComboCheckout(combo) {
    comboBuyingId.value = combo.id
    comboMessage.value = ''

    try {
      const lineIds = await ensureComboInCart(combo)
      await router.push({
        name: 'checkout',
        query: {
          lines: lineIds.join(','),
          comboId: combo.id,
        },
      })
    } catch (error) {
      comboMessage.value = error?.response?.data?.message || error.message || 'Không thể mua combo lúc này.'
    } finally {
      comboBuyingId.value = ''
    }
  }

  async function addComboToCart(combo) {
    if (!combo?.id) return
    if (!authStore.isAuthenticated) {
      pendingCombo.value = combo
      pendingComboAction.value = 'add'
      openAuthModal()
      return
    }

    comboAddingId.value = combo.id
    comboMessage.value = ''
    try {
      await ensureComboInCart(combo)
      comboMessage.value = 'Đã thêm combo vào giỏ.'
    } catch (error) {
      comboMessage.value = error?.response?.data?.message || error.message || 'Không thể thêm combo lúc này.'
    } finally {
      comboAddingId.value = ''
    }
  }

  async function buyCombo(combo) {
    if (!combo?.id) return
    if (!authStore.isAuthenticated) {
      pendingCombo.value = combo
      pendingComboAction.value = 'buy'
      openAuthModal()
      return
    }
    await prepareComboCheckout(combo)
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
      const rawProducts = data?.products ?? data?.content ?? []
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
  watch(() => authStore.isAuthenticated, (authenticated) => {
    if (!authenticated || !pendingCombo.value) return
    const combo = pendingCombo.value
    const action = pendingComboAction.value
    pendingCombo.value = null
    pendingComboAction.value = 'buy'
    if (action === 'add') {
      addComboToCart(combo)
      return
    }
    prepareComboCheckout(combo)
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
