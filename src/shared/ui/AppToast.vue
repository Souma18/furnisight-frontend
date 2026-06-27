<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { useToast } from '../composables/useToast'

const { visible, message, type } = useToast()

const iconName = computed(() => {
  switch (type.value) {
    case 'success': return 'checkCircle'
    case 'error': return 'xCircle'
    case 'warning': return 'alertTriangle'
    default: return 'info'
  }
})
</script>

<template>
  <Teleport to="body">
    <div class="app-toast" :class="[type, { show: visible }]">
      <AppIcon :name="iconName" :size="20" />
      <span>{{ message }}</span>
    </div>
  </Teleport>
</template>

<style scoped>
.app-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translate(-50%, -20px);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #333d4b;
  color: #fff;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.app-toast.show {
  opacity: 1;
  transform: translate(-50%, 0);
}

/* Types */
.app-toast.success {
  background: #10b981;
}
.app-toast.error {
  background: #ef4444;
}
.app-toast.warning {
  background: #f59e0b;
}
.app-toast.info {
  background: #3b82f6;
}
</style>
