<script setup>
import { computed, ref, watch } from 'vue'
import AccountSectionCard from '../AccountSectionCard.vue'
import { productDetailMap } from '@features/product/mock/productDetailMockData'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const activeItem = ref(null)
const checkedIds = ref([])

const selectedItems = computed(() =>
  props.items.filter((item) => checkedIds.value.includes(item.id) && !item.outOfStock),
)

const selectedCount = computed(() => selectedItems.value.length)

const total = computed(() =>
  selectedItems.value.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0),
)

watch(
  () => props.items,
  (items) => {
    const availableIds = items.filter((item) => !item.outOfStock).map((item) => item.id)
    checkedIds.value = checkedIds.value.filter((id) => availableIds.includes(id))
  },
  { deep: true },
)

function openItemEditor(item) {
  activeItem.value = item
}

function closeItemEditor() {
  activeItem.value = null
}

function getProductDetail(item) {
  return item.detailId ? productDetailMap[item.detailId] : null
}

function getVariantOptions(item, field) {
  const detail = getProductDetail(item)
  if (field === 'colors') return item.colors ?? detail?.colors ?? []
  if (field === 'sizes') return item.sizes ?? detail?.sizes ?? []
  return []
}

function getSelectedValue(item, field) {
  if (field === 'colors') return item.selectedColor ?? getVariantOptions(item, 'colors')[0] ?? ''
  return item.selectedSize ?? getVariantOptions(item, 'sizes')[0] ?? ''
}

function applyActiveItemChanges() {
  if (!activeItem.value) return
  activeItem.value.selectedColor = getSelectedValue(activeItem.value, 'colors')
  activeItem.value.selectedSize = getSelectedValue(activeItem.value, 'sizes')
  activeItem.value = null
}

function changeQty(item, delta) {
  item.qty = Math.max(1, Number(item.qty || 1) + delta)
}

function toggleChecked(itemId) {
  if (checkedIds.value.includes(itemId)) {
    checkedIds.value = checkedIds.value.filter((id) => id !== itemId)
    return
  }

  checkedIds.value = [...checkedIds.value, itemId]
}

