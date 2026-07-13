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
  top: 80px;
  left: 50%;
  transform: translate(-50%, -16px);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  /* Base: navy surface — phù hợp với brand */
  background: #12202e;
  color: #fffdf9;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 11px 18px;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  opacity: 0;
  pointer-events: none;
  min-width: 220px;
  max-width: 420px;
  box-shadow:
    0 8px 32px rgba(18, 32, 46, 0.28),
    0 2px 8px rgba(18, 32, 46, 0.14);
  transition:
    opacity 0.25s ease,
    transform 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.2);
}

.app-toast.show {
  opacity: 1;
  transform: translate(-50%, 0);
}

/* Success — gold accent (thương hiệu) */
.app-toast.success {
  background: #0f1e2b;
  border-color: rgba(201, 146, 42, 0.42);
  box-shadow:
    0 8px 32px rgba(18, 32, 46, 0.28),
    0 0 0 1px rgba(201, 146, 42, 0.18);
}

.app-toast.success :deep(svg),
.app-toast.success svg {
  color: #c9922a;
}

/* Error — danger palette */
.app-toast.error {
  background: #1f0d10;
  border-color: rgba(190, 18, 60, 0.42);
  box-shadow:
    0 8px 32px rgba(18, 32, 46, 0.28),
    0 0 0 1px rgba(190, 18, 60, 0.18);
}

.app-toast.error :deep(svg),
.app-toast.error svg {
  color: #fb7185;
}

/* Warning — gold nhạt */
.app-toast.warning {
  background: #1a1408;
  border-color: rgba(229, 184, 74, 0.42);
  box-shadow:
    0 8px 32px rgba(18, 32, 46, 0.28),
    0 0 0 1px rgba(229, 184, 74, 0.18);
}

.app-toast.warning :deep(svg),
.app-toast.warning svg {
  color: #e5b84a;
}

/* Info — navy soft */
.app-toast.info {
  background: #12202e;
  border-color: rgba(255, 255, 255, 0.14);
}

.app-toast.info :deep(svg),
.app-toast.info svg {
  color: #c9922a;
}
</style>
