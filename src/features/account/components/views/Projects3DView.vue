<script setup>
import { computed } from 'vue'
import AccountSectionCard from '../AccountSectionCard.vue'
import { useAccountStore } from '../../store/accountStore'

const accountStore = useAccountStore()
const projects = computed(() => accountStore.projects)
</script>

<template>
  <AccountSectionCard title="Dự án trực quan 3D">
    <div class="grid">
      <article v-for="project in projects" :key="project.id" class="item">
        <p class="name">{{ project.name }}</p>
        <p class="meta">Cập nhật: {{ project.updatedAt }} · {{ project.items }} sản phẩm</p>
      </article>
      <article class="item item--new">
        <p>Tạo dự án mới</p>
      </article>
    </div>
  </AccountSectionCard>
</template>

<style scoped>
.grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:0.6rem; }
.item { border:1px solid var(--auth-border); border-radius:12px; padding:0.7rem; min-height:98px; }
.item--new { border-style:dashed; display:grid; place-items:center; color:var(--account-badge); font-weight:600; }
.name { margin:0; font-weight:600; }
.meta { margin:0.3rem 0 0; color:var(--auth-text-secondary); font-size:0.82rem; }
@media (max-width: 1100px) { .grid { grid-template-columns:1fr 1fr; } }
@media (max-width: 780px) { .grid { grid-template-columns:1fr; } }
</style>
