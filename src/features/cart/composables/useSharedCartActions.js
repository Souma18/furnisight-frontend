import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import { useToast } from '@shared/composables/useToast'

export function useSharedCartActions() {
  const router = useRouter()
  const cartStore = useCartStore()
  const authStore = useAuthStore()
  const { show: showToast } = useToast()

  const cartAdding = ref(false)
  const cartAdded = ref(false)
  const cartError = ref('')
  let cartAddedTimer = null

  function resetCartButtonState() {
    clearTimeout(cartAddedTimer)
    cartAdding.value = false
    cartAdded.value = false
    cartError.value = ''
  }

  function findCartLine(items, payload) {
    const productId = String(payload.productId ?? '')
    const variantId = String(payload.variantId ?? '')

    return items.find((item) =>
      String(item.productId ?? '') === productId &&
      String(item.variantId ?? '') === variantId,
    ) ?? null
  }

  async function addProductToCart(payload, options = {}) {
    const { showSuccessToast = false } = options
    cartError.value = ''

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
      const stockQuantity = Number(payload.stockQuantity)
      if (payload.outOfStock || (Number.isFinite(stockQuantity) && stockQuantity <= 0)) {
        cartError.value = 'Sản phẩm tạm hết hàng. Bạn có thể xem sản phẩm khác hoặc quay lại sau.'
        showToast('Sản phẩm tạm hết hàng', 'Bạn có thể xem sản phẩm khác hoặc quay lại sau.', 'alert')
        return null
      }
      
      const items = await cartStore.addItem(payload)
      const addedLine = findCartLine(items, payload)
      
      cartAdded.value = true
      cartAddedTimer = setTimeout(() => {
        cartAdded.value = false
      }, 900)
      
      if (showSuccessToast) {
        showToast('Đã thêm vào giỏ', 'Sản phẩm đã được thêm vào giỏ hàng', 'success')
      }
      
      return addedLine
    } catch (e) {
      cartAdded.value = false
      if (e?.message === 'out_of_stock') {
        cartError.value = 'Sản phẩm tạm hết hàng. Bạn có thể xem sản phẩm khác hoặc quay lại sau.'
        showToast('Sản phẩm tạm hết hàng', 'Bạn có thể xem sản phẩm khác hoặc quay lại sau.', 'alert')
      } else if (e?.message === 'stock_limit_reached') {
        cartError.value = 'Số lượng trong giỏ đã đạt giới hạn tồn kho.'
        showToast('Giới hạn tồn kho', 'Số lượng trong giỏ đã đạt giới hạn tồn kho.', 'alert')
      } else {
        cartError.value = e?.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ. Vui lòng thử lại.'
        showToast('Không thể thêm sản phẩm vào giỏ', cartError.value, 'alert')
      }
      return null
    } finally {
      cartAdding.value = false
    }
  }

  async function buyNow(payload) {
    const addedLine = await addProductToCart(payload)
    if (!addedLine?.id) return

    await router.push({
      name: 'checkout',
      query: { lines: addedLine.id },
    })
  }

  async function changeQty(item, delta) {
    if (!item || item.outOfStock) return
    try {
      await cartStore.updateQty(item.id, Number(item.qty || 1) + delta)
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Không thể cập nhật số lượng.'
      showToast(msg, 'error')
    }
  }

  async function removeLine(itemId) {
    try {
      await cartStore.removeItem(itemId)
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Không thể xóa sản phẩm.'
      showToast(msg, 'error')
    }
  }

  onBeforeUnmount(() => {
    if (cartAddedTimer) clearTimeout(cartAddedTimer)
  })

  return {
    cartAdding,
    cartAdded,
    cartError,
    resetCartButtonState,
    addProductToCart,
    buyNow,
    changeQty,
    removeLine,
  }
}
