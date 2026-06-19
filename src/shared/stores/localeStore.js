import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  applyDocumentLocale,
  i18n,
  normalizeLocale,
} from '@shared/i18n'

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref(normalizeLocale(i18n.global.locale.value || DEFAULT_LOCALE))

  const currentLocale = computed(() => locale.value)

  function setLocale(value) {
    const nextLocale = normalizeLocale(value)
    locale.value = nextLocale
    i18n.global.locale.value = nextLocale
    applyDocumentLocale(nextLocale)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
    }
  }

  function initLocale() {
    setLocale(locale.value)
  }

  watch(locale, (value) => {
    const nextLocale = normalizeLocale(value)
    i18n.global.locale.value = nextLocale
    applyDocumentLocale(nextLocale)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
    }
  }, { immediate: true })

  return {
    locale,
    currentLocale,
    supportedLocales: SUPPORTED_LOCALES,
    setLocale,
    initLocale,
  }
})
