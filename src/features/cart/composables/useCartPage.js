import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from './useCart'
import { useCartSelection } from './useCartSelection'
import { useCartItemEditor } from './useCartItemEditor'
import { useCartCheckout } from './useCartCheckout'
import { PriceFormatter } from '@shared/lib/formatters'
import { useToast } from '@shared/composables/useToast'

export function useCartPage() {
  const router = useRouter()
  const { show: showToast } = useToast()
  
  const cartState = useCart()
  const { items, ensureHydrated, updateItem, updateQty, removeItem, loading, hydrated } = cartState
  
  const selectionState = useCartSelection(items)
  const { uncheck, selectedItems, selectedCount } = selectionState
  
  const editorState = useCartItemEditor(items, updateItem)
  const { activeItem, closeItemEditor } = editorState
  
  const checkoutState = useCartCheckout(router, selectedItems, selectedCount, ensureHydrated)

  onMounted(async () => {
    try {
      await ensureHydrated()
    } catch (error) {
      // Hydration state will handle empty/error UI natively
    }
  })

  async function changeQty(item, delta) {
    if (!item || item.outOfStock) return
    try {
      await updateQty(item.id, Number(item.qty || 1) + delta)
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Không thể cập nhật số lượng.'
      showToast(msg, 'error')
    }
  }

  async function removeLine(itemId) {
    try {
      await removeItem(itemId)
      uncheck(itemId)
      if (activeItem.value?.id === itemId) closeItemEditor()
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Không thể xóa sản phẩm.'
      showToast(msg, 'error')
    }
  }

  return {
    ...cartState,
    ...selectionState,
    ...editorState,
    ...checkoutState,
    changeQty,
    removeLine,
    formatPrice: PriceFormatter.format
  }
}
