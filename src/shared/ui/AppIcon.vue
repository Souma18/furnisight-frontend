<script setup>
import { computed } from 'vue'
import {
  Bell,
  Check,
  Lock,
  Map,
  ShoppingCart,
  User,
  X,
} from 'lucide-vue-next'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    default: 16,
  },
  strokeWidth: {
    type: Number,
    default: 1.8,
  },
})

const iconMap = {
  bell: Bell,
  cart: ShoppingCart,
  user: User,
  map: Map,
  lock: Lock,
  close: X,
  check: Check,
}

const iconComponent = computed(() => iconMap[props.name] ?? User)
</script>

<template>
  <component :is="iconComponent" :size="size" :stroke-width="strokeWidth" aria-hidden="true" />
</template>
