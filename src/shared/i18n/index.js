import { createI18n } from 'vue-i18n'
import vi from './locales/vi.json'
import en from './locales/en.json'

export const SUPPORTED_LOCALES = ['vi', 'en']
export const DEFAULT_LOCALE = 'vi'
export const LOCALE_STORAGE_KEY = 'furnisight:locale'

export function normalizeLocale(value) {
  return SUPPORTED_LOCALES.includes(value) ? value : DEFAULT_LOCALE
}

function getInitialLocale() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY))
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    vi,
    en,
  },
})

export function applyDocumentLocale(locale) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = normalizeLocale(locale)
}

export function setupI18n(app) {
  applyDocumentLocale(i18n.global.locale.value)
  app.use(i18n)
}
