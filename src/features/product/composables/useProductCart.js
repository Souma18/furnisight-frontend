import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@features/cart/store/cartStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { openAuthModal } from '@features/auth/lib/authModalBus'

export function useProductCart({ product, buildCartPayload }) {
  const router = useRouter()
  const cartStore = useCartStore()
  const authStore = useAuthStore()
  const cartAdding = ref(false)
  const cartAdded = ref(false)
  let cartAddedTimer = null

  function resetCartButtonState() {
    clearTimeout(cartAddedTimer)
    cartAdding.value = false
    cartAdded.value = false
  }

  function findCartLine(items, payload) {
    const productId = String(payload.productId ?? '')
    const variantId = String(payload.variantId ?? '')

    return items.find((item) =>
      String(item.productId ?? '') === productId &&
      String(item.variantId ?? '') === variantId,
    ) ?? null
  }

  async function addToCart() {
    if (!product.value || cartAdding.value) return null

    if (!authStore.isAuthenticated) {
      openAuthModal()
      return null
    }

    if (!authStore.isCustomer) {
      await router.replace({ name: 'admin-dashboard' })
      return null
    }

    clearTimeout(cartAddedTimer)
    cartAdding.value = true
    cartAdded.value = false

    try {
      const payload = buildCartPayload()
      const items = await cartStore.addItem(payload)
      const addedLine = findCartLine(items, payload)
      cartAdded.value = true
      cartAddedTimer = setTimeout(() => {
        cartAdded.value = false
      }, 900)
      return addedLine
    } catch (e) {
      cartAdded.value = false
      console.error('Failed to add product to cart:', e)
      return null
    } finally {
      cartAdding.value = false
    }
  }

  async function buyNow() {
    const addedLine = await addToCart()
    if (!addedLine?.id) return

    await router.push({
      name: 'checkout',
      query: { lines: addedLine.id },
    })
  }

  onBeforeUnmount(() => clearTimeout(cartAddedTimer))

  return {
    cartAdding,
    cartAdded,
    resetCartButtonState,
    addToCart,
    buyNow,
  }
}
