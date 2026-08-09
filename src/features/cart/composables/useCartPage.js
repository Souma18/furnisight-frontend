import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCart } from './useCart'
import { useCartSelection } from './useCartSelection'
import { useCartItemEditor } from './useCartItemEditor'
import { useCartCheckout } from './useCartCheckout'
import { PriceFormatter } from '@shared/lib/formatters'
import { useSharedCartActions } from './useSharedCartActions'
import { useLocaleStore } from '@shared/stores/localeStore'

export function useCartPage() {
  const router = useRouter()
  const localeStore = useLocaleStore()
  const { locale } = storeToRefs(localeStore)
  
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

  watch(locale, () => {
    ensureHydrated({ force: true }).catch(() => null)
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
