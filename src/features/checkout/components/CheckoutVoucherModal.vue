<script setup>
import { ref, watch } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  type: { type: String, default: 'shop' },
  vouchers: { type: Array, default: () => [] },
  applying: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'apply-code', 'confirm'])

const codeInput = ref('')
const selectedId = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      codeInput.value = ''
      selectedId.value = ''
    }
  },
)

function selectVoucher(voucher) {
  selectedId.value = voucher.id
}

function handleConfirm() {
  const voucher = props.vouchers.find((item) => item.id === selectedId.value)
  if (voucher) emit('confirm', voucher)
}

function handleApplyCode() {
  if (!codeInput.value.trim()) return
  emit('apply-code', codeInput.value.trim())
}
</script>

<template>
  <div v-if="open" class="co-modal-backdrop" @click.self="$emit('close')">
    <div class="co-modal" role="dialog" aria-modal="true">
      <div class="co-modal-head">
        <p style="font-size: 1rem; font-weight: 600">Chọn <em style="font-style: italic; color: var(--co-gold, #c9922a)">Voucher</em></p>
        <button type="button" class="checkout-card-change" @click="$emit('close')">✕</button>
      </div>

      <div class="co-modal-body">
        <div style="display: flex; gap: 0.45rem; margin-bottom: 0.75rem">
          <input
            v-model="codeInput"
            class="co-opt-input"
            type="text"
            placeholder="Nhập mã voucher..."
            @keyup.enter="handleApplyCode"
          >
          <button type="button" class="co-voucher-btn" :disabled="applying" @click="handleApplyCode">
            Áp dụng
          </button>
        </div>

        <p style="font-size: 0.78rem; font-weight: 600; margin-bottom: 0.45rem">Voucher của bạn</p>

        <label
          v-for="voucher in vouchers"
          :key="voucher.id"
          class="co-voucher-opt"
          :class="{ active: selectedId === voucher.id }"
          @click="selectVoucher(voucher)"
        >
          <input type="radio" name="voucher-opt" :checked="selectedId === voucher.id">
          <AppIcon v-if="voucher.icon" :name="voucher.icon" :size="18" />
          <div style="flex: 1; min-width: 0">
            <p style="font-size: 0.82rem; font-weight: 600">{{ voucher.name }}</p>
            <p style="font-size: 0.72rem; color: var(--co-text-mid, #555)">{{ voucher.desc }}</p>
            <p style="font-size: 0.68rem; color: var(--co-text-light, #888)">{{ voucher.expire }}</p>
          </div>
        </label>
      </div>

      <div class="co-modal-foot">
        <button type="button" class="co-voucher-btn" @click="$emit('close')">Huỷ</button>
        <button type="button" class="co-btn-order" style="width: auto; padding-inline: 1rem" @click="handleConfirm">
          Xác nhận
        </button>
      </div>
    </div>
  </div>
</template>
