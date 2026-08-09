import { computed, reactive, ref } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import {
  createNotifyFormState,
  normalizePromotionSegment,
  sanitizePromotionChannels,
} from '../config/adminPromotionState'
import {
  filterLocal,
  getListPayload,
  toDatetimeLocal,
} from '../lib/adminPromotionFormatters'
import {
  filterPromotionRecipientIds,
  filterPromotionRecipients,
} from '../utils/adminPromotionRecipients'

export function useAdminNotifications({
  filters,
  modal,
  editing,
  users,
  notify,
}) {
  const notifications = ref([])
  const notifyForm = reactive(createNotifyFormState())
  const notifyUserQuery = ref('')

  const filteredNotifications = computed(() => filterLocal(notifications.value, filters.notify, ['title', 'targetLabel']))
  const filteredNotificationUsers = computed(() =>
    filterPromotionRecipients(users.value, notifyUserQuery.value),
  )

  async function loadNotifications() {
    try {
      const response = await adminApi.fetchMarketingNotifications({ query: filters.notify.query, status: filters.notify.status, size: 50 })
      notifications.value = getListPayload(response?.data)
    } catch (error) {
      notifications.value = []
      notify(error?.response?.data?.message || error.message || 'Không tải được thông báo')
    }
  }

  function resetNotifyForm(row = null) {
    editing.notify = row
    notifyForm.title = row?.title || ''
    notifyForm.body = row?.body || ''
    notifyForm.targetType = row?.targetType || 'ALL'
    notifyForm.targetUserIds = row?.targetUserIds ? [...row.targetUserIds] : []
    notifyForm.segmentKey = normalizePromotionSegment(row?.segmentKey)
    notifyForm.channels = row?.channels
      ? sanitizePromotionChannels(row.channels)
      : ['NOTIFICATION']
    notifyForm.sendType = row?.sendType || 'NOW'
    notifyForm.scheduledAt = toDatetimeLocal(row?.scheduledAt)
    notifyForm.relatedVoucherId = row?.relatedVoucherId || ''
    notifyForm.active = row?.active ?? true
    notifyUserQuery.value = ''
  }

  function openNotifyModal(row = null) {
    resetNotifyForm(row)
    modal.notify = true
  }

  function notifyPayload() {
    return {
      title: notifyForm.title.trim(),
      body: notifyForm.body,
      targetType: notifyForm.targetType,
      targetUserIds: notifyForm.targetType === 'MANUAL'
        ? filterPromotionRecipientIds(notifyForm.targetUserIds, users.value)
        : [],
      segmentKey: notifyForm.targetType === 'SEGMENT'
        ? normalizePromotionSegment(notifyForm.segmentKey)
        : null,
      channels: sanitizePromotionChannels(notifyForm.channels),
      sendType: notifyForm.sendType,
      scheduledAt: notifyForm.sendType === 'SCHEDULED' ? notifyForm.scheduledAt : null,
      relatedVoucherId: notifyForm.relatedVoucherId || null,
      active: notifyForm.active,
    }
  }

  async function saveNotification() {
    const payload = notifyPayload()
    if (!payload.channels.length) {
      notify('Hãy chọn ít nhất một kênh gửi', 'error')
      return
    }
    if (payload.targetType === 'MANUAL' && !payload.targetUserIds.length) {
      notify('Hãy chọn ít nhất một người nhận', 'error')
      return
    }
    try {
      if (editing.notify?.id) await adminApi.updateMarketingNotification(editing.notify.id, payload)
      else await adminApi.createMarketingNotification(payload)
      await loadNotifications()
    } catch (error) {
      notify(error?.response?.data?.message || error.message || 'Không lưu được thông báo')
      return
    }
    notify('Đã lưu thông báo')
    modal.notify = false
  }

  async function deleteNotification(row) {
    if (!row?.id || !window.confirm(`Xóa ${row.title}?`)) return
    try {
      await adminApi.deleteMarketingNotification(row.id)
      await loadNotifications()
    } catch (error) {
      notify(error?.response?.data?.message || error.message || 'Không xóa được.', 'error')
    }
  }

  return {
    notifications,
    notifyForm,
    notifyUserQuery,
    filteredNotifications,
    filteredNotificationUsers,
    loadNotifications,
    openNotifyModal,
    saveNotification,
    deleteNotification,
  }
}
