<script setup>
import { computed } from 'vue'
import AppButton from './AppButton.vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  currentPage: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
  pageSize: { type: Number, default: 24 },
})

const emit = defineEmits(['update:currentPage'])

const totalPages = computed(() => {
  return props.pageSize <= 0 ? 0 : Math.ceil(props.total / props.pageSize)
})

const buttons = computed(() => {
  if (totalPages.value < 1) return []

  const page = props.currentPage
  const total = Math.max(1, totalPages.value)
  const btns = []

  // Prev
  btns.push({ 
    icon: 'chevron-left', 
    page: page > 1 ? page - 1 : null, 
    disabled: page <= 1 
  })

  // Pages
  for (let i = 1; i <= total; i++) {
    if (
      i === 1 || 
      i === total || 
      (i >= page - 1 && i <= page + 1)
    ) {
      btns.push({ label: String(i), page: i, active: i === page })
    } else if (
      (i === 2 && page > 3) || 
      (i === total - 1 && page < total - 2)
    ) {
      if (!btns.length || btns[btns.length - 1].label !== '...') {
        btns.push({ label: '...', page: null, disabled: true })
      }
    }
  }

  // Next
  btns.push({ 
    icon: 'chevron-right', 
    page: page < total ? page + 1 : null, 
    disabled: page >= total 
  })

  return btns
})

function goToPage(page) {
  if (page != null && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}
</script>

<template>
  <nav v-if="buttons.length > 0" class="app-pagination" aria-label="Pagination">
    <AppButton 
      v-for="(btn, idx) in buttons" 
      :key="`${btn.label}-${btn.page}-${idx}`"
      variant="unstyled"
      class="pg-btn"
      :class="{ active: btn.active }"
      :disabled="btn.disabled"
      @click="goToPage(btn.page)"
      :aria-label="btn.icon ? (btn.icon === 'chevron-left' ? 'Previous page' : 'Next page') : `Page ${btn.label}`"
      :aria-current="btn.active ? 'page' : undefined"
    >
      <AppIcon v-if="btn.icon" :name="btn.icon" :size="16" />
      <template v-else>{{ btn.label }}</template>
    </AppButton>
  </nav>
</template>

<style scoped>
.app-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
  margin-bottom: 16px;
}

.pg-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  color: var(--app-text);
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.pg-btn:hover:not(:disabled) {
  background: var(--app-surface-soft);
  border-color: var(--app-border-strong);
  transform: translateY(-1px);
}

.pg-btn.active {
  background: var(--app-navy);
  border-color: var(--app-navy);
  color: #ffffff;
  cursor: default;
  transform: translateY(0);
}

.pg-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: translateY(0);
}

@media (max-width: 640px) {
  .pg-btn {
    width: 36px;
    height: 36px;
    font-size: 13px;
  }
  .app-pagination {
    gap: 4px;
  }
}
</style>
