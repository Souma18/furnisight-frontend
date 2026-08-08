import { computed, onMounted, ref, unref, watch } from 'vue'
import { i18n } from '@shared/i18n'
import { useNotificationStore } from '@features/account/store/notificationStore'
import { storeToRefs } from 'pinia'

const t = (key, params) => i18n.global.t(key, params)

export function useNotificationsCenter(emit, selectedCategory = 'all') {
  const store = useNotificationStore()
  const { loading, error: errorMessage, notifications, totalCount, unreadCount } = storeToRefs(store)

  const expandedIds = ref([])
  const readStatus = ref('all')

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
    await store.loadNotifications()
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
      await store.markAsRead(notificationId)
      if (notify) emit('notify', t('account.notifications.markedRead'))
    } catch (error) {
      emit('notify', error.response?.data?.message || t('account.notifications.updateError'), 'error')
    }
  }

  async function markAllRead() {
    if (!unreadCount.value) return

    try {
      await store.markAllAsRead()
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
