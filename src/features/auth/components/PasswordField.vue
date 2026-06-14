<script setup>
import { computed, ref, useAttrs } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'

defineOptions({
  inheritAttrs: false,
})

const model = defineModel({
  type: String,
  default: '',
})

const attrs = useAttrs()
const passwordVisible = ref(false)
const disabled = computed(() => attrs.disabled !== undefined && attrs.disabled !== false)

function togglePasswordVisibility() {
  passwordVisible.value = !passwordVisible.value
}
</script>

<template>
  <div class="password-field">
    <input
      v-model="model"
      v-bind="attrs"
      :type="passwordVisible ? 'text' : 'password'"
    />
    <button
      type="button"
      class="password-toggle"
      :aria-label="passwordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
      :aria-pressed="passwordVisible"
      :disabled="disabled"
      @click="togglePasswordVisibility"
    >
      <AppIcon :name="passwordVisible ? 'eyeOff' : 'eye'" :size="16" />
    </button>
  </div>
</template>

<style scoped>
.password-field {
  position: relative;
  width: 100%;
}

input {
  min-height: 2.55rem;
  width: 100%;
  box-sizing: border-box;
  padding: 0 3rem 0 0.72rem;
  border: 1px solid var(--auth-border);
  border-radius: var(--auth-radius-md);
  outline: none;
  background: var(--auth-surface-secondary);
  color: var(--auth-text-primary);
}

input:focus {
  box-shadow: 0 0 0 3px var(--auth-focus-ring);
}

input::-ms-clear,
input::-ms-reveal {
  display: none;
  width: 0;
  height: 0;
}

.password-toggle {
  position: absolute;
  top: 0.2rem;
  right: 0.2rem;
  bottom: 0.2rem;
  width: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--auth-radius-sm);
  background: transparent;
  color: var(--auth-text-secondary);
  cursor: pointer;
}

.password-toggle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--auth-focus-ring);
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
