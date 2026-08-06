<script setup>
import { useAdminUiStore } from '../../store/adminUiStore'
import { storeToRefs } from 'pinia'
import AppIcon from '@shared/ui/AppIcon.vue'

const uiStore = useAdminUiStore()
const { toast } = storeToRefs(uiStore)
</script>

<template>
  <div class="toast" :class="{ show: toast.show }">
    <div class="t-icon-wrap">
      <AppIcon :name="toast.icon || 'check'" :size="16" />
    </div>
    <div>
      <div class="t-title">{{ toast.title }}</div>
      <div class="t-sub" v-if="toast.subtitle">{{ toast.subtitle }}</div>
    </div>
  </div>
</template>

<style scoped>
/* Styles are already in admin.css, but we can add specifics if needed. */
</style>
