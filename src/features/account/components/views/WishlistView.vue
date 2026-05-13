<script setup>
import AccountSectionCard from '../AccountSectionCard.vue'

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <AccountSectionCard title="Sản phẩm yêu thích">
    <div class="grid">
      <article v-for="item in items" :key="item.id" class="card">
        <p class="name">{{ item.name }}</p>
        <p class="price">{{ item.price.toLocaleString('vi-VN') }}đ</p>
      </article>
    </div>
  </AccountSectionCard>
</template>

<style scoped>
.grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:0.6rem; }
.card { border:1px solid var(--auth-border); border-radius:12px; padding:0.65rem; }
.name { margin:0; font-size:0.9rem; }
.price { margin:0.3rem 0 0; color:var(--account-badge); font-weight:600; }
@media (max-width: 1100px) { .grid { grid-template-columns:1fr 1fr; } }
@media (max-width: 780px) { .grid { grid-template-columns:1fr; } }
</style>
