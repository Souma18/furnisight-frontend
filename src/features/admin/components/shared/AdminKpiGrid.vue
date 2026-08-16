<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  kpis: { type: Array, default: () => [] },
  compact: { type: Boolean, default: false },
  variant: { type: String, default: 'default' },
})
</script>

<template>
  <div :class="variant === 'rev' ? 'rev-kpi' : compact ? 'inv-kpi-grid' : 'kpi-grid'">
    <div v-for="kpi in kpis" :key="kpi.label || kpi.title || kpi.id" class="kpi-card" :class="`kpi-${kpi.tone}`">
      <div class="kpi-accent" />
      <div class="kpi-label" :style="compact ? 'margin-bottom:6px' : undefined">
        <AppIcon v-if="kpi.icon" :name="kpi.icon" :size="16" />
        {{ kpi.label || kpi.title }}
      </div>
      <div class="kpi-value" :style="compact ? 'font-size:28px' : undefined">
        {{ kpi.value }}<small v-if="kpi.suffix" style="font-size:18px">{{ kpi.suffix }}</small>
      </div>
      <div v-if="kpi.change" class="kpi-change" :class="kpi.up === false ? 'kpi-down' : 'kpi-up'">
        <AppIcon :name="kpi.up === false ? 'alert' : 'trendingUp'" :size="13" />
        {{ kpi.change }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.inv-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}
.inv-kpi-grid .kpi-card {
  padding: 14px 16px;
}
@media (max-width: 900px) {
  .inv-kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
