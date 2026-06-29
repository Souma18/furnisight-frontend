import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from './useCart'
import { useCartSelection } from './useCartSelection'
import { useCartItemEditor } from './useCartItemEditor'
import { useCartCheckout } from './useCartCheckout'
import { PriceFormatter } from '@shared/lib/formatters'
import { useSharedCartActions } from './useSharedCartActions'

export function useCartPage() {
  const router = useRouter()
  
  const cartState = useCart()
  const { items, ensureHydrated, updateItem, loading, hydrated } = cartState
  
  const selectionState = useCartSelection(items)
  const { uncheck, selectedItems, selectedCount } = selectionState
  
  const editorState = useCartItemEditor(items, updateItem)
  const { activeItem, closeItemEditor } = editorState
  
  const checkoutState = useCartCheckout(router, selectedItems, selectedCount, ensureHydrated)
  
  const { changeQty: sharedChangeQty, removeLine: sharedRemoveLine } = useSharedCartActions()

  onMounted(async () => {
    try {
      await ensureHydrated()
    } catch (error) {
      // Hydration state will handle empty/error UI natively
    }
  })

  async function changeQty(item, delta) {
    await sharedChangeQty(item, delta)
  }

  async function removeLine(itemId) {
    await sharedRemoveLine(itemId)
    uncheck(itemId)
    if (activeItem.value?.id === itemId) closeItemEditor()
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
