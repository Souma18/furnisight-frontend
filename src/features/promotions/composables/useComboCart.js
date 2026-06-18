import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@features/cart/store/cartStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { resolveStockLimit } from '@features/cart/lib/stockGuards'
import { enrichComboItemImage, resolveComboProductImage } from '../lib/comboProductImages'
import { comboStockIssue, enrichComboItemStock } from '../lib/comboStock'

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

  async function ensureComboStock(combo = {}) {
    if (!Array.isArray(combo.items)) return combo
    const needsStock = combo.items.some((item) =>
      resolveStockLimit(item) == null && !item.outOfStock,
    )
    if (!needsStock) return combo

    combo.items = await Promise.all(combo.items.map(enrichComboItemStock))
    combo.stockIssue = comboStockIssue(combo)
    return combo
  }

  async function ensureComboInCart(combo) {
    if (!Array.isArray(combo?.items) || !combo.items.length) {
      throw new Error('Combo chưa có sản phẩm hợp lệ.')
    }
    const preparedCombo = await ensureComboStock(combo)
    const stockIssue = comboStockIssue(preparedCombo)
    if (stockIssue) {
      throw new Error(stockIssue.message || 'Combo có sản phẩm đã hết hàng.')
    }

    await cartStore.ensureHydrated()

    for (const item of preparedCombo.items) {
      const requiredQuantity = Math.max(1, Number(item.quantity) || 1)
      const existing = cartStore.items.find((line) => sameComboLine(line, item))
      const currentQuantity = Math.max(0, Number(existing?.qty ?? existing?.quantity) || 0)
      const productImageUrl = await resolveComboProductImage(item)
      const stockLimit = resolveStockLimit(item)
      const hasWrongImage = existing
        && productImageUrl
        && existing.imageUrl !== productImageUrl
      const targetQuantity = Math.max(currentQuantity, requiredQuantity)

      if (stockLimit != null && stockLimit < targetQuantity) {
        throw new Error(`${item.productName || 'Một sản phẩm trong combo'} không đủ tồn kho.`)
      }

      if (hasWrongImage) {
        await cartStore.removeItem(existing.id)
        await cartStore.addItem({
          productId: item.productId,
          variantId: item.variantId || null,
          name: item.productName,
          imageUrl: productImageUrl,
          price: item.price,
          stockQuantity: stockLimit ?? item.stockQuantity,
          quantity: targetQuantity,
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
          stockQuantity: stockLimit ?? item.stockQuantity,
          quantity: requiredQuantity,
        })
      }
    }

    const lineIds = preparedCombo.items
      .map((item) => cartStore.items.find((line) => sameComboLine(line, item))?.id)
      .filter(Boolean)

    if (!lineIds.length || lineIds.length !== preparedCombo.items.length) {
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
    const preparedCombo = await ensureComboStock(combo)
    const stockIssue = comboStockIssue(preparedCombo)
    if (stockIssue) {
      onMessage?.(stockIssue.message || 'Combo có sản phẩm đã hết hàng.', new Error('combo_out_of_stock'), preparedCombo)
      return
    }
    if (requireAuth(preparedCombo, 'add')) return

    addingComboId.value = preparedCombo.id
    onMessage?.('')
    try {
      await ensureComboInCart(preparedCombo)
      onMessage?.('Đã thêm combo vào giỏ.', null, preparedCombo)
    } catch (error) {
      onMessage?.(error?.response?.data?.message || error.message || 'Không thể thêm combo lúc này.', error, preparedCombo)
    } finally {
      addingComboId.value = ''
    }
  }

  async function buyCombo(combo) {
    if (!combo?.id) return
    const preparedCombo = await ensureComboStock(combo)
    const stockIssue = comboStockIssue(preparedCombo)
    if (stockIssue) {
      onMessage?.(stockIssue.message || 'Combo có sản phẩm đã hết hàng.', new Error('combo_out_of_stock'), preparedCombo)
      return
    }
    if (requireAuth(preparedCombo, 'buy')) return
    await prepareComboCheckout(preparedCombo)
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
