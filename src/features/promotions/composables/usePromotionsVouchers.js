import { computed, ref, watch } from 'vue'
import { promotionsApi } from '@shared/lib/api/services'
import { normalizeList, normalizeVoucher } from '../lib/promotionNormalizers'
import { matchesVoucherTime, matchesVoucherType } from '../lib/voucherPresentation'

const PAGE_SIZE = 6

export function usePromotionsVouchers({
  activeFilter,
  isAuthenticated,
  mineVoucherTypeFilter,
  mineVoucherTimeFilter,
  onAuthRequired,
  showToast,
}) {
  const vouchers = ref([])
  const userVouchers = ref([])
  const voucherPage = ref(0)
  const voucherTotal = ref(0)
  const loadingMoreVouchers = ref(false)
  const claimingCode = ref('')
  const pendingVoucher = ref(null)

  const publicFilter = computed(() => ['freeship', 'expiring'].includes(activeFilter.value) ? activeFilter.value : 'all')
  const userByCode = computed(() => new Map(userVouchers.value.map((item) => [item.code, item])))
  const filteredVouchers = computed(() => activeFilter.value === 'saved'
    ? userVouchers.value
    : vouchers.value)
  const savedVouchers = computed(() => userVouchers.value)
  const filteredSavedVouchers = computed(() => savedVouchers.value
    .filter((voucher) => matchesVoucherType(voucher, mineVoucherTypeFilter.value))
    .filter((voucher) => matchesVoucherTime(voucher, mineVoucherTimeFilter.value)))
  const activeVoucherCount = computed(() => voucherTotal.value)
  const hasMoreVouchers = computed(() => vouchers.value.length < voucherTotal.value)

  function mergeStatus(rows) {
    return rows.map((item) => {
      const owned = userByCode.value.get(item.code)
      return owned ? { ...item, saved: true, used: false } : item
    })
  }

  async function loadUserVouchers() {
    if (!isAuthenticated.value) {
      userVouchers.value = []
      return
    }
    const response = await promotionsApi.getUserVouchers()
    userVouchers.value = normalizeList(response.data).map(normalizeVoucher)
    vouchers.value = mergeStatus(vouchers.value)
  }

  async function loadVouchers(reset = true) {
    if (reset) {
      voucherPage.value = 0
      vouchers.value = []
    }
    try {
      const response = await promotionsApi.getPublicVouchers({
        page: voucherPage.value,
        size: PAGE_SIZE,
        filter: publicFilter.value,
      })
      const payload = response.data || {}
      const rows = mergeStatus(normalizeList(payload).map(normalizeVoucher))
      voucherTotal.value = Number(payload.totalElements ?? rows.length)
      vouchers.value = reset ? rows : [...vouchers.value, ...rows]
      if (reset) await loadUserVouchers().catch(() => null)
      return true
    } catch (error) {
      if (reset) {
        vouchers.value = []
        voucherTotal.value = 0
      }
      showToast('Chưa tải được voucher', error.response?.data?.message || 'Vui lòng thử lại sau.', 'alert')
      return false
    } finally {
      loadingMoreVouchers.value = false
    }
  }

  async function loadMoreVouchers() {
    if (!hasMoreVouchers.value || loadingMoreVouchers.value) return
    loadingMoreVouchers.value = true
    voucherPage.value += 1
    await loadVouchers(false)
  }

  async function claimVoucher(voucher) {
    if (!voucher?.code) return
    if (!isAuthenticated.value) {
      pendingVoucher.value = voucher
      onAuthRequired()
      return
    }
    claimingCode.value = voucher.code
    try {
      await promotionsApi.saveVoucher(voucher.code)
      const owned = { ...voucher, saved: true, used: false, statusLabel: 'Đã lưu' }
      userVouchers.value = [...userVouchers.value.filter((item) => item.code !== voucher.code), owned]
      vouchers.value = mergeStatus(vouchers.value)
      showToast('Đã lưu voucher', voucher.code, 'check')
    } catch (error) {
      showToast('Không thể lưu voucher', error.response?.data?.message || 'Vui lòng thử lại sau.', 'alert')
    } finally {
      claimingCode.value = ''
    }
  }

  watch(publicFilter, () => loadVouchers(true))
  watch(isAuthenticated, (authenticated) => {
    loadUserVouchers().catch(() => null)
    if (!authenticated || !pendingVoucher.value) return
    const voucher = pendingVoucher.value
    pendingVoucher.value = null
    claimVoucher(voucher)
  })

  return {
    vouchers,
    claimingCode,
    filteredVouchers,
    savedVouchers,
    filteredSavedVouchers,
    activeVoucherCount,
    voucherTotal,
    loadingMoreVouchers,
    hasMoreVouchers,
    loadVouchers,
    loadMoreVouchers,
    claimVoucher,
  }
}
