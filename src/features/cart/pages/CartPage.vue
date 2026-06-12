<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import CartItemCard from '../components/CartItemCard.vue'
import CartSummaryBar from '../components/CartSummaryBar.vue'
import { useCart } from '../composables/useCart'
import { productsApi, ProductResponse } from '@shared/lib/api/services'
import { PriceFormatter } from '@shared/lib/formatters'

const router = useRouter()
const { items, ensureHydrated, updateItem, updateQty, removeItem } = useCart()

const activeItem = ref(null)
const activeDraft = ref(null)
const editorLoading = ref(false)
const checkedIds = ref([])

const availableItems = computed(() => items.value.filter((item) => !item.outOfStock))
const availableItemIds = computed(() => availableItems.value.map((item) => item.id))
const allAvailableChecked = computed(() =>
  availableItemIds.value.length > 0 &&
  availableItemIds.value.every((id) => checkedIds.value.includes(id)),
)
const partiallyChecked = computed(() =>
  checkedIds.value.some((id) => availableItemIds.value.includes(id)) && !allAvailableChecked.value,
)

const selectedItems = computed(() =>
  items.value.filter((item) => checkedIds.value.includes(item.id) && !item.outOfStock),
)

const selectedCount = computed(() => selectedItems.value.length)

const total = computed(() =>
  selectedItems.value.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0),
)

watch(
  items,
  (nextItems) => {
    const availableIds = nextItems.filter((item) => !item.outOfStock).map((item) => item.id)
    checkedIds.value = checkedIds.value.filter((id) => availableIds.includes(id))

    if (activeItem.value) {
      const latestItem = nextItems.find((item) => item.id === activeItem.value.id) ?? null
      if (!latestItem) {
        closeItemEditor()
      } else {
        activeItem.value = {
          ...latestItem,
          variants: Array.isArray(latestItem.variants) && latestItem.variants.length
            ? latestItem.variants
            : (activeItem.value.variants ?? []),
          colors: Array.isArray(latestItem.colors) && latestItem.colors.length
            ? latestItem.colors
            : (activeItem.value.colors ?? []),
          sizes: Array.isArray(latestItem.sizes) && latestItem.sizes.length
            ? latestItem.sizes
            : (activeItem.value.sizes ?? []),
        }
      }
    }
  },
  { deep: true },
)

onMounted(() => {
  ensureHydrated()
})

watch(
  () => activeDraft.value?.selectedColor,
  () => {
    if (!activeItem.value || !activeDraft.value) return

    const nextSizes = getVariantOptions(activeItem.value, 'sizes')
    if (!nextSizes.length) return

    if (!nextSizes.includes(activeDraft.value.selectedSize)) {
      activeDraft.value.selectedSize = nextSizes[0]
    }
  },
)

onMounted(async () => {
  try {
    await ensureHydrated({ force: true })
  } catch (error) {
    console.error('Failed to hydrate cart view:', error)
  }
})

function variantSizeLabel(variant) {
  if (!variant) return ''
  if (variant.size) return variant.size
  if (variant.dimensionText) return variant.dimensionText

  const dims = [variant.length, variant.width, variant.height]
    .filter((value) => value != null && value !== '')

  return dims.length === 3 ? `${dims.join(' × ')} cm` : ''
}

function normalizeEditorVariants(variants = []) {
  return variants
    .map((variant) => ({
      ...variant,
      color: variant?.color || '',
      size: variantSizeLabel(variant),
    }))
    .filter((variant) => variant.color || variant.size)
}

async function buildEditorItem(item) {
  const normalizedExistingVariants = normalizeEditorVariants(item?.variants ?? [])
  if (normalizedExistingVariants.length) {
    return {
      ...item,
      variants: normalizedExistingVariants,
    }
  }

  const lookupId = item?.detailId || item?.slug || item?.productId
  if (!lookupId) return item

  try {
    const response = await productsApi.getProductDetail(lookupId)
    const product = new ProductResponse(response?.data)
    const fetchedVariants = normalizeEditorVariants(product?.variants ?? [])

    if (!fetchedVariants.length) {
      return item
    }

    return {
      ...item,
      variants: fetchedVariants,
      colors: Array.isArray(product?.colors) ? product.colors : [],
      sizes: Array.isArray(product?.sizes) ? product.sizes : [],
      selectedColor: item.selectedColor || product?.colors?.[0] || '',
      selectedSize: item.selectedSize || product?.sizes?.[0] || '',
    }
  } catch (error) {
    console.error('Failed to load product variants for cart item:', error)
    return item
  }
}

