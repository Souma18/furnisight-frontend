<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  quickFilters: { type: Array, default: () => [] },
  selectedCategory: { type: String, default: 'all' },
  saleOnly: { type: Boolean, default: false },
  viewMode: { type: String, default: 'grid' },
  activeFilterCount: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue', 'toggle-category', 'update:view-mode', 'open-filters'])
const { t } = useI18n()

function chipIsActive(chip) {
  if (!chip) return false
  return props.selectedCategory.toLowerCase() === (chip.slug ?? '').toLowerCase()
}

function chipClass(chip) {
  return 'pl-chip'
}
</script>

<template>
  <div class="pl-toolbar">
    <div class="pl-inner pl-toolbar-inner">
      <label class="pl-search-wrap" :aria-label="t('products.searchPlaceholder')">
        <AppIcon name="search" :size="15" />
        <AppInput
          :value="modelValue"
          class="pl-search"
          type="text"
          :placeholder="t('products.searchPlaceholder')"
          @input="emit('update:modelValue', $event.target.value)"
        />
      </label>
      <div class="pl-chips">
        <button
          v-for="chip in quickFilters"
          :key="chip.slug ?? chip.label"
          type="button"
          :class="[chipClass(chip), { active: chipIsActive(chip) }]"
          @click="emit('toggle-category', chip)"
        >
          {{ chip.label }}
        </button>
      </div>
      <button type="button" class="pl-filter-trigger" @click="emit('open-filters')">
        <AppIcon name="filter" :size="16" />
        {{ t('products.filters') }}
        <span v-if="activeFilterCount" class="pl-filter-trigger__count">{{ activeFilterCount }}</span>
      </button>
      <div class="pl-view-toggle">
        <button
          type="button"
          :class="{ active: viewMode === 'grid' }"
          :aria-label="t('products.gridView')"
          @click="emit('update:view-mode', 'grid')"
        >
          <AppIcon name="layoutDashboard" :size="16" />
        </button>
        <button
          type="button"
          :class="{ active: viewMode === 'list' }"
          :aria-label="t('products.listView')"
          @click="emit('update:view-mode', 'list')"
        >
          <AppIcon name="list" :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>
