import { storeToRefs } from 'pinia'
import { useCartStore } from '../store/cartStore'

export function useCart() {
  const cartStore = useCartStore()
  const state = storeToRefs(cartStore)

  return {
    ...state,
    hydrate: cartStore.hydrate,
    ensureHydrated: cartStore.ensureHydrated,
    addItem: cartStore.addItem,
    updateItem: cartStore.updateItem,
    updateQty: cartStore.updateQty,
    removeItem: cartStore.removeItem,
    clearCart: cartStore.clearCart,
  }
}
