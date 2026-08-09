<script setup>
import { onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  width: { type: String, default: '500px' },
  closeOnBackdrop: { type: Boolean, default: true },
  noBg: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

function onOverlayClick(event) {
  if (props.closeOnBackdrop && event.target === event.currentTarget) {
    emit('close')
  }
}

function onEscape(event) {
  if (props.open && event.key === 'Escape') {
    emit('close')
  }
}

watch(() => props.open, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onEscape)
  } else {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', onEscape)
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onEscape)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="mc-modal-fade">
      <div v-if="open" class="mc-modal-overlay" @click="onOverlayClick">
        <div 
          class="mc-modal-frame" 
          :class="{ 'has-bg': !noBg }"
          :style="{ maxWidth: width }" 
          role="dialog" 
          aria-modal="true"
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mc-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 27, 46, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.mc-modal-frame {
  width: 100%;
  position: relative;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
}

.mc-modal-frame.has-bg {
  background: var(--app-surface, #fff);
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(18, 32, 46, 0.045);
}

.mc-modal-fade-enter-active,
.mc-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.mc-modal-fade-enter-from,
.mc-modal-fade-leave-to {
  opacity: 0;
}

.mc-modal-fade-enter-active .mc-modal-frame,
.mc-modal-fade-leave-active .mc-modal-frame {
  transition: transform 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.mc-modal-fade-enter-from .mc-modal-frame,
.mc-modal-fade-leave-to .mc-modal-frame {
  transform: translateY(15px) scale(0.96);
}
</style>
