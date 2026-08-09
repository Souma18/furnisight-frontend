<script setup>
import { computed, ref } from "vue";
import AppIcon from "./AppIcon.vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  placeholder: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  inputClass: {
    type: [String, Object, Array],
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "blur", "focus"]);

const isPasswordVisible = ref(false);

const computedType = computed(() => {
  if (props.type === "password") {
    return isPasswordVisible.value ? "text" : "password";
  }
  return props.type;
});

const onInput = (event) => {
  emit("update:modelValue", event.target.value);
};

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};
</script>

<template>
  <div class="app-input-wrapper" :class="{ 'has-icon': type === 'password' }">
    <input
      :type="computedType"
      class="app-input"
      :class="inputClass"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      @input="onInput"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
    <button
      v-if="type === 'password'"
      type="button"
      class="password-toggle"
      @click="togglePasswordVisibility"
      tabindex="-1"
    >
      <AppIcon :name="isPasswordVisible ? 'eyeOff' : 'eye'" :size="16" />
    </button>
  </div>
</template>

<style scoped>
.app-input-wrapper {
  position: relative;
  width: 100%;
}

.app-input-wrapper.has-icon .app-input {
  padding-right: 36px;
}

.password-toggle {
  position: absolute;
  right: 4px;
  top: 0;
  bottom: 0;
  height: 100%;
  background: none;
  border: none;
  padding: 0 8px;
  cursor: pointer;
  color: var(--app-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.password-toggle:hover {
  color: var(--app-text);
}

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
