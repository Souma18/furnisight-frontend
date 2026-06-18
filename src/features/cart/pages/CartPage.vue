<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CartItemCard from '../components/CartItemCard.vue'
import CartSummaryBar from '../components/CartSummaryBar.vue'
import { useCart } from '../composables/useCart'
import { useCartCheckout } from '../composables/useCartCheckout'
import { useCartItemEditor } from '../composables/useCartItemEditor'
import { useCartSelection } from '../composables/useCartSelection'
import { PriceFormatter } from '@shared/lib/formatters'

const router = useRouter()
const { items, ensureHydrated, updateItem, updateQty, removeItem } = useCart()
const {
  checkedIds,
  availableItemIds,
  allAvailableChecked,
  partiallyChecked,
  selectedItems,
  selectedCount,
  total,
  toggleChecked,
  toggleAllChecked,
  uncheck,
} = useCartSelection(items)
const {
  activeItem,
  activeDraft,
  editorLoading,
  openItemEditor,
  closeItemEditor,
  getVariantOptions,
  applyActiveItemChanges,
  changeDraftQty,
  setDraftQty,
} = useCartItemEditor(items, updateItem)
const { handleCheckout } = useCartCheckout(router, selectedItems, selectedCount, ensureHydrated)

onMounted(async () => {
  try {
    await ensureHydrated()
  } catch (error) {
    console.error('Failed to hydrate cart view:', error)
  }
})

async function changeQty(item, delta) {
  if (!item || item.outOfStock) return
  try {
    await updateQty(item.id, Number(item.qty || 1) + delta)
  } catch (error) {
    console.error('Failed to update cart quantity:', error)
  }
}

async function removeLine(itemId) {
  try {
    await removeItem(itemId)
    uncheck(itemId)
    if (activeItem.value?.id === itemId) closeItemEditor()
  } catch (error) {
    console.error('Failed to remove cart line:', error)
  }
}

const formatPrice = PriceFormatter.format
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

            <p v-if="activeItem.variantLoadFailed" class="variant-modal-hint">
              Không tải được dữ liệu phân loại cho sản phẩm này. Vui lòng xóa sản phẩm và thêm lại từ trang chi tiết nếu cần đổi phân loại.
            </p>

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
                <input
                  :value="activeDraft.qty"
                  type="number"
                  inputmode="numeric"
                  min="1"
                  :disabled="editorLoading"
                  @input="setDraftQty($event.target.value)"
                  @blur="setDraftQty($event.target.value)"
                />
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
.modal-qty input::-webkit-outer-spin-button,
.modal-qty input::-webkit-inner-spin-button { margin: 0; appearance: none; }
.modal-qty input[type="number"] { appearance: textfield; }

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

.variant-modal-hint {
  margin: 0;
  padding: 0.65rem 0.75rem;
  border: 1px solid #efd7a5;
  border-radius: 10px;
  background: #fff8e8;
  color: #8b6a21;
  font-size: 0.82rem;
  line-height: 1.45;
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
