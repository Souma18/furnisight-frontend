<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@shared/stores/themeStore'
import AppIcon from './AppIcon.vue'

defineProps({
  variant: {
    type: String,
    default: 'select',
    validator: (value) => ['select', 'icon'].includes(value),
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const themeStore = useThemeStore()
const { t } = useI18n()
const { themePreference, resolvedTheme } = storeToRefs(themeStore)

const selectedTheme = computed({
  get: () => themePreference.value,
  set: (value) => themeStore.setTheme(value),
})

const currentIcon = computed(() => {
  if (themePreference.value === 'system') return 'monitor'
  return resolvedTheme.value === 'dark' ? 'moon' : 'sun'
})

const toggleIcon = computed(() => resolvedTheme.value === 'dark' ? 'moon' : 'sun')
const toggleLabel = computed(() =>
  resolvedTheme.value === 'dark' ? t('theme.toggleToLight') : t('theme.toggleToDark'),
)

function toggleTheme() {
  themeStore.setTheme(resolvedTheme.value === 'dark' ? 'light' : 'dark')
}
</script>

<template>
  <button
    v-if="variant === 'icon'"
    type="button"
    class="theme-icon-toggle"
    :aria-label="toggleLabel"
    :title="toggleLabel"
    @click="toggleTheme"
  >
    <AppIcon :name="toggleIcon" :size="16" />
  </button>

  <label v-else class="theme-toggle" :class="{ 'theme-toggle--compact': compact }">
    <span class="theme-toggle-icon" aria-hidden="true">
      <AppIcon :name="currentIcon" :size="15" />
    </span>
    <span class="theme-toggle-label">{{ t('theme.label') }}</span>
    <select v-model="selectedTheme" :aria-label="t('theme.label')">
      <option value="system">{{ t('theme.system') }}</option>
      <option value="light">{{ t('theme.light') }}</option>
      <option value="dark">{{ t('theme.dark') }}</option>
    </select>
  </label>
</template>

<style scoped>
.theme-icon-toggle {
  align-items: center;
  background: rgba(255, 250, 241, 0.07);
  border: 1px solid rgba(255, 250, 241, 0.12);
  border-radius: 8px;
  color: rgba(255, 250, 241, 0.92);
  cursor: pointer;
  display: inline-flex;
  height: 2.15rem;
  justify-content: center;
  padding: 0;
  position: relative;
  transition:
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease,
    transform 180ms ease,
    box-shadow 180ms ease;
  width: 2.15rem;
}

.theme-icon-toggle:hover,
.theme-icon-toggle:focus-visible {
  background: var(--header-cream, var(--app-surface));
  border-color: var(--header-cream, var(--app-border-strong));
  color: var(--header-ink, var(--app-text));
  outline: none;
}

.theme-icon-toggle:focus-visible {
  box-shadow: 0 0 0 3px var(--app-focus-ring);
}

.theme-icon-toggle:active {
  transform: translateY(1px);
}

.theme-toggle {
  align-items: center;
  background: var(--app-control-bg);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  color: var(--app-text);
  display: inline-flex;
  gap: 8px;
  min-height: 38px;
  padding: 0 10px;
  transition: background 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease;
}

.theme-toggle:hover {
  background: var(--app-control-hover);
  border-color: var(--app-border-strong);
}

.theme-toggle:focus-within {
  border-color: var(--app-gold);
  box-shadow: 0 0 0 3px var(--app-focus-ring);
}

.theme-toggle-icon {
  color: var(--app-gold);
  display: inline-flex;
}

.theme-toggle-label {
  color: var(--app-text-muted);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.theme-toggle select {
  appearance: none;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 760;
  line-height: 1;
  outline: 0;
  padding: 0;
}

.theme-toggle select option {
  background: var(--app-surface);
  color: var(--app-text);
}

.theme-toggle--compact {
  background: rgba(255, 250, 241, 0.07);
  border-color: rgba(255, 250, 241, 0.12);
  color: rgba(255, 250, 241, 0.92);
  min-height: 34px;
  padding-inline: 9px;
}

.theme-toggle--compact:hover,
.theme-toggle--compact:focus-within {
  background: var(--header-cream, var(--app-surface));
  border-color: var(--header-cream, var(--app-border-strong));
  color: var(--header-ink, var(--app-text));
}

.theme-toggle--compact .theme-toggle-label {
  display: none;
}

.theme-toggle--compact select {
  max-width: 78px;
}

@media (max-width: 720px) {
  .theme-toggle--compact {
    width: 2.15rem;
    justify-content: center;
    padding: 0;
  }

  .theme-toggle--compact select {
    position: absolute;
    inset: 0;
    opacity: 0;
    width: 100%;
  }
}
</style>
