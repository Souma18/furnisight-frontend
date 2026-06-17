import { computed, reactive, ref } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import { createCampaignFormState } from '../config/adminPromotionState'
import {
  filterLocal,
  getListPayload,
  toDatetimeLocal,
} from '../lib/adminPromotionFormatters'

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

  const filteredCampaigns = computed(() => filterLocal(campaigns.value, filters.campaign, ['name', 'voucherCode', 'targetLabel']))

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
    campaignForm.segmentKey = row?.segmentKey || 'NEW_USERS'
    campaignForm.channels = row?.channels ? [...row.channels] : ['NOTIFICATION', 'EMAIL']
    campaignForm.scheduleType = row?.scheduleType || 'NOW'
    campaignForm.scheduledAt = toDatetimeLocal(row?.scheduledAt)
    campaignForm.notificationTitle = row?.notificationTitle || ''
    campaignForm.notificationBody = row?.notificationBody || ''
    campaignForm.active = row?.active ?? true
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
      targetUserIds: campaignForm.targetType === 'MANUAL' ? campaignForm.targetUserIds : [],
      segmentKey: campaignForm.targetType === 'SEGMENT' ? campaignForm.segmentKey : null,
      channels: campaignForm.channels,
      scheduleType: campaignForm.scheduleType,
      scheduledAt: campaignForm.scheduleType === 'SCHEDULED' ? campaignForm.scheduledAt : null,
      notificationTitle: campaignForm.notificationTitle,
      notificationBody: campaignForm.notificationBody,
      active: campaignForm.active,
    }
  }

  async function saveCampaign() {
    const payload = campaignPayload()
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
    filteredCampaigns,
    loadCampaigns,
    openCampaignModal,
    saveCampaign,
    deleteCampaign,
  }
}
