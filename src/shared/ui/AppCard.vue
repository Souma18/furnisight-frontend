<script setup>
defineProps({
  noPadding: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  }
})
</script>

<template>
  <div class="app-card" v-bind="$attrs">
    <div v-if="$slots.header || title" class="app-card-header">
      <slot name="header">
        <h3 v-if="title" class="app-card-title">{{ title }}</h3>
      </slot>
    </div>
    
    <div class="app-card-body" :class="{ 'app-card-body--no-padding': noPadding }">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="app-card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.app-card {
  background: var(--bg-card, #fff);
  border-radius: 12px;
  border: 1px solid var(--border-color, #e0d9ce);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.app-card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e0d9ce);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-card-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary, #333);
}

.app-card-body {
  padding: 1.5rem;
  flex: 1;
}

.app-card-body--no-padding {
  padding: 0;
}

.app-card-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-color, #e0d9ce);
  background: var(--bg-muted, #fbfaf8);
}

/* Dark mode */
[data-theme='dark'] .app-card {
  background: var(--bg-card-dark, #162433);
  border-color: var(--border-dark, #2a4054);
}
[data-theme='dark'] .app-card-header,
[data-theme='dark'] .app-card-footer {
  border-color: var(--border-dark, #2a4054);
}
[data-theme='dark'] .app-card-title {
  color: #fff;
}
[data-theme='dark'] .app-card-footer {
  background: rgba(0, 0, 0, 0.15);
}
</style>
