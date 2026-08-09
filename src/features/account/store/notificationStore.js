import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationsApi } from '@shared/lib/api/services'
import { i18n } from '@shared/i18n'

const t = (key, params) => i18n.global.t(key, params)

const typeMap = {
  ORDER: 'order',
  PROMOTION: 'promo',
  SYSTEM: 'system',
  MEDIA: 'system',
  WALLET: 'promo',
  SOCIAL: 'review',
}

const iconMap = {
  ORDER: 'box',
  PROMOTION: 'gift',
  SYSTEM: 'check',
  MEDIA: 'image',
  WALLET: 'creditCard',
  SOCIAL: 'star',
}

const tagLabelKeyMap = {
  ORDER: 'order',
  PROMOTION: 'promo',
  SYSTEM: 'system',
  MEDIA: 'system',
  WALLET: 'promo',
  SOCIAL: 'review',
}

const tagToneMap = {
  ORDER: 'pending',
  PROMOTION: 'promo',
  SYSTEM: 'success',
  MEDIA: 'info',
  WALLET: 'promo',
  SOCIAL: 'info',
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHrs = Math.floor(diffMin / 60)

  if (diffSec < 60) return t('account.notifications.time.justNow')
  if (diffMin < 60) return t('account.notifications.time.minutesAgo', { count: diffMin })
  if (diffHrs < 24) return t('account.notifications.time.hoursAgo', { count: diffHrs })

  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function getDateLabel(dateStr) {
  if (!dateStr) return t('account.notifications.groups.other')
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return t('account.notifications.groups.other')
  const now = new Date()

  const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dNow = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.floor((dNow.getTime() - dDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return t('account.notifications.groups.today')
  if (diffDays === 1) return t('account.notifications.groups.yesterday')
  if (diffDays < 7) return t('account.notifications.groups.thisWeek')
  return t('account.notifications.groups.earlier')
}

function tagLabel(type) {
  const key = tagLabelKeyMap[type] || 'system'
  return t(`account.notifications.categories.${key}`)
}

function getDetail(item) {
  return {
    [t('account.notifications.detail.time')]: formatTimeAgo(item.createdAt),
    [t('account.notifications.detail.type')]: tagLabel(item.type) || t('account.notifications.detail.notification'),
  }
}

export function mapInboxMessageToFrontend(item) {
  return {
    ...item,
    isRead: item.read ?? item.isRead ?? false,
    type: typeMap[item.type] || 'system',
    time: formatTimeAgo(item.createdAt),
    dateLabel: getDateLabel(item.createdAt),
    icon: iconMap[item.type] || 'bell',
    tagLabel: tagLabel(item.type),
    tagTone: tagToneMap[item.type] || 'info',
    detail: getDetail(item),
  }
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const loading = ref(false)
  const isLoaded = ref(false)
  const error = ref('')

  const unreadCount = computed(() => notifications.value.filter((item) => !item.isRead).length)
  const totalCount = computed(() => notifications.value.length)

  async function loadNotifications(force = false) {
    if (isLoaded.value && !force) return
    loading.value = true
    error.value = ''
    try {
      const response = await notificationsApi.getInboxMessages()
      const data = response.data?.items ?? response.data ?? []
      notifications.value = data.map(mapInboxMessageToFrontend)
      isLoaded.value = true
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Unable to load notifications'
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id) {
    await notificationsApi.markAsRead(id)
    notifications.value = notifications.value.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    )
  }

  async function markAllAsRead() {
    await notificationsApi.markAllAsRead()
    notifications.value = notifications.value.map(n => ({ ...n, isRead: true }))
  }

  function clearNotifications() {
    notifications.value = []
    isLoaded.value = false
  }

  return {
    notifications,
    loading,
    isLoaded,
    error,
    unreadCount,
    totalCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    clearNotifications
  }
})
