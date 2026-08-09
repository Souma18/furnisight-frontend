import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

const THEME_STORAGE_KEY = 'furnisight:theme'
const THEME_OPTIONS = ['system', 'light', 'dark']

function isValidTheme(value) {
  return THEME_OPTIONS.includes(value)
}

function getStoredPreference() {
  if (typeof window === 'undefined') return 'system'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isValidTheme(stored) ? stored : 'system'
}

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.dataset.theme = theme
  root.classList.toggle('theme-dark', theme === 'dark')
  root.classList.toggle('theme-light', theme === 'light')
  root.style.colorScheme = theme
}

export const useThemeStore = defineStore('theme', () => {
  const themePreference = ref(getStoredPreference())
  const systemTheme = ref(getSystemTheme())
  const initialized = ref(false)

  const resolvedTheme = computed(() =>
    themePreference.value === 'system' ? systemTheme.value : themePreference.value,
  )

  function setTheme(value) {
    themePreference.value = isValidTheme(value) ? value : 'system'
  }

  function initTheme() {
    if (initialized.value) return
    initialized.value = true

    const mediaQuery = typeof window !== 'undefined'
      ? window.matchMedia?.('(prefers-color-scheme: dark)')
      : null

    const handleSystemChange = () => {
      systemTheme.value = mediaQuery?.matches ? 'dark' : 'light'
    }

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange)
    } else {
      mediaQuery?.addListener?.(handleSystemChange)
    }

    watch(themePreference, (value) => {
      if (typeof window === 'undefined') return
      window.localStorage.setItem(THEME_STORAGE_KEY, isValidTheme(value) ? value : 'system')
    }, { immediate: true })

    watch(resolvedTheme, applyTheme, { immediate: true })
  }

  return {
    themePreference,
    resolvedTheme,
    setTheme,
    initTheme,
  }
})
