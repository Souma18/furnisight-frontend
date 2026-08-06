<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@shared/stores/localeStore'
import AppIcon from './AppIcon.vue'

defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()
const localeStore = useLocaleStore()
const { locale } = storeToRefs(localeStore)

const selectedLocale = computed({
  get: () => locale.value,
  set: (value) => {
    localeStore.setLocale(value)
  },
})
</script>

<template>
  <label class="language-toggle" :class="{ 'language-toggle--compact': compact }">
    <span class="language-toggle-icon" aria-hidden="true">
      <AppIcon name="globe" :size="15" />
    </span>
    <span class="language-toggle-label">{{ t('language.label') }}</span>
    <select v-model="selectedLocale" :aria-label="t('language.label')">
      <option value="vi">{{ compact ? t('language.shortVi') : t('language.vi') }}</option>
      <option value="en">{{ compact ? t('language.shortEn') : t('language.en') }}</option>
    </select>
  </label>
</template>

<style scoped>
.language-toggle {
  align-items: center;
  background: var(--app-control-bg);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  color: var(--app-text);
  display: inline-flex;
  gap: 8px;
  min-height: 38px;
  padding: 0 10px;
  transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
}

.language-toggle:hover {
  background: var(--app-control-hover);
  border-color: var(--app-border-strong);
}

.language-toggle:focus-within {
  border-color: var(--app-gold);
  box-shadow: 0 0 0 3px var(--app-focus-ring);
}

.language-toggle-icon {
  color: var(--app-gold);
  display: inline-flex;
}

.language-toggle-label {
  color: var(--app-text-muted);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.language-toggle select {
  appearance: none;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 760;
  outline: 0;
  padding: 0;
}

.language-toggle select option {
  background: var(--app-surface);
  color: var(--app-text);
}

.language-toggle--compact {
  background: rgba(255, 250, 241, 0.07);
  border-color: rgba(255, 250, 241, 0.12);
  color: rgba(255, 250, 241, 0.92);
  min-height: 34px;
  padding-inline: 9px;
}

.language-toggle--compact:hover,
.language-toggle--compact:focus-within {
  background: var(--header-cream, var(--app-surface));
  border-color: var(--header-cream, var(--app-border-strong));
  color: var(--header-ink, var(--app-text));
}

.language-toggle--compact .language-toggle-label {
  display: none;
}

.language-toggle--compact select {
  max-width: 42px;
}

@media (max-width: 720px) {
  .language-toggle--compact {
    width: 2.15rem;
    justify-content: center;
    padding: 0;
  }

  .language-toggle--compact select {
    position: absolute;
    inset: 0;
    opacity: 0;
    width: 100%;
  }
}
</style>
