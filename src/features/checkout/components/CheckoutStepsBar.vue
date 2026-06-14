<script setup>
import { CHECKOUT_STEPS } from '../composables/checkoutContent'
import { RouterLink } from 'vue-router'
import AppIcon from '@shared/ui/AppIcon.vue'
</script>

<template>
  <div class="checkout-steps-bar">
    <template v-for="(step, index) in CHECKOUT_STEPS" :key="step.id">
      <component
        :is="step.to ? RouterLink : 'div'"
        class="checkout-step"
        :class="[step.status, { 'checkout-step-link': step.to }]"
        :to="step.to"
      >
        <span class="checkout-step-num">
          <AppIcon v-if="step.status === 'done'" name="check" :size="14" />
          <template v-else>{{ index + 1 }}</template>
        </span>
        {{ step.label }}
      </component>
      <span
        v-if="index < CHECKOUT_STEPS.length - 1"
        class="checkout-step-div"
        :class="{ done: step.status === 'done' }"
      />
    </template>
  </div>
</template>

<style scoped>
.checkout-step-link {
  text-decoration: none;
  color: inherit;
}
</style>
