<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const STEPS = computed(() => [
  { id: 'cart', label: t('checkout.steps.cart'), status: 'done', to: '/account?view=cart' },
  { id: 'checkout', label: t('checkout.steps.checkout'), status: 'active' },
  { id: 'done', label: t('checkout.steps.done'), status: 'pending' },
])
</script>

<template>
  <div class="checkout-steps-bar">
    <template v-for="(step, index) in STEPS" :key="step.id">
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
        v-if="index < STEPS.length - 1"
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
