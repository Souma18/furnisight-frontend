<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const onInput = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <input
    :type="type"
    class="app-input"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    @input="onInput"
    @blur="emit('blur', $event)"
    @focus="emit('focus', $event)"
  />
</template>

<style scoped>
.app-input {
  width: 100%;
  box-sizing: border-box;
  min-height: 38px;
  border-radius: 8px;
  border: 1.5px solid var(--app-border);
  background: var(--app-control-bg);
  color: var(--app-text);
  padding: 0 12px;
  font-family: inherit;
  font-size: 13px;
  transition: all 0.2s ease;
}

.app-input:focus {
  outline: none;
  border-color: var(--app-gold);
  background: var(--app-surface);
  box-shadow: 0 0 0 3px var(--app-focus-ring);
}

.app-input:disabled {
  background: var(--app-surface-soft);
  color: var(--app-text-muted);
  cursor: not-allowed;
}

/* Ẩn spinner của input number để tránh lỗi giao diện trên các trình duyệt / dark mode */
.app-input[type="number"]::-webkit-inner-spin-button,
.app-input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}
.app-input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
