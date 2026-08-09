<script setup>
import { ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  collapsible: {
    type: Boolean,
    default: false,
  },
  defaultExpanded: {
    type: Boolean,
    default: false,
  }
})

const isExpanded = ref(props.defaultExpanded)

function toggle() {
  if (props.collapsible) {
    isExpanded.value = !isExpanded.value
  }
}
</script>

<template>
  <section class="card" :class="{ collapsible, collapsed: !isExpanded }">
    <header class="card-head" @click="toggle" :style="{ cursor: collapsible ? 'pointer' : 'default' }">
      <h3>{{ title }}</h3>
      <div class="card-head-right">
        <slot name="head" />
        <AppIcon
          v-if="collapsible"
          name="chevronDown"
          :size="18"
          class="chevron-icon"
          :class="{ rotated: isExpanded }"
        />
      </div>
    </header>
    <div v-show="!collapsible || isExpanded" class="card-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.card {
  background: var(--acc-surface, var(--app-surface));
  border: 1px solid var(--acc-line, var(--app-border));
  border-radius: 8px;
  box-shadow: 0 18px 42px rgba(18, 32, 46, 0.055);
  overflow: hidden;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 18px 20px;
  border-bottom: 1px solid var(--acc-line, var(--app-border));
}
.card-head h3 {
  margin: 0;
  color: var(--acc-ink, var(--app-heading));
  font-size: 1.05rem;
  font-weight: 760;
  letter-spacing: 0;
}
.card-head-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.chevron-icon {
  color: var(--acc-muted, var(--app-text-muted));
  transition: transform 0.2s ease;
}
.chevron-icon.rotated {
  transform: rotate(180deg);
}
.card.collapsed .card-head {
  border-bottom: none;
}
.card-body {
  padding: 20px;
}

@media (max-width: 640px) {
  .card-head,
  .card-body {
    padding: 16px;
  }
}
</style>
