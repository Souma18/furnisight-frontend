<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AccountSectionCard from '../AccountSectionCard.vue'
import CartItemCard from '@features/cart/components/CartItemCard.vue'
import CartSummaryBar from '@features/cart/components/CartSummaryBar.vue'
import { useCart } from '@features/cart/composables/useCart'

const router = useRouter()
const { items, ensureHydrated, updateItem, updateQty, removeItem } = useCart()

const activeItem = ref(null)
const activeDraft = ref(null)
const checkedIds = ref([])

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
        activeItem.value = latestItem
      }
    }
  },
  { deep: true },
)

onMounted(() => {
  ensureHydrated()
})

function openItemEditor(item) {
  activeItem.value = item
  activeDraft.value = {
    selectedColor: item.selectedColor ?? item.colors?.[0] ?? '',
    selectedSize: item.selectedSize ?? item.sizes?.[0] ?? '',
    qty: Math.max(1, Number(item.qty || 1)),
  }
}

function closeItemEditor() {
  activeItem.value = null
  activeDraft.value = null
}

function getVariantOptions(item, field) {
  if (!item) return []
  if (field === 'colors') return item.colors ?? []
  if (field === 'sizes') return item.sizes ?? []
  return []
}

async function applyActiveItemChanges() {
  if (!activeItem.value || !activeDraft.value) return

  await updateItem(activeItem.value.id, {
    selectedColor: activeDraft.value.selectedColor,
    selectedSize: activeDraft.value.selectedSize,
    qty: Math.max(1, Number(activeDraft.value.qty || 1)),
  })
  closeItemEditor()
}

function changeQty(item, delta) {
  if (!item || item.outOfStock) return
  updateQty(item.id, Number(item.qty || 1) + delta)
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

function removeLine(itemId) {
  removeItem(itemId)
  checkedIds.value = checkedIds.value.filter((id) => id !== itemId)
  if (activeItem.value?.id === itemId) closeItemEditor()
}

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`
}

function handleCheckout() {
  if (!selectedCount.value) return
  const lineIds = selectedItems.value.map((item) => item.id).join(',')
  router.push({ path: '/checkout', query: { lines: lineIds } })
}
</script>

<template>
  <AccountSectionCard title="Giỏ hàng">
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

    <CartSummaryBar
      :selected-count="selectedCount"
      :total-label="formatPrice(total)"
      :checkout-disabled="!selectedCount"
      @checkout="handleCheckout"
    />
  </AccountSectionCard>

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
            <select v-model="activeDraft.selectedColor">
              <option v-for="color in getVariantOptions(activeItem, 'colors')" :key="color" :value="color">
                {{ color }}
              </option>
            </select>
          </label>

          <label>
            <span>Kích thước</span>
            <select v-model="activeDraft.selectedSize">
              <option v-for="size in getVariantOptions(activeItem, 'sizes')" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </label>

          <label>
            <span>Số lượng</span>
            <div class="modal-qty">
              <button type="button" @click="changeDraftQty(-1)">−</button>
              <input :value="activeDraft.qty" readonly />
              <button type="button" @click="changeDraftQty(1)">+</button>
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

@media (max-width: 720px) {
  .variant-modal-actions { flex-direction: column-reverse; }
  .ghost-btn,
  .primary-btn { width: 100%; }
}
</style>
