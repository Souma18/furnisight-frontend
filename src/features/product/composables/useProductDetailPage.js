import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchProductById } from '../api/productApi'
import { useCartStore } from '@features/cart/store/cartStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { useAccountStore } from '@features/account/store/accountStore'


export function useProductDetailPage(props) {
  const router = useRouter()
  const route = useRoute()
  const cartStore = useCartStore()
  const authStore = useAuthStore()
  const accountStore = useAccountStore()
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

  async function loadProduct(id) {
    loading.value = true
    error.value = null
    product.value = null
    try {
      const res = await fetchProductById(id)
      if (!res.data) throw new Error('not_found')

      product.value = res.data

      selectedColor.value = product.value.colors?.[0] ?? ''
      selectedSize.value = product.value.sizes?.[0] ?? ''
      activeImage.value = product.value.gallery?.[0] ?? product.value.image ?? ''
      qty.value = 1
      wished.value = false
      activeTab.value = 'desc'
      show3DModal.value = false

      if (authStore.isAuthenticated) {
        await accountStore.loadWishlist().catch(() => [])
        wished.value = accountStore.hasFavoriteProduct(product.value.id)
      }
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
    if (!product.value) return

    if (!authStore.isAuthenticated) {
      router.push({
        name: 'login',
        query: {
          redirect: route.fullPath,
        },
      })
      return
    }

    const selectedVariant = resolveSelectedVariant()

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
  }

  async function addToWishlist() {
    if (!product.value) return

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
      if (accountStore.hasFavoriteProduct(product.value.id)) {
        await accountStore.removeFavorite(product.value.id)
        wished.value = false
      } else {
        await accountStore.addFavorite(product.value.id)
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
    breadcrumbLinks,
    retry,
    changeQty,
    openRoom3D,
    addToCart,
    addToWishlist,
  }
}
