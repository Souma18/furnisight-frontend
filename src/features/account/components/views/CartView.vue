<script setup>
import { computed } from 'vue'
import AccountSectionCard from '../AccountSectionCard.vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const total = computed(() =>
  props.items.reduce((sum, item) => sum + item.price * item.qty, 0),
)
</script>

<template>
  <AccountSectionCard title="Giỏ hàng">
    <div class="list">
      <article v-for="item in items" :key="item.id" class="item">
        <p class="name">{{ item.name }}</p>
        <p class="meta">SL {{ item.qty }} · {{ (item.price * item.qty).toLocaleString('vi-VN') }}đ</p>
      </article>
    </div>
    <p class="total">Tổng cộng: {{ total.toLocaleString('vi-VN') }}đ</p>
  </AccountSectionCard>
</template>

<style scoped>
.list { display:grid; gap:0.5rem; }
.item { border:1px solid var(--auth-border); border-radius:10px; padding:0.65rem; }
.name { margin:0; font-weight:600; }
.meta { margin:0.2rem 0 0; color:var(--auth-text-secondary); font-size:0.82rem; }
.total { margin:0.8rem 0 0; font-weight:700; color:var(--account-badge); text-align:right; }
</style>
