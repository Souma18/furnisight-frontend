<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

defineEmits(['back'])
</script>

<template>
  <div class="checkout-toolbar">
    <div class="checkout-toolbar-left">
      <span style="display: inline-flex; align-items: center; gap: 0.35rem">
        <AppIcon name="shield" :size="14" />
        {{ $t('checkout.toolbar.secure') }}
      </span>
    </div>

    <div class="checkout-toolbar-middle">
      <slot></slot>
    </div>

    <div class="checkout-toolbar-right">
      <AppButton
        variant="unstyled"
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
        {{ $t('checkout.toolbar.cart') }}
      </AppButton>
    </div>
  </div>
</template>