async function openItemEditor(item) {
  editorLoading.value = true
  try {
    const editorItem = await buildEditorItem(item)
    const colorOptions = getVariantOptions(editorItem, 'colors')
    const nextColor = editorItem.selectedColor || colorOptions[0] || ''
    const sizeOptions = getVariantOptions(editorItem, 'sizes')

    activeItem.value = editorItem
    activeDraft.value = {
      selectedColor: nextColor,
      selectedSize: editorItem.selectedSize || sizeOptions[0] || '',
      qty: Math.max(1, Number(editorItem.qty || 1)),
    }
  } finally {
    editorLoading.value = false
  }
}

function closeItemEditor() {
  activeItem.value = null
  activeDraft.value = null
  editorLoading.value = false
}

function getVariantOptions(item, field) {
  if (!item) return []

  const variants = Array.isArray(item.variants) ? item.variants : []
  if (variants.length) {
    if (field === 'colors') {
      return [...new Set(variants.map((variant) => variant.color).filter(Boolean))]
    }

    if (field === 'sizes') {
      return [...new Set(variants.map((variant) => variantSizeLabel(variant)).filter(Boolean))]
    }
  }

  if (field === 'colors') return (item.colors ?? []).filter(Boolean)
  if (field === 'sizes') return (item.sizes ?? []).filter(Boolean)
  return []
}

function resolveDraftVariantId(item, draft) {
  const variants = Array.isArray(item?.variants) ? item.variants : []
  if (!variants.length) return item?.variantId ?? null

  const selectedColor = draft?.selectedColor || ''
  const selectedSize = draft?.selectedSize || ''

  const matched = variants.find((variant) => {
    const variantColor = variant?.color || ''
    const variantSize = variantSizeLabel(variant)
    const colorMatches = !selectedColor || variantColor === selectedColor
    const sizeMatches = !selectedSize || variantSize === selectedSize
    return colorMatches && sizeMatches
  })

  return matched?.id ?? item?.variantId ?? null
}

async function applyActiveItemChanges() {
  if (!activeItem.value || !activeDraft.value) return

  await updateItem(activeItem.value.id, {
    variantId: resolveDraftVariantId(activeItem.value, activeDraft.value),
    selectedColor: activeDraft.value.selectedColor,
    selectedSize: activeDraft.value.selectedSize,
    qty: Math.max(1, Number(activeDraft.value.qty || 1)),
  })
  closeItemEditor()
}

async function changeQty(item, delta) {
  if (!item || item.outOfStock) return
  try {
    await updateQty(item.id, Number(item.qty || 1) + delta)
  } catch (error) {
    console.error('Failed to update cart quantity:', error)
  }
}

function changeDraftQty(delta) {
  if (!activeDraft.value) return
  activeDraft.value.qty = Math.max(1, Number(activeDraft.value.qty || 1) + delta)
}

function toggleChecked(itemId) {
  if (checkedIds.value.includes(itemId)) {
    checkedIds.value = checkedIds.value.filter((id) => id !== itemId)
    return
  }

  checkedIds.value = [...checkedIds.value, itemId]
}

function toggleAllChecked() {
  if (allAvailableChecked.value) {
    checkedIds.value = checkedIds.value.filter((id) => !availableItemIds.value.includes(id))
    return
  }

  checkedIds.value = [...new Set([...checkedIds.value, ...availableItemIds.value])]
}

