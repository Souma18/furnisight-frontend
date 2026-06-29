<script setup>
import { ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  src: {
    type: [String, null, undefined],
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
  fallbackIcon: {
    type: String,
    default: 'image'
  },
  lazy: {
    type: Boolean,
    default: false
  }
})

const hasError = ref(false)
const isLoaded = ref(false)

const imgRef = ref(null)

watch(() => props.src, (newSrc) => {
  hasError.value = !newSrc
  isLoaded.value = false
  
  // Check if image is already loaded from cache after a brief tick
  setTimeout(() => {
    if (imgRef.value && imgRef.value.complete && imgRef.value.naturalWidth > 0) {
      isLoaded.value = true
    }
  }, 50)
}, { immediate: true })

function onError() {
  hasError.value = true
}

function onLoad() {
  isLoaded.value = true
}
</script>

<template>
  <div 
    class="app-image-wrapper" 
    :class="[{ 'is-loaded': isLoaded, 'has-error': hasError }, $attrs.class]"
    :style="$attrs.style"
  >
    <img
      ref="imgRef"
      v-if="src && !hasError"
      :src="src"
      :alt="alt"
      :loading="lazy ? 'lazy' : 'eager'"
      @error="onError"
      @load="onLoad"
      class="app-image-content"
    />
    <div v-if="hasError || !isLoaded" class="app-image-fallback" :class="{ 'skeleton-loading': !hasError && !isLoaded }">
      <AppIcon v-if="hasError" :name="fallbackIcon" :size="24" class="fallback-icon" />
    </div>
  </div>
</template>

<style scoped>
.app-image-wrapper {
  position: relative;
  display: block; /* changed from inline-flex */
  width: 100%;
  height: 100%;
  background: var(--bg2, #f5f0e8);
  /* Remove overflow: hidden so border-radius works better if inherited */
}

.app-image-content {
  width: 100%;
  height: 100%;
  object-fit: inherit;
  border-radius: inherit; /* inherit from wrapper */
  opacity: 0;
  transition: opacity 0.3s ease;
  display: block;
}

.app-image-wrapper.is-loaded .app-image-content {
  opacity: 1;
}

.app-image-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #a09a8f);
  background: var(--bg2, #f5f0e8);
  border-radius: inherit; /* inherit from wrapper */
  z-index: 0;
}

.fallback-icon {
  opacity: 0.5;
}

.skeleton-loading {
  background: linear-gradient(90deg, var(--bg2, #f5f0e8) 25%, var(--border, #e0d9ce) 50%, var(--bg2, #f5f0e8) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

:global([data-theme='dark']) .app-image-wrapper {
  background: var(--bg2-dark, #1b3044);
}
:global([data-theme='dark']) .app-image-fallback {
  background: var(--bg2-dark, #1b3044);
}
:global([data-theme='dark']) .skeleton-loading {
  background: linear-gradient(90deg, var(--bg2-dark, #1b3044) 25%, var(--border-dark, #2a4054) 50%, var(--bg2-dark, #1b3044) 75%);
  background-size: 200% 100%;
}
</style>
