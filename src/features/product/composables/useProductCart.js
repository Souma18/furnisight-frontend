import { useSharedCartActions } from '@features/cart/composables/useSharedCartActions'

export function useProductCart({ product, buildCartPayload }) {
  const {
    cartAdding,
    cartAdded,
    cartError,
    resetCartButtonState,
    addProductToCart,
    buyNow: sharedBuyNow,
  } = useSharedCartActions()

  async function addToCart() {
    if (!product.value || cartAdding.value) return null
    return addProductToCart(buildCartPayload(), { showSuccessToast: true })
  }

  async function buyNow() {
    if (!product.value || cartAdding.value) return null
    return sharedBuyNow(buildCartPayload())
  }

  return {
    cartAdding,
    cartAdded,
    cartError,
    resetCartButtonState,
    addToCart,
    buyNow,
  }
}
