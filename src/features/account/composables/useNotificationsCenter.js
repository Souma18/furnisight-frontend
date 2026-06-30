import { computed, onMounted, ref, unref, watch } from 'vue'
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

export function useNotificationsCenter(emit, selectedCategory = 'all') {
  const loading = ref(false)
  const errorMessage = ref('')
  const notifications = ref([])
  const expandedIds = ref([])
  const readStatus = ref('all')

  const totalCount = computed(() => notifications.value.length)
  const unreadCount = computed(() => notifications.value.filter((item) => !item.isRead).length)
  const activeCategory = computed(() => unref(selectedCategory) || 'all')
  const statusOptions = computed(() => [
    { value: 'all', label: t('account.notifications.status.all') },
    { value: 'unread', label: t('account.notifications.status.unread') },
    { value: 'read', label: t('account.notifications.status.read') },
  ])

  const filteredNotifications = computed(() =>
    notifications.value.filter((item) => {
      const matchesCategory = activeCategory.value === 'all' || item.type === activeCategory.value
      const matchesStatus =
        readStatus.value === 'all' ||
        (readStatus.value === 'unread' && !item.isRead) ||
        (readStatus.value === 'read' && item.isRead)

      return matchesCategory && matchesStatus
    }),
  )

  const groupedNotifications = computed(() => {
    const groups = new Map()

    filteredNotifications.value.forEach((item) => {
      if (!groups.has(item.dateLabel)) groups.set(item.dateLabel, [])
      groups.get(item.dateLabel).push(item)
    })

    return Array.from(groups.entries()).map(([dateLabel, items]) => ({ dateLabel, items }))
  })

  async function loadNotifications() {
    errorMessage.value = ''
    loading.value = true

    try {
      const response = await notificationsApi.getInboxMessages()
      const data = response.data?.items ?? response.data ?? []
      notifications.value = data.map(mapInboxMessageToFrontend)
    } catch (error) {
      errorMessage.value = error.response?.data?.message || error.message || t('account.notifications.loadError')
    } finally {
      loading.value = false
    }
  }

  function isExpanded(notificationId) {
    return expandedIds.value.includes(notificationId)
  }

  async function toggleExpanded(notification) {
    if (isExpanded(notification.id)) {
      expandedIds.value = expandedIds.value.filter((id) => id !== notification.id)
      return
    }

    expandedIds.value = [...expandedIds.value, notification.id]

    if (!notification.isRead) {
      await markAsRead(notification.id, false)
    }
  }

  async function markAsRead(notificationId, notify = true) {
    try {
      await notificationsApi.markAsRead(notificationId)
      notifications.value = notifications.value.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item,
      )
      if (notify) emit('notify', t('account.notifications.markedRead'))
    } catch (error) {
      emit('notify', error.response?.data?.message || t('account.notifications.updateError'), 'error')
    }
  }

  async function markAllRead() {
    if (!unreadCount.value) return

    try {
      await notificationsApi.markAllAsRead()
      notifications.value = notifications.value.map((item) => ({ ...item, isRead: true }))
      emit('notify', t('account.notifications.markedAllRead'))
    } catch (error) {
      emit('notify', error.response?.data?.message || t('account.notifications.updateError'), 'error')
    }
  }

  function handleAction(action) {
    emit('notify', t('account.notifications.actionSelected', { label: action.label }))
  }

  onMounted(loadNotifications)
  watch(() => i18n.global.locale.value, loadNotifications)

  return {
    loading,
    errorMessage,
    notifications,
    groupedNotifications,
    activeCategory,
    readStatus,
    totalCount,
    unreadCount,
    statusOptions,
    isExpanded,
    toggleExpanded,
    markAllRead,
    handleAction,
    reload: loadNotifications,
  }
}
