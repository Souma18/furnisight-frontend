import { computed, reactive, ref } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import {
  createCampaignFormState,
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

export function useAdminCampaigns({
  filters,
  modal,
  editing,
  users,
  vouchers,
  notify,
}) {
  const campaigns = ref([])
  const campaignForm = reactive(createCampaignFormState())
  const campaignUserQuery = ref('')

  const filteredCampaigns = computed(() => filterLocal(campaigns.value, filters.campaign, ['name', 'voucherCode', 'targetLabel']))
  const filteredCampaignUsers = computed(() =>
    filterPromotionRecipients(users.value, campaignUserQuery.value),
  )

  async function loadCampaigns() {
    try {
      const response = await adminApi.fetchMarketingCampaigns({ query: filters.campaign.query, status: filters.campaign.status, size: 50 })
      campaigns.value = getListPayload(response?.data)
    } catch (error) {
      campaigns.value = []
      notify(error?.response?.data?.message || error.message || 'Không tải được chiến dịch')
    }
  }

  function resetCampaignForm(row = null) {
    editing.campaign = row
    campaignForm.name = row?.name || ''
    campaignForm.voucherId = row?.voucherId || vouchers.value[0]?.id || ''
    campaignForm.targetType = row?.targetType || 'MANUAL'
    campaignForm.targetUserIds = row?.targetUserIds ? [...row.targetUserIds] : (users.value[0]?.id ? [users.value[0].id] : [])
    campaignForm.segmentKey = normalizePromotionSegment(row?.segmentKey)
    campaignForm.channels = row?.channels
      ? sanitizePromotionChannels(row.channels)
      : ['NOTIFICATION', 'EMAIL']
    campaignForm.scheduleType = row?.scheduleType || 'NOW'
    campaignForm.scheduledAt = toDatetimeLocal(row?.scheduledAt)
    campaignForm.notificationTitle = row?.notificationTitle || ''
    campaignForm.notificationBody = row?.notificationBody || ''
    campaignForm.active = row?.active ?? true
    campaignUserQuery.value = ''
  }

  function openCampaignModal(row = null) {
    resetCampaignForm(row)
    modal.campaign = true
  }

  function campaignPayload() {
    return {
      name: campaignForm.name.trim(),
      voucherId: campaignForm.voucherId || null,
      targetType: campaignForm.targetType,
      targetUserIds: campaignForm.targetType === 'MANUAL'
        ? filterPromotionRecipientIds(campaignForm.targetUserIds, users.value)
        : [],
      segmentKey: campaignForm.targetType === 'SEGMENT'
        ? normalizePromotionSegment(campaignForm.segmentKey)
        : null,
      channels: sanitizePromotionChannels(campaignForm.channels),
      scheduleType: campaignForm.scheduleType,
      scheduledAt: campaignForm.scheduleType === 'SCHEDULED' ? campaignForm.scheduledAt : null,
      notificationTitle: campaignForm.notificationTitle,
      notificationBody: campaignForm.notificationBody,
      active: campaignForm.active,
    }
  }

  async function saveCampaign() {
    const payload = campaignPayload()
    if (!payload.channels.length) {
      notify('Hãy chọn ít nhất một kênh gửi', 'error')
      return
    }
    if (payload.targetType === 'MANUAL' && !payload.targetUserIds.length) {
      notify('Hãy chọn ít nhất một người nhận', 'error')
      return
    }
    try {
      if (editing.campaign?.id) await adminApi.updateMarketingCampaign(editing.campaign.id, payload)
      else await adminApi.createMarketingCampaign(payload)
      await loadCampaigns()
    } catch (error) {
      notify(error?.response?.data?.message || error.message || 'Không lưu được chiến dịch')
      return
    }
    notify('Đã lưu chiến dịch')
    modal.campaign = false
  }

  async function deleteCampaign(row) {
    if (!row?.id || !window.confirm(`Xóa ${row.name}?`)) return
    try {
      await adminApi.deleteMarketingCampaign(row.id)
      await loadCampaigns()
    } catch (error) {
      notify(error?.response?.data?.message || error.message || 'Không xóa được.', 'error')
    }
  }

  return {
    campaigns,
    campaignForm,
    campaignUserQuery,
    filteredCampaigns,
    filteredCampaignUsers,
    loadCampaigns,
    openCampaignModal,
    saveCampaign,
    deleteCampaign,
  }
}
