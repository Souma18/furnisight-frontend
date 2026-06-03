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

const emit = defineEmits(['close', 'authenticated'])

function handleBackdropClick(event) {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click="handleBackdropClick">
    <div class="modal-box">
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

.modal-box {
  width: 100%;
  max-width: 430px;
}
</style>
