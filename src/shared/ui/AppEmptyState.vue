<script setup>
import AppIcon from './AppIcon.vue'
import AppButton from './AppButton.vue'

defineProps({
  icon: {
    type: String,
    default: 'box', // box, Inbox, Search, etc
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  actionText: {
    type: String,
    default: '',
  },
  iconSize: {
    type: Number,
    default: 48,
  }
})

const emit = defineEmits(['action'])
</script>

<template>
  <div class="app-empty-state" v-bind="$attrs">
    <div class="app-empty-icon-wrapper">
      <slot name="icon">
        <AppIcon :name="icon" :size="iconSize" class="app-empty-icon" />
      </slot>
    </div>
    
    <h3 class="app-empty-title">{{ title }}</h3>
    
    <p v-if="description" class="app-empty-desc">
      {{ description }}
    </p>
    
    <div v-if="actionText || $slots.action" class="app-empty-actions">
      <slot name="action">
        <AppButton v-if="actionText" variant="outline" @click="emit('action')">
          {{ actionText }}
        </AppButton>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.app-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1.5rem;
  background: var(--bg-card, #fff);
  border-radius: 12px;
  border: 1px dashed var(--border-color, #e0d9ce);
  width: 100%;
}

.app-empty-icon-wrapper {
  margin-bottom: 1.25rem;
  color: var(--text-disabled, #ccc3b6);
}

.app-empty-title {
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary, #333);
}

.app-empty-desc {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
  max-width: 400px;
  line-height: 1.5;
}

.app-empty-actions {
  margin-top: 1.5rem;
}

/* Dark theme */
[data-theme='dark'] .app-empty-state {
  background: var(--bg-card-dark, #162433);
  border-color: var(--border-dark, #2a4054);
}
[data-theme='dark'] .app-empty-icon-wrapper {
  color: #3b5066;
}
[data-theme='dark'] .app-empty-title {
  color: #fff;
}
[data-theme='dark'] .app-empty-desc {
  color: #a1b0c0;
}
</style>
