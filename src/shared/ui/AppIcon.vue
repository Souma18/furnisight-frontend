<script setup>
import { computed } from 'vue'
import {
  Bell,
  Box,
  Camera,
  Check,
  Facebook,
  Heart,
  Instagram,
  Lock,
  LogOut,
  Map,
  MapPin,
  Settings,
  Shield,
  ShoppingCart,
  Youtube,
  User,
  X,
  Eye, 
  EyeOff,
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
  mapPin: MapPin,
  lock: Lock,
  shield: Shield,
  box: Box,
  camera: Camera,
  heart: Heart,
  eye: Eye,
  eyeOff: EyeOff,
  settings: Settings,
  cube: Box,
  logout: LogOut,
  close: X,
  check: Check,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
}

const iconComponent = computed(() => iconMap[props.name] ?? User)
</script>

<template>
  <component :is="iconComponent" :size="size" :stroke-width="strokeWidth" aria-hidden="true" />
</template>
