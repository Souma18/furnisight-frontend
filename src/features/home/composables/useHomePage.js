import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWishlistStore } from '@features/account/store/wishlistStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { useCartStore } from '@features/cart/store/cartStore'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import { CategoryResponse, ProductResponse, ordersApi, productsApi } from '@shared/lib/api/services'
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
  const comboMessage = ref('')
  const pendingCombo = ref(null)
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
      const { data } = await ordersApi.getActiveCombos()
      const items = Array.isArray(data)
        ? data
        : data?.items ?? data?.content ?? data?.data ?? []
      combos.value = items.map((combo) => ({
        ...combo,
        imageUrl: resolveComboImage(combo),
      }))
    } catch (error) {
      console.error('Failed to load home combos:', error)
      combos.value = []
    }
  }

  function resolveComboImage(combo = {}) {
    const itemImage = (combo.items || [])
      .map((item) => item.imageUrl || item.image)
      .find((value) => /^(https?:|data:|blob:|\/)/i.test(String(value || '')))

    return combo.imageUrl
      || itemImage
      || '/home/rooms/livingroom.jpeg'
  }

  function sameComboLine(line, item) {
    return String(line.productId || '') === String(item.productId || '')
      && String(line.variantId || '') === String(item.variantId || '')
  }

  async function prepareComboCheckout(combo) {
    comboBuyingId.value = combo.id
    comboMessage.value = ''

    try {
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
            imageUrl: item.image,
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

  async function buyCombo(combo) {
    if (!combo?.id) return
    if (!authStore.isAuthenticated) {
      pendingCombo.value = combo
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
        name: review.userName || 'Khach hang an danh',
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
    pendingCombo.value = null
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
    comboMessage,
    buyCombo,
    toggleWish,
  }
}
