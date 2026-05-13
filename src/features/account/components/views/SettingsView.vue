<script setup>
import AccountSectionCard from '../AccountSectionCard.vue'

defineProps({
  settings: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<template>
  <AccountSectionCard title="Cài đặt thông báo">
    <div class="list">
      <div v-for="(enabled, key) in settings" :key="key" class="row">
        <span>{{ key }}</span>
        <span :class="{ on: enabled }">{{ enabled ? 'Bật' : 'Tắt' }}</span>
      </div>
    </div>
  </AccountSectionCard>
</template>

<style scoped>
.list { display:grid; gap:0.45rem; }
.row { border:1px solid var(--auth-border); border-radius:10px; padding:0.55rem 0.65rem; display:flex; justify-content:space-between; gap:0.5rem; }
.row span:last-child { color:var(--account-text-muted); }
.row span.on { color:var(--account-stat-success); font-weight:600; }
</style>
