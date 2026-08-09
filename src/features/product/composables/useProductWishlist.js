import { ref } from 'vue'
import { useWishlistStore } from '@features/account/store/wishlistStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { openAuthModal } from '@features/auth/lib/authModalBus'

export function useProductWishlist({ product }) {
  const wishlistStore = useWishlistStore()
  const authStore = useAuthStore()
  const wished = ref(false)

  async function checkWishlist() {
    if (authStore.isAuthenticated && product.value) {
      await wishlistStore.loadWishlist().catch(() => [])
      wished.value = wishlistStore.hasFavoriteProduct(product.value.id)
    } else {
      wished.value = false
    }
  }

  async function addToWishlist() {
    if (!product.value) return

    if (!authStore.isAuthenticated) {
      openAuthModal()
      return
    }

    try {
      if (wishlistStore.hasFavoriteProduct(product.value.id)) {
        await wishlistStore.removeFavorite(product.value.id)
        wished.value = false
      } else {
        await wishlistStore.addFavorite(product.value.id)
        wished.value = true
      }
    } catch (e) {
      console.error('Failed to toggle favorite product:', e)
    }
  }

  return {
    wished,
    checkWishlist,
    addToWishlist,
  }
}
