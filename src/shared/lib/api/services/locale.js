const LOCALE_STORAGE_KEY = 'furnisight:locale'
const SUPPORTED_LOCALES = ['vi', 'en']

export function getApiLocale() {
  if (typeof window === 'undefined') return 'vi'

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return SUPPORTED_LOCALES.includes(storedLocale) ? storedLocale : 'vi'
}

export function withApiLocale(params = {}) {
  return {
    ...params,
    lang: getApiLocale(),
  }
}
