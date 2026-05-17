<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
  quickFilters: { type: Array, default: () => [] },
  selectedCategory: { type: String, default: 'all' },
  saleOnly: { type: Boolean, default: false },
  viewMode: { type: String, default: 'grid' },
})

const emit = defineEmits(['update:modelValue', 'toggle-category', 'update:view-mode'])

function chipIsActive(chip) {
  if (!chip) return false
  if (chip.slug === 'sale') return props.saleOnly
  return props.selectedCategory.toLowerCase() === (chip.slug ?? '').toLowerCase()
}

function chipClass(chip) {
  if (!chip) return 'pl-chip'
  return chip.slug === 'sale' ? 'pl-chip pl-chip-sale' : 'pl-chip'
}
</script>

<template>
  <div class="pl-toolbar">
    <div class="pl-inner pl-toolbar-inner">
      <input
        :value="modelValue"
        class="pl-search"
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        @input="emit('update:modelValue', $event.target.value)"
      />
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
      <div class="pl-view-toggle">
        <button type="button" :class="{ active: viewMode === 'grid' }" @click="emit('update:view-mode', 'grid')">
          ⊞
        </button>
        <button type="button" :class="{ active: viewMode === 'list' }" @click="emit('update:view-mode', 'list')">
          ☰
        </button>
      </div>
    </div>
  </div>
</template>
