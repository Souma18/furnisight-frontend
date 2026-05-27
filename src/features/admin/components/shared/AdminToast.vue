<script setup>
import { storeToRefs } from 'pinia'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAdminUiStore } from '../../store/adminUiStore'

const ui = useAdminUiStore()
const { toast } = storeToRefs(ui)

const iconMap = {
  check: 'check',
  x: 'close',
  download: 'download',
  trash: 'trash2',
  lock: 'lock',
  bell: 'bell',
  users: 'users',
  box: 'box',
  chartBar: 'chartBar',
}
</script>

<template>
  <div class="toast" :class="{ show: toast.show }">
    <div class="t-icon-wrap">
      <AppIcon :name="iconMap[toast.icon] || 'check'" :size="16" />
    </div>
    <div>
      <div class="t-title">{{ toast.title }}</div>
      <div class="t-sub">{{ toast.subtitle }}</div>
    </div>
  </div>
</template>
