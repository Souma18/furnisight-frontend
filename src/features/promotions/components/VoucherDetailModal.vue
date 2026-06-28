<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { conditionText, discountLabel, formatDate, isShippingVoucher } from '../lib/voucherPresentation'

const props = defineProps({
  voucher: { type: Object, default: null },
})

const emit = defineEmits(['close'])
const { t } = useI18n()

const show = computed(() => !!props.voucher)
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-box">
      <AppButton class="modal-close" type="button" @click="emit('close')">
        <AppIcon name="close" :size="16" />
      </AppButton>
      <h3>{{ discountLabel(voucher) }}</h3>
      <p>{{ voucher.description || conditionText(voucher) }}</p>
      <ul>
        <li>{{ t('promotions.voucher.code', { code: voucher.code }) }}</li>
        <li>{{ conditionText(voucher) }}</li>
        <li>{{ t('promotions.voucher.expires', { date: formatDate(voucher.endDate) }) }}</li>
        <li>{{ t('promotions.voucher.discountType', { type: isShippingVoucher(voucher) ? t('promotions.voucher.shipping') : t('promotions.voucher.shop') }) }}</li>
      </ul>
    </div>
  </div>
</template>
