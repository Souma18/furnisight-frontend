<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** `string` (legacy: mục đầu mặc định link `/`) hoặc `{ label, to? }` */
  breadcrumb: { type: Array, default: () => [] },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  stats: { type: Array, default: () => [] },
})

const crumbs = computed(() =>
  props.breadcrumb.map((raw, idx) => {
    if (typeof raw === 'string') {
      return { label: raw, to: idx === 0 ? '/' : undefined }
    }
    return { label: raw.label, to: raw.to }
  }),
)

const hasStats = computed(() => {
  if (!props.stats || !props.stats.length) return false
  return props.stats.some(stat => {
    const val = stat.value
    return val !== 0 && val !== '0' && val !== '—' && val !== '' && val !== null && val !== undefined
  })
})
</script>

<template>
  <div>
    <div class="pl-breadcrumb">
      <div class="pl-inner">
        <template v-for="(item, idx) in crumbs" :key="`${item.label}-${idx}`">
          <RouterLink v-if="item.to" :to="item.to">{{ item.label }}</RouterLink>
          <span v-else>{{ item.label }}</span>
          <span v-if="idx < crumbs.length - 1">›</span>
        </template>
      </div>
    </div>

    <div class="pl-hero">
      <div class="pl-inner pl-hero-inner">
        <div>
          <h1 class="pl-title">{{ title }}</h1>
          <p class="pl-subtitle">{{ subtitle }}</p>
        </div>
        <div v-if="hasStats" class="pl-hero-stats">
          <div v-for="stat in stats" :key="stat.label" class="pl-stat">
            <p class="pl-num">{{ stat.value }}</p>
            <p class="pl-label">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
