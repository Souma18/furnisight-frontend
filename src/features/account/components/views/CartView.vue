<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AccountSectionCard from '../AccountSectionCard.vue'
import CartItemCard from '@features/cart/components/CartItemCard.vue'
import CartSummaryBar from '@features/cart/components/CartSummaryBar.vue'
import { useCart } from '@features/cart/composables/useCart'
import { useCartCheckout } from '@features/cart/composables/useCartCheckout'
import { useCartItemEditor } from '@features/cart/composables/useCartItemEditor'
import { useCartSelection } from '@features/cart/composables/useCartSelection'
import { PriceFormatter } from '@shared/lib/formatters'

const router = useRouter()
const { t } = useI18n()
const emit = defineEmits(['notify'])
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
    emit('notify', t('account.cart.loadFailed') || 'Lỗi tải giỏ hàng', 'error')
  }
})

async function changeQty(item, delta) {
  if (!item || item.outOfStock) return
  try {
    await updateQty(item.id, Number(item.qty || 1) + delta)
  } catch (error) {
    emit('notify', t('account.cart.updateFailed') || 'Lỗi cập nhật số lượng', 'error')
  }
}

async function removeLine(itemId) {
  try {
    await removeItem(itemId)
    uncheck(itemId)
    if (activeItem.value?.id === itemId) closeItemEditor()
  } catch (error) {
    emit('notify', t('account.cart.removeFailed') || 'Lỗi xoá sản phẩm', 'error')
  }
}

const formatPrice = PriceFormatter.format
</script>

<template>
  <AccountSectionCard :title="t('account.cart.title')">
    <div v-if="items.length" class="select-all-row">
      <label class="select-all-box">
        <input
          type="checkbox"
          :checked="allAvailableChecked"
          :indeterminate="partiallyChecked"
          :disabled="!availableItemIds.length"
          @change="toggleAllChecked"
        >
        <span>{{ t('account.cart.selectAll') }}</span>
      </label>
      <span>{{ t('account.cart.selectedCount', { selected: selectedCount, total: availableItemIds.length }) }}</span>
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
            <p class="variant-modal-kicker">{{ t('account.cart.chooseVariant') }}</p>
            <h3>{{ activeItem.name }}</h3>
          </div>
          <AppButton type="button" class="close-btn" @click="closeItemEditor">×</AppButton>
        </div>

        <div class="variant-modal-body">
          <label>
            <span>{{ t('account.cart.color') }}</span>
            <select v-model="activeDraft.selectedColor" :disabled="editorLoading || !getVariantOptions(activeItem, 'colors').length">
              <option v-if="!getVariantOptions(activeItem, 'colors').length" value="">
                {{ t('account.cart.noColorData') }}
              </option>
              <option v-for="color in getVariantOptions(activeItem, 'colors')" :key="color" :value="color">
                {{ color }}
              </option>
            </select>
          </label>

          <p v-if="activeItem.variantLoadFailed" class="variant-modal-hint">
            {{ t('account.cart.variantLoadFailed') }}
          </p>

          <label>
            <span>{{ t('account.cart.size') }}</span>
            <select v-model="activeDraft.selectedSize" :disabled="editorLoading || !getVariantOptions(activeItem, 'sizes').length">
              <option v-if="!getVariantOptions(activeItem, 'sizes').length" value="">
                {{ t('account.cart.noSizeData') }}
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
            <span>{{ t('account.cart.quantity') }}</span>
            <div class="modal-qty">
              <AppButton type="button" :disabled="editorLoading" @click="changeDraftQty(-1)">−</AppButton>
              <AppInput
                :value="activeDraft.qty"
                type="number"
                inputmode="numeric"
                min="1"
                :disabled="editorLoading"
                @input="setDraftQty($event.target.value)"
                @blur="setDraftQty($event.target.value || 1)"
              />
              <AppButton type="button" :disabled="editorLoading" @click="changeDraftQty(1)">+</AppButton>
            </div>
          </label>
        </div>

        <div class="variant-modal-actions">
          <AppButton type="button" class="ghost-btn" :disabled="editorLoading" @click="closeItemEditor">{{ t('common.cancel') }}</AppButton>
          <AppButton type="button" class="primary-btn" :disabled="editorLoading" @click="applyActiveItemChanges">{{ t('common.save') }}</AppButton>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.list { display:grid; gap:0.75rem; }
.select-all-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ece2cf;
  color: var(--auth-text-secondary);
  font-size: 14px;
}
.select-all-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--auth-text-primary);
  font-weight: 700;
  cursor: pointer;
}
.select-all-box input {
  width: 16px;
  height: 16px;
  accent-color: #c9922a;
}
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
  .variant-modal-actions { flex-direction: column-reverse; }
  .ghost-btn,
  .primary-btn { width: 100%; }
}
</style>
