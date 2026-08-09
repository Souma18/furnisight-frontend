import { pinia } from '@app/plugins/pinia'
import { useAddressStore } from '@features/account/store/addressStore'
import { useAccountStore } from '@features/account/store/accountStore'
import { useOrderStore } from '@features/account/store/orderStore'
import { useProfileStore } from '@features/account/store/profileStore'
import { useWishlistStore } from '@features/account/store/wishlistStore'
import { useCartStore } from '@features/cart/store/cartStore'
import { useCheckoutStore } from '@features/checkout/store/checkoutStore'
import { useChatStore } from '@features/chat/store/chatStore'

const USER_SESSION_STORAGE_KEYS = [
  'furnisight-cart-store-v1',
  'furnisight-cart-store-v2',
  'furnisight-cart-store-v3',
  'furnisight-cart-store-v4',
]

export async function resetUserSessionState(options = {}) {
  const { clearRemoteCart = false } = options
  const cartStore = useCartStore(pinia)

  if (clearRemoteCart) {
    await cartStore.clearCart().catch(() => null)
  }

  cartStore.resetCartState()
  useCheckoutStore(pinia).resetCheckoutState()
  useOrderStore(pinia).resetOrderState()
  useWishlistStore(pinia).resetWishlistState()
  useAddressStore(pinia).resetAddressState()
  useProfileStore(pinia).resetProfileState()
  useAccountStore(pinia).resetAccountState()
  useChatStore(pinia).resetSession()

  clearSessionStorage()
}

function clearSessionStorage() {
  if (typeof window === 'undefined') return

  for (const key of USER_SESSION_STORAGE_KEYS) {
    window.localStorage.removeItem(key)
  }

  window.sessionStorage.removeItem('furnisight-pending-payment')
}
