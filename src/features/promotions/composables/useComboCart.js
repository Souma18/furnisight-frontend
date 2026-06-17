import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@features/cart/store/cartStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { enrichComboItemImage, resolveComboProductImage } from '../lib/comboProductImages'

function sameComboLine(line, item) {
  return String(line.productId || '') === String(item.productId || '')
    && String(line.variantId || '') === String(item.variantId || '')
}

export function useComboCart({
  authRequired,
  onAuthRequired,
  onMessage,
} = {}) {
  const router = useRouter()
  const authStore = useAuthStore()
  const cartStore = useCartStore()
  const addingComboId = ref('')
  const buyingComboId = ref('')
  const pendingCombo = ref(null)
  const pendingComboAction = ref('buy')

  function requireAuth(combo, action) {
    if (!authRequired || authStore.isAuthenticated) return false
    pendingCombo.value = combo
    pendingComboAction.value = action
    onAuthRequired?.()
    return true
  }

  async function ensureComboInCart(combo) {
    if (!Array.isArray(combo?.items) || !combo.items.length) {
      throw new Error('Combo chưa có sản phẩm hợp lệ.')
    }

    await cartStore.ensureHydrated()

    for (const item of combo.items) {
      const requiredQuantity = Math.max(1, Number(item.quantity) || 1)
      const existing = cartStore.items.find((line) => sameComboLine(line, item))
      const currentQuantity = Math.max(0, Number(existing?.qty ?? existing?.quantity) || 0)
      const productImageUrl = await resolveComboProductImage(item)
      const hasWrongImage = existing
        && productImageUrl
        && existing.imageUrl !== productImageUrl

      if (hasWrongImage) {
        await cartStore.removeItem(existing.id)
        await cartStore.addItem({
          productId: item.productId,
          variantId: item.variantId || null,
          name: item.productName,
          imageUrl: productImageUrl,
          price: item.price,
          quantity: Math.max(currentQuantity, requiredQuantity),
        })
      } else if (existing && currentQuantity < requiredQuantity) {
        await cartStore.updateQty(existing.id, requiredQuantity)
      } else if (!existing) {
        await cartStore.addItem({
          productId: item.productId,
          variantId: item.variantId || null,
          name: item.productName,
          imageUrl: productImageUrl,
          price: item.price,
          quantity: requiredQuantity,
        })
      }
    }

    const lineIds = combo.items
      .map((item) => cartStore.items.find((line) => sameComboLine(line, item))?.id)
      .filter(Boolean)

    if (!lineIds.length || lineIds.length !== combo.items.length) {
      throw new Error('Không thể chuẩn bị đầy đủ sản phẩm trong combo.')
    }

    return lineIds
  }

  async function prepareComboCheckout(combo) {
    buyingComboId.value = combo.id
    onMessage?.('')

    try {
      const lineIds = await ensureComboInCart(combo)
      await router.push({
        name: 'checkout',
        query: {
          lines: lineIds.join(','),
          comboId: combo.id,
        },
      })
    } catch (error) {
      onMessage?.(error?.response?.data?.message || error.message || 'Không thể mua combo lúc này.', error)
    } finally {
      buyingComboId.value = ''
    }
  }

  async function addComboToCart(combo) {
    if (!combo?.id) return
    if (requireAuth(combo, 'add')) return

    addingComboId.value = combo.id
    onMessage?.('')
    try {
      await ensureComboInCart(combo)
      onMessage?.('Đã thêm combo vào giỏ.', null, combo)
    } catch (error) {
      onMessage?.(error?.response?.data?.message || error.message || 'Không thể thêm combo lúc này.', error, combo)
    } finally {
      addingComboId.value = ''
    }
  }

  async function buyCombo(combo) {
    if (!combo?.id) return
    if (requireAuth(combo, 'buy')) return
    await prepareComboCheckout(combo)
  }

  watch(
    () => authStore.isAuthenticated,
    (authenticated) => {
      if (!authenticated || !pendingCombo.value) return
      const combo = pendingCombo.value
      const action = pendingComboAction.value
      pendingCombo.value = null
      pendingComboAction.value = 'buy'
      if (action === 'add') {
        addComboToCart(combo)
        return
      }
      prepareComboCheckout(combo)
    },
  )

  return {
    addingComboId,
    buyingComboId,
    addComboToCart,
    buyCombo,
    ensureComboInCart,
    enrichComboItemImage,
  }
}
