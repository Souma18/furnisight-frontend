<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  search: { type: String, default: '' },
  placeholder: { type: String, default: 'Tìm kiếm...' },
})

const emit = defineEmits(['update:search'])
</script>

<template>
  <div class="filter-bar">
    <div class="filter-search">
      <AppIcon name="search" :size="15" />
      <input
        :value="search"
        type="text"
        :placeholder="placeholder"
        @input="emit('update:search', $event.target.value)"
      />
    </div>
    <slot />
  </div>
</template>
