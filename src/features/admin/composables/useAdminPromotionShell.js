import { computed, onMounted, ref, watch } from 'vue'

export function useAdminPromotionShell({
  tabs,
  stats,
  campaigns,
  combos,
  loadVoucherData,
  loadCampaigns,
  loadCombos,
  loadNotifications,
  loadProductsForPicker,
  loadUsersForTarget,
  openVoucherModal,
  openCampaignModal,
  openComboModal,
  openNotifyModal,
  loadTemplates,
  openTemplateModal,
}) {
  const activeTab = ref('voucher')

  const activeAction = computed(() =>
    tabs.find((tab) => tab.id === activeTab.value)?.action || 'Tạo mới',
  )

  const kpis = computed(() => [
    {
      label: 'Tổng voucher',
      value: stats.value.totalVouchers,
      sub: `${stats.value.activeVouchers} đang bật`,
      icon: 'badgePercent',
    },
    {
      label: 'Đã phát',
      value: stats.value.issuedCount,
      sub: 'lượt cấp phát',
      icon: 'send',
      gold: true,
    },
    {
      label: 'Chiến dịch',
      value: stats.value.campaignCount || campaigns.value.length,
      sub: `${stats.value.runningCampaignCount || campaigns.value.filter((item) => item.status === 'RUNNING').length} đang chạy`,
      icon: 'calendar',
    },
    {
      label: 'Combo đang bật',
      value: stats.value.activeCombos || combos.value.filter((item) => item.status === 'ACTIVE').length,
      sub: `${stats.value.comboUsedCount || combos.value.reduce((sum, item) => sum + Number(item.usedCount || 0), 0)} lượt đã dùng`,
      icon: 'gift',
    },
  ])

  async function loadActiveTab() {
    if (activeTab.value === 'voucher') await loadVoucherData()
    if (activeTab.value === 'campaign') await loadCampaigns()
    if (activeTab.value === 'combo') await Promise.all([loadCombos(), loadProductsForPicker()])
    if (activeTab.value === 'notify') await loadNotifications()
    if (activeTab.value === 'template') await loadTemplates()
  }

  function openPrimaryAction() {
    if (activeTab.value === 'voucher') return openVoucherModal()
    if (activeTab.value === 'campaign') return openCampaignModal()
    if (activeTab.value === 'combo') return openComboModal()
    if (activeTab.value === 'notify') return openNotifyModal()
    return openTemplateModal()
  }

  watch(activeTab, loadActiveTab)

  onMounted(async () => {
    await Promise.all([
      loadVoucherData(),
      loadCampaigns(),
      loadCombos(),
      loadNotifications(),
      loadTemplates(),
      loadProductsForPicker(),
      loadUsersForTarget(),
    ])
  })

  return {
    activeTab,
    activeAction,
    kpis,
    openPrimaryAction,
  }
}
