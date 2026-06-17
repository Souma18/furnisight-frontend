import { computed, ref } from 'vue'
import { PRODUCTS_3D } from '../core/mockData'

export function useRoomCartBridge({
  store,
  state,
  cartStore,
  cartState,
  router,
}) {
  const orderCode = ref('')

  const cartItems = computed(() => cartState.items.value)
  const placedProductIds = computed(() => cartState.room3dProductIds.value)
  const cartProductIds = computed(() =>
    cartState.items.value
      .map((item) => String(item.productId ?? item.id ?? '').split('::')[0])
      .filter(Boolean),
  )
  const cartTotal = computed(() => cartState.totalAmount.value)
  const cartCount = computed(() => cartState.lineCount.value)

  function addProductToCart(productOrId) {
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
    cartStore.addItem(product)
  }

  function openProductDetail(product) {
    const detailId = product?.detailId || product?.slug || product?.id
    if (!detailId) return
    router.push({
      name: 'product-detail',
      params: { id: detailId },
    })
  }

  function removeProductFromCart(lineId) {
    cartStore.removeItem(lineId)
  }

  function updateCartQty(lineId, nextQty) {
    cartStore.updateQty(lineId, nextQty)
  }

  function goCheckout() {
    router.push('/checkout')
  }

  function submitCheckoutMock() {
    orderCode.value = `LN${Date.now().toString().slice(-6)}`
    store.closeCheckout()
    store.openSuccess()
    cartStore.clearCart()
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
    submitCheckoutMock,
  }
}
