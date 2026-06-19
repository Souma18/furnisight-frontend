<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AccountSectionCard from '../AccountSectionCard.vue'
import { useAccountStore } from '../../store/accountStore'
import ThemeToggle from '@shared/ui/ThemeToggle.vue'
import LanguageToggle from '@shared/ui/LanguageToggle.vue'

const { t } = useI18n()
const accountStore = useAccountStore()
const settings = computed(() => accountStore.settings)
</script>

<template>
  <div class="settings-stack">
    <AccountSectionCard :title="t('settings.appearance')">
      <div class="theme-row">
        <div>
          <p class="theme-title">{{ t('theme.mode') }}</p>
          <p class="theme-copy">{{ t('theme.description') }}</p>
        </div>
        <ThemeToggle />
      </div>
    </AccountSectionCard>

    <AccountSectionCard :title="t('settings.language')">
      <div class="theme-row">
        <div>
          <p class="theme-title">{{ t('language.label') }}</p>
          <p class="theme-copy">{{ t('settings.languageDescription') }}</p>
        </div>
        <LanguageToggle />
      </div>
    </AccountSectionCard>

    <AccountSectionCard :title="t('settings.notifications')">
      <div class="list">
        <div v-for="(enabled, key) in settings" :key="key" class="row">
          <span>{{ key }}</span>
          <span :class="{ on: enabled }">{{ enabled ? t('settings.on') : t('settings.off') }}</span>
        </div>
      </div>
    </AccountSectionCard>
  </div>
</template>

<style scoped>
.settings-stack { display: grid; gap: 1rem; }
.theme-row {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}
.theme-title {
  color: var(--app-heading);
  font-weight: 760;
  margin: 0 0 0.18rem;
}
.theme-copy {
  color: var(--app-text-muted);
  font-size: 0.9rem;
  margin: 0;
}
.list { display:grid; gap:0.45rem; }
.row { border:1px solid var(--auth-border); border-radius:8px; padding:0.55rem 0.65rem; display:flex; justify-content:space-between; gap:0.5rem; }
.row span:last-child { color:var(--account-text-muted); }
.row span.on { color:var(--account-stat-success); font-weight:600; }
@media (max-width: 640px) {
  .theme-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
