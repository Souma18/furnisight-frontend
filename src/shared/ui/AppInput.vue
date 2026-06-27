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
  border: 1px solid var(--border-color, #e0d9ce);
  background: var(--input-bg, #fffdf9);
  color: var(--text-primary, #12202e);
  padding: 0 12px;
  font-family: inherit;
  font-size: 13px;
  transition: all 0.2s ease;
}

.app-input:focus {
  outline: none;
  border-color: var(--focus-color, #c9953a);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus-color, #c9953a) 20%, transparent);
}

.app-input:disabled {
  background: var(--bg-disabled, #f0ebd8);
  color: var(--text-disabled, #a09a8f);
  cursor: not-allowed;
}

[data-theme='dark'] .app-input {
  background: var(--input-bg-dark, #1b3044);
  border-color: var(--border-color-dark, #2a4054);
  color: #fff;
}
</style>
