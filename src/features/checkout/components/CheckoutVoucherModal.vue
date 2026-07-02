<script setup>
import { ref, watch } from 'vue'
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import AppInput from '@shared/ui/AppInput.vue'
import AppModal from '@shared/ui/AppModal.vue'

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
  <AppModal :open="open" width="500px" no-bg @close="$emit('close')">
    <div class="co-modal" role="dialog" aria-modal="true">
      <div class="co-modal-head">
        <p style="font-size: 1rem; font-weight: 600" v-html="$t('checkout.voucher.modalTitle')"></p>
        <AppButton variant="unstyled" type="button" class="checkout-card-change" :aria-label="$t('checkout.address.close')" @click="$emit('close')">
          <AppIcon name="close" :size="16" />
        </AppButton>
      </div>

      <div class="co-modal-body">
        <div style="display: flex; gap: 0.45rem; margin-bottom: 0.75rem">
          <AppInput
            v-model="codeInput"
            class="co-opt-input"
            type="text"
            :placeholder="$t('checkout.voucher.placeholder')"
            @keyup.enter="handleApplyCode"
          />
          <AppButton variant="unstyled" type="button" class="co-voucher-btn" :disabled="applying" @click="handleApplyCode">
            {{ $t('checkout.voucher.apply') }}
          </AppButton>
        </div>

        <p style="font-size: 0.78rem; font-weight: 600; margin-bottom: 0.45rem">{{ $t('checkout.voucher.yours') }}</p>

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
        <AppButton variant="unstyled" type="button" class="co-voucher-btn" @click="$emit('close')">{{ $t('checkout.voucher.cancel') }}</AppButton>
        <AppButton variant="unstyled" type="button" class="co-btn-order" style="width: auto; padding-inline: 1rem" :disabled="applying" @click="handleConfirm">
          {{ $t('checkout.voucher.confirm') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