async function removeLine(itemId) {
  try {
    await removeItem(itemId)
    checkedIds.value = checkedIds.value.filter((id) => id !== itemId)
    if (activeItem.value?.id === itemId) closeItemEditor()
  } catch (error) {
    console.error('Failed to remove cart line:', error)
  }
}

const formatPrice = PriceFormatter.format

function handleCheckout() {
  if (!selectedCount.value) return
  const lineIds = selectedItems.value.map((item) => item.id).join(',')
  router.push({ path: '/checkout', query: { lines: lineIds } })
}
</script>

<template>
  <div class="cart-page">
    <div class="cart-container">
      <div class="cart-header">
        <h1 class="page-title">Giỏ hàng của bạn</h1>
        <p class="page-subtitle" v-if="items.length">{{ items.length }} sản phẩm trong giỏ hàng</p>
      </div>

      <div class="cart-content" v-if="items.length">
        <div class="select-all-row">
          <label class="select-all-box">
            <input
              type="checkbox"
              :checked="allAvailableChecked"
              :indeterminate="partiallyChecked"
              :disabled="!availableItemIds.length"
              @change="toggleAllChecked"
            >
            <span>Chọn tất cả</span>
          </label>
          <span>{{ selectedCount }} / {{ availableItemIds.length }} sản phẩm</span>
        </div>

        <div class="list">
          <CartItemCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            :checked="checkedIds.includes(item.id)"
            @toggle-check="toggleChecked"
            @open-variant="openItemEditor"
            @change-qty="changeQty"
            @remove="removeLine"
          />
        </div>

        <div class="cart-summary">
          <CartSummaryBar
            :selected-count="selectedCount"
            :total-label="formatPrice(total)"
            :checkout-disabled="!selectedCount"
            @checkout="handleCheckout"
          />
        </div>
      </div>
      
      <div class="cart-empty" v-else>
        <div class="cart-empty-icon">🛒</div>
        <h2>Giỏ hàng trống</h2>
        <p>Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
        <button class="primary-btn continue-shopping" @click="router.push('/products')">Tiếp tục mua sắm</button>
      </div>
    </div>

    <teleport to="body">
      <div v-if="activeItem && activeDraft" class="variant-modal-backdrop" @click.self="closeItemEditor">
        <div class="variant-modal">
          <div class="variant-modal-head">
            <div>
              <p class="variant-modal-kicker">Chọn phân loại</p>
              <h3>{{ activeItem.name }}</h3>
            </div>
            <button type="button" class="close-btn" @click="closeItemEditor">×</button>
          </div>

          <div class="variant-modal-body">
            <label>
              <span>Màu</span>
              <select v-model="activeDraft.selectedColor" :disabled="editorLoading || !getVariantOptions(activeItem, 'colors').length">
                <option v-if="!getVariantOptions(activeItem, 'colors').length" value="">
                  Không có dữ liệu màu
                </option>
                <option v-for="color in getVariantOptions(activeItem, 'colors')" :key="color" :value="color">
                  {{ color }}
                </option>
              </select>
            </label>

            <label>
              <span>Kích thước</span>
              <select v-model="activeDraft.selectedSize" :disabled="editorLoading || !getVariantOptions(activeItem, 'sizes').length">
                <option v-if="!getVariantOptions(activeItem, 'sizes').length" value="">
                  Không có dữ liệu kích thước
                </option>
                <option
                  v-for="size in getVariantOptions(activeItem, 'sizes')"
                  :key="size"
                  :value="size"
                >
                  {{ size }}
                </option>
              </select>
            </label>

            <label>
              <span>Số lượng</span>
              <div class="modal-qty">
                <button type="button" :disabled="editorLoading" @click="changeDraftQty(-1)">−</button>
                <input :value="activeDraft.qty" readonly />
                <button type="button" :disabled="editorLoading" @click="changeDraftQty(1)">+</button>
              </div>
            </label>
          </div>

          <div class="variant-modal-actions">
            <button type="button" class="ghost-btn" :disabled="editorLoading" @click="closeItemEditor">Hủy</button>
            <button type="button" class="primary-btn" :disabled="editorLoading" @click="applyActiveItemChanges">Lưu</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.cart-page {
  background: #faf6f0;
  min-height: calc(100vh - 80px);
  padding: 40px 20px;
  font-family: var(--sans);
  color: #1a1a1a;
}

