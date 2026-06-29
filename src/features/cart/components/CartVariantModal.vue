<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'

const props = defineProps({
  activeItem: { type: Object, default: null },
  activeDraft: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  getVariantOptions: { type: Function, required: true }
})

const emit = defineEmits(['close', 'save', 'change-qty', 'set-qty'])
</script>

<template>
  <teleport to="body">
    <div v-if="activeItem && activeDraft" class="variant-modal-backdrop" @click.self="emit('close')">
      <div class="variant-modal">
        <div class="variant-modal-head">
          <div>
            <p class="variant-modal-kicker">Chọn phân loại</p>
            <h3>{{ activeItem.name }}</h3>
          </div>
          <AppButton type="button" class="close-btn" @click="emit('close')">×</AppButton>
        </div>

        <div class="variant-modal-body">
          <label>
            <span>Màu</span>
            <select v-model="activeDraft.selectedColor" :disabled="loading || !props.getVariantOptions(activeItem, 'colors').length">
              <option v-if="!props.getVariantOptions(activeItem, 'colors').length" value="">
                Không có dữ liệu màu
              </option>
              <option v-for="color in props.getVariantOptions(activeItem, 'colors')" :key="color" :value="color">
                {{ color }}
              </option>
            </select>
          </label>

          <p v-if="activeItem.variantLoadFailed" class="variant-modal-hint">
            Không tải được dữ liệu phân loại cho sản phẩm này. Vui lòng xóa sản phẩm và thêm lại từ trang chi tiết nếu cần đổi phân loại.
          </p>

          <label>
            <span>Kích thước</span>
            <select v-model="activeDraft.selectedSize" :disabled="loading || !props.getVariantOptions(activeItem, 'sizes').length">
              <option v-if="!props.getVariantOptions(activeItem, 'sizes').length" value="">
                Không có dữ liệu kích thước
              </option>
              <option
                v-for="size in props.getVariantOptions(activeItem, 'sizes')"
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
              <AppButton type="button" :disabled="loading" @click="emit('change-qty', -1)">−</AppButton>
              <AppInput
                :value="activeDraft.qty"
                type="number"
                inputmode="numeric"
                min="1"
                :disabled="loading"
                @input="emit('set-qty', $event.target.value)"
                @blur="emit('set-qty', $event.target.value)"
              />
              <AppButton type="button" :disabled="loading" @click="emit('change-qty', 1)">+</AppButton>
            </div>
          </label>
        </div>

        <div class="variant-modal-actions">
          <AppButton type="button" class="ghost-btn" :disabled="loading" @click="emit('close')">Hủy</AppButton>
          <AppButton type="button" class="primary-btn" :disabled="loading" @click="emit('save')">Lưu</AppButton>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.modal-qty {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--app-border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--app-surface-soft);
}
.modal-qty button {
  width: 28px;
  height: 30px;
  border: none;
  background: transparent;
  color: var(--app-text-muted);
  cursor: pointer;
}
.modal-qty input {
  width: 32px;
  height: 30px;
  display: grid;
  place-items: center;
  text-align: center;
  border-inline: 1px solid var(--app-border);
  background: transparent;
  color: var(--app-heading);
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
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.variant-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--app-border);
}

.variant-modal-kicker {
  margin: 0 0 6px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--app-gold);
}

.variant-modal-head h3 {
  margin: 0;
  font-size: 18px;
  color: var(--app-heading);
}

.close-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 10px;
  background: var(--app-surface-soft);
  color: var(--app-heading);
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
  color: var(--app-text-muted);
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
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 0.7rem 0.9rem;
  font: inherit;
  background: var(--app-surface);
  color: var(--app-heading);
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
  background: var(--app-surface-soft);
  color: var(--app-heading);
}

.primary-btn {
  background: var(--app-gold);
  color: #12202e;
}

@media (max-width: 720px) {
  .variant-modal-actions { flex-direction: column-reverse; }
  .ghost-btn,
  .primary-btn { width: 100%; }
}
</style>
