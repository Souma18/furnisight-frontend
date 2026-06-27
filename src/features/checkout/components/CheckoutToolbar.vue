<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

defineEmits(['back'])
</script>

<template>
  <div
    style="
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 1.25rem;
      background: var(--co-navy, #12202e);
      color: rgba(255, 255, 255, 0.55);
      font-size: 0.76rem;
    "
  >
    <span style="display: inline-flex; align-items: center; gap: 0.35rem">
      <AppIcon name="shield" :size="14" />
      Thanh toán bảo mật
    </span>
    <AppButton
      type="button"
      style="
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        border-radius: 8px;
        padding: 0.35rem 0.75rem;
        cursor: pointer;
        font: inherit;
        font-size: 0.76rem;
      "
      @click="$emit('back')"
    >
      <AppIcon name="arrowLeft" :size="14" />
      Giỏ hàng
    </AppButton>
  </div>
</template>
