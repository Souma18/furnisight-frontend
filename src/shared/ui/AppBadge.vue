<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default', // default, primary, success, warning, danger, info
  },
  pill: {
    type: Boolean,
    default: true,
  },
  icon: {
    type: String,
    default: '',
  },
  dot: {
    type: Boolean,
    default: false,
  }
})

const badgeClasses = computed(() => [
  'app-badge',
  `app-badge--${props.variant}`,
  { 'app-badge--pill': props.pill },
  { 'app-badge--has-dot': props.dot }
])
</script>

<template>
  <span :class="badgeClasses" v-bind="$attrs">
    <span v-if="dot" class="app-badge-dot"></span>
    <AppIcon v-if="icon && !dot" :name="icon" :size="12" class="app-badge-icon" />
    <span class="app-badge-text"><slot /></span>
  </span>
</template>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.2;
  border-radius: 6px;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.app-badge--pill {
  border-radius: 9999px;
  padding: 0.25rem 0.7rem;
}

.app-badge-icon {
  flex-shrink: 0;
}

.app-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
  opacity: 0.8;
}

/* VARIANTS */
.app-badge--default {
  background: var(--bg-muted, #f0f0f0);
  color: var(--text-secondary, #555);
}

.app-badge--primary {
  background: var(--bg-primary-light, #fdf6e8);
  color: var(--btn-primary-bg, #c9922a);
}

.app-badge--success {
  background: var(--bg-success-light, #eaf5ef);
  color: var(--success-color, #2a7a50);
}

.app-badge--warning {
  background: var(--bg-warning-light, #fff6e6);
  color: var(--warning-color, #9a6500);
}

.app-badge--danger {
  background: var(--bg-danger-light, #fdf0ee);
  color: var(--danger-color, #c0392b);
}

.app-badge--info {
  background: var(--bg-info-light, #eef5ff);
  color: var(--info-color, #2364a8);
}

/* Dark mode overrides if needed */
[data-theme='dark'] .app-badge--default { background: #2a3541; color: #a1b0c0; }
[data-theme='dark'] .app-badge--primary { background: rgba(201, 146, 42, 0.15); color: #e6b755; }
[data-theme='dark'] .app-badge--success { background: rgba(42, 122, 80, 0.15); color: #4ade80; }
[data-theme='dark'] .app-badge--warning { background: rgba(154, 101, 0, 0.15); color: #facc15; }
[data-theme='dark'] .app-badge--danger { background: rgba(192, 57, 43, 0.15); color: #f87171; }
[data-theme='dark'] .app-badge--info { background: rgba(35, 100, 168, 0.15); color: #60a5fa; }
</style>
