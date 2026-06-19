<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AccountSectionCard from '../AccountSectionCard.vue'
import { useAccountStore } from '../../store/accountStore'
import { formatDate } from '@shared/lib/formatters'

const accountStore = useAccountStore()
const { t } = useI18n()
const projects = computed(() => accountStore.projects)
</script>

<template>
  <AccountSectionCard :title="t('account.projects.title')">
    <div class="grid">
      <article v-for="project in projects" :key="project.id" class="item">
        <p class="name">{{ project.name }}</p>
        <p class="meta">{{ t('account.projects.updated', { date: formatDate(project.updatedAt) || t('account.projects.noData'), count: project.items }) }}</p>
      </article>
      <article class="item item--new">
        <p>{{ t('account.projects.create') }}</p>
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
