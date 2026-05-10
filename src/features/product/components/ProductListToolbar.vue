<script setup>
/** Chip nhanh → id danh mục sidebar/API (khớp PRODUCT_SIDEBAR_CATEGORIES). */
const CHIP_TO_CATEGORY = {
  'giường ngủ': 'giường ngủ',
  'tủ quần áo': 'tủ quần áo',
  'đầu tủ': 'đầu tủ & kệ',
  'bàn trang điểm': 'bàn trang điểm',
  'đèn ngủ': 'đèn & phụ kiện',
}

const props = defineProps({
  modelValue: { type: String, default: '' },
  quickFilters: { type: Array, default: () => [] },
  selectedCategory: { type: String, default: 'all' },
  saleOnly: { type: Boolean, default: false },
  viewMode: { type: String, default: 'grid' },
})

const emit = defineEmits(['update:modelValue', 'toggle-category', 'update:view-mode'])

function chipCategoryId(chip) {
  const k = chip.toLowerCase()
  if (k.includes('sale')) return null
  return CHIP_TO_CATEGORY[k] ?? k
}

function chipIsActive(chip) {
  const k = chip.toLowerCase()
  if (k.includes('sale')) return props.saleOnly
  const id = chipCategoryId(chip)
  return id != null && props.selectedCategory === id
}

function chipClass(chip) {
  return chip.toLowerCase().includes('sale') ? 'pl-chip pl-chip-sale' : 'pl-chip'
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
          :key="chip"
          type="button"
          :class="[chipClass(chip), { active: chipIsActive(chip) }]"
          @click="emit('toggle-category', chip)"
        >
          {{ chip }}
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
