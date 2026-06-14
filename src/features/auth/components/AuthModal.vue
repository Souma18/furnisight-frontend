<script setup>
import AuthContainer from './AuthContainer.vue'

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
  <div v-if="open" class="modal-backdrop">
    <div class="auth-modal-frame">
      <AuthContainer embedded :initialView="initialView" @close="$emit('close')" @authenticated="$emit('authenticated')" />
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 90;
  padding: 1rem;
  background: rgba(2, 7, 17, 0.62);
  display: grid;
  place-items: center;
}

.auth-modal-frame {
  width: 100%;
  max-width: 430px;
}
</style>
