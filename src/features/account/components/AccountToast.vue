<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'success',
  },
})
</script>

<template>
  <div class="toast" :class="[type, { show }]">
    {{ message }}
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 1.4rem;
  left: 50%;
  transform: translate(-50%, 10px);
  opacity: 0;
  pointer-events: none;
  background: var(--account-toast-bg);
  color: var(--color-white);
  border-radius: 999px;
  padding: 0.6rem 1rem;
  transition: all 0.2s ease;
  z-index: 90;
}
.toast.show {
  opacity: 1;
  transform: translate(-50%, 0);
}
.toast.error {
  background: var(--account-toast-error);
}
</style>
