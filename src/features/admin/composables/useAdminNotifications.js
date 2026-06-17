import { computed, reactive, ref } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import { createNotifyFormState } from '../config/adminPromotionState'
import {
  filterLocal,
  getListPayload,
  toDatetimeLocal,
} from '../lib/adminPromotionFormatters'

export function useAdminNotifications({
  filters,
  modal,
  editing,
  notify,
}) {
  const notifications = ref([])
  const notifyForm = reactive(createNotifyFormState())

  const filteredNotifications = computed(() => filterLocal(notifications.value, filters.notify, ['title', 'targetLabel']))

  async function loadNotifications() {
    try {
      const response = await adminApi.fetchMarketingNotifications({ query: filters.notify.query, status: filters.notify.status, size: 50 })
      notifications.value = getListPayload(response?.data)
    } catch (error) {
      notifications.value = []
      notify(error?.response?.data?.message || error.message || 'Khong tai duoc thong bao')
    }
  }

  function resetNotifyForm(row = null) {
    editing.notify = row
    notifyForm.title = row?.title || ''
    notifyForm.body = row?.body || ''
    notifyForm.targetType = row?.targetType || 'ALL'
    notifyForm.targetUserIds = row?.targetUserIds ? [...row.targetUserIds] : []
    notifyForm.segmentKey = row?.segmentKey || 'VIP'
    notifyForm.channels = row?.channels ? [...row.channels] : ['NOTIFICATION']
    notifyForm.sendType = row?.sendType || 'NOW'
    notifyForm.scheduledAt = toDatetimeLocal(row?.scheduledAt)
    notifyForm.relatedVoucherId = row?.relatedVoucherId || ''
    notifyForm.active = row?.active ?? true
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
      targetUserIds: notifyForm.targetType === 'MANUAL' ? notifyForm.targetUserIds : [],
      segmentKey: notifyForm.targetType === 'SEGMENT' ? notifyForm.segmentKey : null,
      channels: notifyForm.channels,
      sendType: notifyForm.sendType,
      scheduledAt: notifyForm.sendType === 'SCHEDULED' ? notifyForm.scheduledAt : null,
      relatedVoucherId: notifyForm.relatedVoucherId || null,
      active: notifyForm.active,
    }
  }

  async function saveNotification() {
    const payload = notifyPayload()
    try {
      if (editing.notify?.id) await adminApi.updateMarketingNotification(editing.notify.id, payload)
      else await adminApi.createMarketingNotification(payload)
      await loadNotifications()
    } catch (error) {
      notify(error?.response?.data?.message || error.message || 'Khong luu duoc thong bao')
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
    filteredNotifications,
    loadNotifications,
    openNotifyModal,
    saveNotification,
    deleteNotification,
  }
}
