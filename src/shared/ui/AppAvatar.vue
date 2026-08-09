<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg, xl
  },
  shape: {
    type: String,
    default: 'circle', // circle, rounded
  }
})

const hasError = ref(false)

const initials = computed(() => {
  if (!props.name) return '?'
  const parts = props.name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
})

const sizeClass = computed(() => \`app-avatar--\${props.size}\`)
const shapeClass = computed(() => \`app-avatar--\${props.shape}\`)

function onError() {
  hasError.value = true
}
</script>

<template>
  <div class="app-avatar" :class="[sizeClass, shapeClass]" v-bind="$attrs">
    <img
      v-if="src && !hasError"
      :src="src"
      :alt="name || 'Avatar'"
      @error="onError"
      class="app-avatar-img"
    />
    <div v-else class="app-avatar-fallback">
      {{ initials }}
    </div>
  </div>
</template>

<style scoped>
.app-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-muted, #e0d9ce);
  color: var(--text-primary, #333);
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
  user-select: none;
}

.app-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.app-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-avatar, #12202e); /* Default to dark navy from brand */
  color: #fff;
  font-family: inherit;
}

/* SHAPES */
.app-avatar--circle { border-radius: 50%; }
.app-avatar--rounded { border-radius: 20%; } /* slightly rounded square */

/* SIZES */
.app-avatar--sm { width: 32px; height: 32px; font-size: 13px; }
.app-avatar--md { width: 44px; height: 44px; font-size: 16px; }
.app-avatar--lg { width: 56px; height: 56px; font-size: 20px; }
.app-avatar--xl { width: 80px; height: 80px; font-size: 28px; }
</style>
