<!-- Re-export of CheckoutAddressForm as CheckoutAddressModal -->
<!-- CheckoutAddressForm already contains the full modal (AppModal wrapper, open prop, close/save emits) -->
<script setup>
import CheckoutAddressForm from './CheckoutAddressForm.vue'

defineProps({
  open: { type: Boolean, default: false },
  address: { type: Object, default: null },
})

defineEmits(['close', 'save'])
</script>

<template>
  <CheckoutAddressForm
    :open="open"
    :address="address"
    @close="$emit('close')"
    @save="$emit('save', $event)"
  />
</template>
