<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button',
  },
  variant: {
    type: String,
    default: 'primary', // primary, outline, cancel, danger, ghost, unstyled
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg, unstyled
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  return [
    props.variant === 'unstyled' ? '' : 'app-btn',
    props.variant === 'unstyled' ? '' : `app-btn--${props.variant}`,
    props.size === 'unstyled' || props.variant === 'unstyled' ? '' : `app-btn--${props.size}`,
    { 'app-btn--loading': props.loading }
  ].filter(Boolean)
})
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="emit('click', $event)"
  >
    <AppIcon v-if="loading" name="loader" class="app-btn-spinner" :size="14" />
    <AppIcon v-else-if="icon" :name="icon" :size="14" />
    <slot />
  </button>
</template>

<style scoped>
.app-btn {
  border-radius: 8px;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: all 0.2s ease;
  margin: 0;
  text-decoration: none;
}

.app-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.app-btn-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* SIZES */
.app-btn--sm {
  padding: 4px 8px;
  font-size: 11px;
  min-height: 28px;
}
.app-btn--md {
  padding: 8px 14px;
  font-size: 12px;
  min-height: 34px;
}
.app-btn--lg {
  padding: 10px 18px;
  font-size: 14px;
  min-height: 42px;
}

/* VARIANTS */
.app-btn--primary {
  background: var(--btn-primary-bg, #c9953a);
  color: var(--btn-primary-text, #fff);
  border: 1px solid var(--btn-primary-bg, #c9953a);
}
.app-btn--primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.app-btn--outline {
  background: transparent;
  color: var(--btn-primary-bg, #c9953a);
  border: 1px solid var(--btn-primary-bg, #c9953a);
}
.app-btn--outline:hover:not(:disabled) {
  background: color-mix(in srgb, var(--btn-primary-bg, #c9953a) 10%, transparent);
}

.app-btn--cancel {
  background: var(--app-surface, transparent);
  color: var(--app-text, #746b5f);
  border: 1px solid var(--app-border, #e0d9ce);
}
.app-btn--cancel:hover:not(:disabled) {
  background: var(--app-control-bg, #f5f0e6);
}

.app-btn--danger {
  background: var(--danger-color, #c0392b);
  color: #fff;
  border: 1px solid var(--danger-color, #c0392b);
}
.app-btn--danger:hover:not(:disabled) {
  filter: brightness(1.1);
}

.app-btn--danger-outline {
  background: transparent;
  color: var(--danger-color, #c0392b);
  border: 1px solid var(--danger-color, #c0392b);
}
.app-btn--danger-outline:hover:not(:disabled) {
  background: color-mix(in srgb, var(--danger-color, #c0392b) 10%, transparent);
}

.app-btn--ghost {
  background: transparent;
  color: inherit;
  border: 1px solid transparent;
}
.app-btn--ghost:hover:not(:disabled) {
  background: var(--bg-hover, #f5f0e6);
}
</style>