.cart-container {
  max-width: 1000px;
  margin: 0 auto;
}

.cart-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-title {
  font-family: var(--sans);
  font-size: 42px;
  font-weight: 600;
  color: #12202e;
  margin: 0 0 10px;
}

.page-subtitle {
  color: #7a7a7a;
  font-size: 16px;
  margin: 0;
}

.cart-content {
  background: #fff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(18, 32, 46, 0.05);
  border: 1px solid #ece2cf;
}

.select-all-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #ece2cf;
  color: #7a7a7a;
  font-size: 14px;
}

.select-all-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #12202e;
  font-weight: 700;
  cursor: pointer;
}

.select-all-box input {
  width: 16px;
  height: 16px;
  accent-color: #c9922a;
}

.list { 
  display: grid; 
  gap: 1.25rem; 
}

.cart-summary {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ece2cf;
}

.cart-empty {
  background: #fff;
  border-radius: 24px;
  padding: 60px 30px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(18, 32, 46, 0.05);
  border: 1px solid #ece2cf;
}

.cart-empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  color: #e5b84a;
}

.cart-empty h2 {
  font-size: 24px;
  margin: 0 0 10px;
  color: #12202e;
}

.cart-empty p {
  color: #7a7a7a;
  margin: 0 0 30px;
}

.continue-shopping {
  padding: 14px 32px;
  font-size: 16px;
}

/* Modal styles from CartView */
.modal-qty {
  display: inline-flex;
  align-items: center;
  border: 1px solid #e5dcca;
  border-radius: 10px;
  overflow: hidden;
  background: #f5efe6;
}
.modal-qty button {
  width: 28px;
  height: 30px;
  border: none;
  background: transparent;
  color: #9a8d7a;
  cursor: pointer;
}
.modal-qty input {
  width: 32px;
  height: 30px;
  display: grid;
  place-items: center;
  text-align: center;
  border-inline: 1px solid #e5dcca;
  background: rgba(255,255,255,0.45);
  color: #8b7d68;
}

.variant-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(18, 32, 46, 0.35);
  display: grid;
  place-items: center;
  z-index: 5000;
  padding: 16px;
}

.variant-modal {
  width: min(520px, 100%);
  background: #fff;
  border: 1px solid #ece2cf;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(18, 32, 46, 0.18);
  overflow: hidden;
}

.variant-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid #ece2cf;
}

.variant-modal-kicker {
  margin: 0 0 6px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  color: #c9922a;
}

.variant-modal-head h3 {
  margin: 0;
  font-size: 18px;
  color: #1a1a1a;
}

.close-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 10px;
  background: #f5efe6;
  color: #12202e;
  font-size: 20px;
  cursor: pointer;
}

.variant-modal-body {
  display: grid;
  gap: 14px;
  padding: 18px 20px;
}

.variant-modal-body label {
  display: grid;
  gap: 6px;
}

.variant-modal-body span {
  color: #7a7a7a;
  font-size: 12px;
}

.variant-modal-body select,
.variant-modal-body input {
  width: 100%;
  border: 1px solid #ece2cf;
  border-radius: 12px;
  padding: 0.7rem 0.9rem;
  font: inherit;
  background: #fff;
}

.variant-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 20px 20px;
}

.ghost-btn,
.primary-btn {
  border: none;
  border-radius: 12px;
  padding: 0.72rem 1rem;
  font-weight: 700;
  cursor: pointer;
}

.ghost-btn {
  background: #f5efe6;
  color: #12202e;
}

.primary-btn {
  background: linear-gradient(135deg, #e5b84a, #c9922a);
  color: #12202e;
}

@media (max-width: 720px) {
  .cart-content {
    padding: 15px;
  }
  .variant-modal-actions { flex-direction: column-reverse; }
  .ghost-btn,
  .primary-btn { width: 100%; }
}
</style>
