<script setup>
defineProps({
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])
</script>

<template>
  <button
    class="base-button"
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  font: inherit;
  cursor: pointer;
  border: none;
  border-radius: var(--radius, 8px);
  padding: 0.5rem 1rem;
  background: var(--accent);
  color: #fff;
  transition: background 0.15s ease, opacity 0.15s ease;
}

.base-button:hover:not(:disabled) {
  background: var(--accent-hover);
}

.base-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .base-button {
    color: #111827;
  }
}
</style>
