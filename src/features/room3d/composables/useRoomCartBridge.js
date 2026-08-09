import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PRODUCTS_3D } from '../core/mockData'
import { isPurchasableLine } from '@features/cart/lib/stockGuards'
import { useSharedCartActions } from '@features/cart/composables/useSharedCartActions'

function buildRoomCartPayload(product) {
  let primaryVariant = null
  
  if (product._selectedVariantId && Array.isArray(product.variants)) {
    primaryVariant = product.variants.find(v => v.id === product._selectedVariantId)
  }
  
  if (!primaryVariant) {
    primaryVariant = Array.isArray(product.variants) ? product.variants[0] : null
  }
  
  const stockQuantity = primaryVariant?.stockQuantity ?? product.stock ?? null
  
  return {
    productId: product.id,
    detailId: product.slug || product.id,
    variantId: primaryVariant?.id ?? null,
    name: product.name,
    price: primaryVariant?.price ?? product.price ?? 0,
    stockQuantity,
    outOfStock: Number(stockQuantity ?? 0) <= 0,
    imageUrl: product.image || product.gallery?.[0] || '',
    quantity: 1,
    selectedColor: primaryVariant?.color || '',
    selectedSize: primaryVariant?.dimensionText || '',
    room3dProductId: product.room3dProductId ?? null,
  }
}

export function useRoomCartBridge({
  store,
  state,
  cartStore,
  cartState,
  router,
}) {
  const orderCode = ref('')
  
  const { 
    addProductToCart: sharedAddProductToCart,
    changeQty: sharedChangeQty,
    removeLine: sharedRemoveLine
  } = useSharedCartActions()

  const cartItems = computed(() => cartState.items.value)
  const placedProductIds = computed(() => cartState.room3dProductIds.value)
  const cartProductIds = computed(() =>
    cartState.items.value
      .map((item) => String(item.productId ?? item.id ?? '').split('::')[0])
      .filter(Boolean),
  )
  const cartTotal = computed(() => cartState.totalAmount.value)
  const cartCount = computed(() => cartState.lineCount.value)

  async function addProductToCart(productOrId) {
    let product = productOrId

    if (typeof productOrId === 'number') {
      const sceneProduct = PRODUCTS_3D.find((item) => item.id === productOrId)
      product = sceneProduct
        ? state.recommendations.value.find(
            (item) => String(item.productId || item.id) === String(sceneProduct.productId),
          )
        : null
    } else if (typeof productOrId === 'string') {
      product = state.recommendations.value.find((item) => String(item.id) === productOrId)
    }

    if (!product) return
    
    await sharedAddProductToCart(buildRoomCartPayload(product), { showSuccessToast: true })
  }

  function openProductDetail(product) {
    const detailId = product?.detailId || product?.slug || product?.id
    if (!detailId) return
    router.push({
      name: 'product-detail',
      params: { slug: String(product.slug || product.id) },
    })
  }

  function removeProductFromCart(lineId) {
    sharedRemoveLine(lineId)
  }

  function updateCartQty(lineId, nextQty) {
    const item = cartState.items.value.find(item => item.id === lineId)
    if (!item) return
    const delta = nextQty - Number(item.qty || 1)
    sharedChangeQty(item, delta)
  }

  async function goCheckout() {
    await cartStore.ensureHydrated?.({ force: true }).catch(() => null)
    if (!cartState.items.value.some(isPurchasableLine)) return
    router.push('/checkout')
  }

  return {
    orderCode,
    cartItems,
    placedProductIds,
    cartProductIds,
    cartTotal,
    cartCount,
    addProductToCart,
    openProductDetail,
    removeProductFromCart,
    updateCartQty,
    goCheckout,
  }
}
