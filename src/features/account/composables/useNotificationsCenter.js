import { computed, onMounted, ref, unref } from 'vue'
import {
  fetchNotificationsMock,
  markAllNotificationsReadMock,
  markNotificationReadMock,
} from '../api/accountNotificationsMockApi'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'unread', label: 'Chưa đọc' },
  { value: 'read', label: 'Đã đọc' },
]

export function useNotificationsCenter(emit, selectedCategory = 'all') {
  const loading = ref(false)
  const errorMessage = ref('')
  const notifications = ref([])
  const expandedIds = ref([])
  const readStatus = ref('all')

  const totalCount = computed(() => notifications.value.length)
  const unreadCount = computed(() => notifications.value.filter((item) => item.unread).length)
  const activeCategory = computed(() => unref(selectedCategory) || 'all')

  const filteredNotifications = computed(() =>
    notifications.value.filter((item) => {
      const matchesCategory = activeCategory.value === 'all' || item.type === activeCategory.value
      const matchesStatus =
        readStatus.value === 'all' ||
        (readStatus.value === 'unread' && item.unread) ||
        (readStatus.value === 'read' && !item.unread)

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
      const response = await fetchNotificationsMock()
      const data = response.data?.items ?? response.data ?? []
      notifications.value = data
    } catch (error) {
      errorMessage.value = error.response?.data?.message || error.message || 'Không thể tải thông báo.'
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

    if (notification.unread) {
      await markAsRead(notification.id, false)
    }
  }

  async function markAsRead(notificationId, notify = true) {
    try {
      await markNotificationReadMock(notificationId)
      notifications.value = notifications.value.map((item) =>
        item.id === notificationId ? { ...item, unread: false } : item,
      )
      if (notify) emit('notify', 'Đã đánh dấu thông báo là đã đọc.')
    } catch (error) {
      emit('notify', error.response?.data?.message || 'Không thể cập nhật thông báo.', 'error')
    }
  }

  async function markAllRead() {
    if (!unreadCount.value) return

    try {
      await markAllNotificationsReadMock()
      notifications.value = notifications.value.map((item) => ({ ...item, unread: false }))
      emit('notify', 'Đã đánh dấu tất cả thông báo là đã đọc.')
    } catch (error) {
      emit('notify', error.response?.data?.message || 'Không thể cập nhật thông báo.', 'error')
    }
  }

  function handleAction(action) {
    emit('notify', `Đã chọn: ${action.label}.`)
  }

  onMounted(loadNotifications)

  return {
    loading,
    errorMessage,
    notifications,
    groupedNotifications,
    activeCategory,
    readStatus,
    totalCount,
    unreadCount,
    statusOptions: STATUS_OPTIONS,
    isExpanded,
    toggleExpanded,
    markAllRead,
    handleAction,
    reload: loadNotifications,
  }
}
