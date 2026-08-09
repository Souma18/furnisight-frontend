<script setup>
import AuthContainer from './AuthContainer.vue'
import AppModal from '@shared/ui/AppModal.vue'

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  initialView: {
    type: String,
    default: 'login',
  },
})

defineEmits(['close', 'authenticated'])
</script>

<template>
  <AppModal
    :open="open"
    width="430px"
    no-bg
    :close-on-backdrop="false"
    @close="$emit('close')"
  >
    <AuthContainer embedded :initialView="initialView" @close="$emit('close')" @authenticated="$emit('authenticated')" />
  </AppModal>
</template>
