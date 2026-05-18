import { computed, onMounted, ref, unref } from 'vue'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/accountApi'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'unread', label: 'Chưa đọc' },
  { value: 'read', label: 'Đã đọc' },
]

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

const tagLabelMap = {
  ORDER: 'Đơn hàng',
  PROMOTION: 'Khuyến mãi',
  SYSTEM: 'Hệ thống',
  MEDIA: 'Hệ thống',
  WALLET: 'Khuyến mãi',
  SOCIAL: 'Đánh giá',
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

  if (diffSec < 60) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  if (diffHrs < 24) return `${diffHrs} giờ trước`

  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function getDateLabel(dateStr) {
  if (!dateStr) return 'Khác'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Khác'
  const now = new Date()

  const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dNow = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.floor((dNow.getTime() - dDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hôm nay'
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return 'Tuần này'
  return 'Trước đó'
}

function getDetail(item) {
  return {
    'Thời gian': formatTimeAgo(item.createdAt),
    'Loại thông báo': tagLabelMap[item.type] || 'Thông báo',
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
    tagLabel: tagLabelMap[item.type] || 'Hệ thống',
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
      const response = await getNotifications()
      const data = response.data?.items ?? response.data ?? []
      notifications.value = data.map(mapInboxMessageToFrontend)
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

    if (!notification.isRead) {
      await markAsRead(notification.id, false)
    }
  }

  async function markAsRead(notificationId, notify = true) {
    try {
      await markNotificationRead(notificationId)
      notifications.value = notifications.value.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item,
      )
      if (notify) emit('notify', 'Đã đánh dấu thông báo là đã đọc.')
    } catch (error) {
      emit('notify', error.response?.data?.message || 'Không thể cập nhật thông báo.', 'error')
    }
  }

  async function markAllRead() {
    if (!unreadCount.value) return

    try {
      await markAllNotificationsRead()
      notifications.value = notifications.value.map((item) => ({ ...item, isRead: true }))
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