function removeItem(itemId) {
  const nextItems = props.items.filter((item) => item.id !== itemId)
  props.items.splice(0, props.items.length, ...nextItems)
  checkedIds.value = checkedIds.value.filter((id) => id !== itemId)
  if (activeItem.value?.id === itemId) activeItem.value = null
}

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`
}

function getItemCategory(item) {
  const detail = getProductDetail(item)
  const breadcrumb = detail?.breadcrumb ?? []
  return breadcrumb[breadcrumb.length - 1] ?? 'Sản phẩm'
}

function getVariantLabel(item) {
  const color = getSelectedValue(item, 'colors')
  const size = getSelectedValue(item, 'sizes')
  if (color && size) return `${color} / ${size}`
  return color || size || 'Chọn phân loại'
}

function handleCheckout() {
  if (!selectedCount.value) return
}
</script>

<template>
  <AccountSectionCard title="Giỏ hàng">
    <div class="list">
      <article v-for="item in items" :key="item.id" class="item">
        <div class="item-selection">
          <label v-if="!item.outOfStock" class="select-box" :aria-label="`Chọn ${item.name}`">
            <input
              class="select-box-input"
              type="checkbox"
              :checked="checkedIds.includes(item.id)"
              @change="toggleChecked(item.id)"
            >
            <span class="select-box-ui"></span>
          </label>
          <span v-else class="stock-badge">Hết hàng</span>
        </div>

        <div class="thumb">{{ item.imageFallback ?? '🛍️' }}</div>

        <div class="name-wrap">
          <p class="category">{{ getItemCategory(item) }}</p>
          <p class="name">{{ item.name }}</p>
          <p class="summary">{{ getSelectedValue(item, 'colors') }} / {{ getSelectedValue(item, 'sizes') }}</p>
        </div>

        <button type="button" class="variant-btn" @click="openItemEditor(item)">
          <span class="variant-btn-label">Phân loại: {{ getVariantLabel(item) }}</span>
          <AppIcon name="chevronDown" :size="15" />
        </button>

        <div class="qty-wrap">
          <button type="button" aria-label="Giảm số lượng" @click="changeQty(item, -1)">
            <AppIcon name="minus" :size="15" />
          </button>
          <span>{{ item.qty }}</span>
          <button type="button" aria-label="Tăng số lượng" @click="changeQty(item, 1)">
            <AppIcon name="plus" :size="15" />
          </button>
        </div>

        <p class="line-total">{{ formatPrice(item.price * item.qty) }}</p>
        <button type="button" class="delete-btn" aria-label="Xóa sản phẩm" @click="removeItem(item.id)">
          <AppIcon name="trash2" :size="22" />
        </button>
      </article>
    </div>

    <div class="cart-footer">
      <button
        type="button"
        class="checkout-btn"
        :disabled="!selectedCount"
        @click="handleCheckout"
      >
        Thanh toán ngay
      </button>

      <p class="total">
        Tổng cộng{{ selectedCount ? ` (${selectedCount} sản phẩm)` : '' }}: {{ formatPrice(total) }}
      </p>
    </div>
  </AccountSectionCard>

  <teleport to="body">
    <div v-if="activeItem" class="variant-modal-backdrop" @click.self="closeItemEditor">
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
            <select v-model="activeItem.selectedColor">
              <option v-for="color in getVariantOptions(activeItem, 'colors')" :key="color" :value="color">
                {{ color }}
              </option>
            </select>
          </label>

          <label>
            <span>Kích thước</span>
            <select v-model="activeItem.selectedSize">
              <option v-for="size in getVariantOptions(activeItem, 'sizes')" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </label>

          <label>
            <span>Số lượng</span>
            <div class="modal-qty">
              <button type="button" @click="changeQty(activeItem, -1)">−</button>
              <input :value="activeItem.qty" readonly />
              <button type="button" @click="changeQty(activeItem, 1)">+</button>
            </div>
          </label>
        </div>

        <div class="variant-modal-actions">
          <button type="button" class="ghost-btn" @click="closeItemEditor">Hủy</button>
          <button type="button" class="primary-btn" @click="applyActiveItemChanges">Lưu</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.list { display:grid; gap:0.75rem; }
.item {
  display: grid;
  grid-template-columns: 64px 60px minmax(0, 1.7fr) minmax(110px, 142px) 88px minmax(92px, 104px) 38px;
  gap: 10px;
  align-items: center;
  border: 1px solid var(--auth-border);
  border-radius: 20px;
  padding: 1rem 0.95rem;
  background:
    radial-gradient(circle at top, rgba(201, 146, 42, 0.08), transparent 60%),
    var(--account-surface);
  box-shadow: 0 10px 30px rgba(18, 32, 46, 0.06);
}
.item-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}
.select-box {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.select-box-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  margin: 0;
  cursor: pointer;
}
.select-box-ui {
  position: relative;
  display: inline-block;
  width: 1.05rem;
  height: 1.05rem;
  border: 1px solid #ccb993;
  border-radius: 4px;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.85);
}
.select-box-ui::after {
  content: '';
  position: absolute;
  left: 0.3rem;
  top: 0.08rem;
  width: 0.26rem;
  height: 0.56rem;
  border-right: 2px solid #8b6a21;
  border-bottom: 2px solid #8b6a21;
  transform: rotate(45deg) scale(0.7);
  opacity: 0;
  transition: opacity 0.16s ease, transform 0.16s ease;
}
.select-box-input:checked + .select-box-ui {
  background: rgba(229, 184, 74, 0.18);
  border-color: #c9922a;
}
.select-box-input:checked + .select-box-ui::after {
  opacity: 1;
  transform: rotate(45deg) scale(1);
}
.stock-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.7rem;
  min-width: 56px;
  padding: 0 0.55rem;
  border-radius: 999px;
  background: #a3a3a3;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.05;
  text-align: center;
}
.thumb {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f7f1e8, #ffffff);
  display: grid;
  place-items: center;
  font-size: 22px;
  border: 1px solid rgba(201, 146, 42, 0.15);
}
.name-wrap { min-width: 0; }
.category {
  margin: 0 0 0.2rem;
  color: var(--account-badge);
  font-size: 0.64rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.name {
  margin: 0;
  font-weight: 500;
  line-height: 1.3;
  font-size: 0.84rem;
  color: #1a1a1a;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.summary {
  margin: 0.3rem 0 0;
  color: var(--auth-text-secondary);
  font-size: 0.67rem;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.variant-btn {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border: 1px solid var(--auth-border);
  border-radius: 999px;
  padding: 0.54rem 0.68rem;
  background: linear-gradient(180deg, #f2f2f2, #e9e9e9);
  color: #8b8b8b;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.7rem;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
}
.variant-btn-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.line-total {
  margin: 0;
  text-align: right;
  font-weight: 600;
  font-size: 0.84rem;
  min-width: 0;
}
.line-total { color: var(--account-badge); }
.qty-wrap,
.modal-qty {
  display: inline-flex;
  align-items: center;
  justify-self: center;
  border: 1px solid #e5dcca;
  border-radius: 10px;
  overflow: hidden;
  background: #f5efe6;
}
.qty-wrap button,
.modal-qty button {
  width: 28px;
  height: 30px;
  border: none;
  background: transparent;
  color: #9a8d7a;
  cursor: pointer;
}
.qty-wrap span,
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
.delete-btn {
  justify-self: center;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid #d7d0c4;
  background: transparent;
  color: #7d776d;
  cursor: pointer;
  transition: all 0.2s;
}
.delete-btn:hover {
  background: #f5efe6;
  color: #5f5950;
}
.cart-footer {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
}
.checkout-btn {
  border: none;
  border-radius: 10px;
  padding: 0.72rem 1.15rem;
  background: linear-gradient(135deg, var(--auth-brand-start), var(--auth-brand-end));
  color: var(--color-white);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(18, 32, 46, 0.12);
  transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.checkout-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(18, 32, 46, 0.16);
}
.checkout-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}
.total {
  margin: 0;
  font-weight: 700;
  color: var(--account-badge);
  text-align: right;
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
  color: var(--auth-text-primary);
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
  color: var(--auth-text-secondary);
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

@media (max-width: 1280px) {
  .item {
    grid-template-columns: 84px minmax(0, 1fr);
    grid-template-areas:
      'select select'
      'thumb name'
      'thumb variant'
      'qty total'
      'delete delete';
  }
  .item-selection { grid-area: select; justify-content: flex-start; }
  .thumb { grid-area: thumb; width: 72px; height: 64px; }
  .name-wrap { grid-area: name; }
  .variant-btn { grid-area: variant; justify-self: start; }
  .qty-wrap { grid-area: qty; }
  .line-total { grid-area: total; text-align: right; align-self: center; }
  .delete-btn { grid-area: delete; justify-self: start; }
}

@media (max-width: 720px) {
  .item {
    grid-template-columns: 74px minmax(0, 1fr);
    gap: 10px;
    padding: 0.75rem;
  }
  .thumb { width: 70px; height: 62px; font-size: 26px; }
  .item {
    grid-template-areas:
      'select select'
      'thumb name'
      'variant variant'
      'qty qty'
      'total delete';
  }
  .variant-btn { width: 100%; }
  .qty-wrap { justify-self: start; }
  .line-total { text-align: left; }
  .cart-footer {
    flex-direction: column;
    align-items: stretch;
  }
  .checkout-btn,
  .total {
    width: 100%;
  }
  .total { text-align: left; }
  .variant-modal-actions { flex-direction: column-reverse; }
  .ghost-btn,
  .primary-btn { width: 100%; }
}
</style>
