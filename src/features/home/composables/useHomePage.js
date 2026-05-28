import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWishlistStore } from '@features/account/store/wishlistStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { CategoryResponse, formatVnd, ProductResponse, productsApi } from '@shared/lib/api/services'
import { roomFallbacks } from './homeContent'
import { useRevealOnScroll } from './useRevealOnScroll'

export function useHomePage() {
  const route = useRoute()
  const router = useRouter()
  const wishlistStore = useWishlistStore()
  const authStore = useAuthStore()

  const categories = ref([])
  const products = ref([])
  const activeCategoryId = ref('')
  const activeRoomFilter = ref('Tat ca')
  const wishedProductIds = computed(() => wishlistStore.wishlistProductIds)

  const roomFilters = computed(() => ['Tat ca', ...categories.value.map((category) => category.name)])
  useRevealOnScroll('.fade-up')

  const filteredRooms = computed(() => {
    const rooms = categories.value.map((category) => {
      const fallback = roomFallbacks[category.name] || { image: '/home/rooms/livingroom.jpeg', isBig: false }
      return {
        id: category.id,
        slug: category.slug,
        type: category.name,
        name: category.name,
        count: `${category.productCount || 0} sản phẩm`,
        image: category.imageUrl || fallback.image,
        isBig: fallback.isBig,
      }
    })

    if (activeRoomFilter.value === 'Tat ca') return rooms
    return rooms.filter((room) => room.type === activeRoomFilter.value)
  })

  async function loadCategories() {
    try {
      const { data } = await productsApi.getRootCategories()
      categories.value = data.map((item) => {
        const category = new CategoryResponse(item)
        return {
          ...category,
          icon: category.iconUrl || '🛋️',
          count: `${category.productCount || 0} sản phẩm`,
        }
      })

      if (categories.value.length > 0 && !activeCategoryId.value) {
        activeCategoryId.value = categories.value[0].id
      }
    } catch (error) {
      console.error('Failed to load home categories:', error)
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
      const rawProducts = data?.products ?? data?.content ?? []
      products.value = rawProducts.map((item) => {
        const product = new ProductResponse(item)
        return {
          ...product,
          detailId: product.slug || product.id,
          category: product.categoryName,
          price: formatVnd(product.price),
          image: product.image || '/home/products/placeholder.jpg',
        }
      })
    } catch (error) {
      console.error('Failed to load products for category:', error)
    }
  }

  async function toggleWish(productId) {
    if (!productId) return

    if (!authStore.isAuthenticated) {
      router.push({
        name: 'login',
        query: {
          redirect: route.fullPath,
        },
      })
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

    if (authStore.isAuthenticated) {
      wishlistStore.loadWishlist().catch(() => [])
    }
  })

  return {
    categories,
    products,
    activeCategoryId,
    activeRoomFilter,
    wishedProductIds,
    roomFilters,
    filteredRooms,
    toggleWish,
  }
}
