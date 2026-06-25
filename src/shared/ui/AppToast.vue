<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  show: { type: Boolean, default: false },
  message: { type: String, default: '' },
  icon: { type: String, default: 'alertCircle' }
})
</script>

<template>
  <Teleport to="body">
    <div class="app-toast" :class="{ show }">
      <AppIcon :name="icon" :size="18" />
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
  gap: 8px;
  background: #333d4b;
  color: #fff;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.app-toast.show {
  opacity: 1;
  transform: translate(-50%, 0);
}
</style>
