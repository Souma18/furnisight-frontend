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
  transform: translate(-50%, 12px);
  opacity: 0;
  pointer-events: none;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--app-gold, #c9922a) 10%, transparent), transparent),
    var(--app-bg-deep, var(--account-toast-bg));
  border: 1px solid color-mix(in srgb, var(--app-gold, #c9922a) 34%, transparent);
  border-radius: 8px;
  box-shadow: var(--app-shadow, 0 14px 38px rgba(0, 0, 0, 0.24));
  color: var(--app-heading-inverse, var(--color-white));
  font-size: 0.88rem;
  font-weight: 650;
  max-width: min(420px, calc(100vw - 32px));
  padding: 0.78rem 1rem;
  text-align: center;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  z-index: 90;
}
.toast.show {
  opacity: 1;
  transform: translate(-50%, 0);
}
.toast.error {
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--app-danger, #be123c) 16%, transparent), transparent),
    var(--app-bg-deep, var(--account-toast-bg));
  border-color: color-mix(in srgb, var(--app-danger, #be123c) 44%, transparent);
  color: var(--app-heading-inverse, #fffdf9);
}
</style>
