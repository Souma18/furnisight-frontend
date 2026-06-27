<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="app-form-group">
    <label class="app-form-label">
      {{ label }} <span v-if="required" class="required-mark">*</span>
    </label>
    <div class="app-form-control">
      <slot />
    </div>
    <p v-if="error" class="app-form-error">{{ error }}</p>
  </div>
</template>

<style scoped>
.app-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.app-form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #12202e);
}

.required-mark {
  color: var(--danger-color, #c0392b);
}

.app-form-error {
  margin: 0;
  font-size: 12px;
  color: var(--danger-color, #c0392b);
}

[data-theme='dark'] .app-form-label {
  color: #fff;
}
</style>
