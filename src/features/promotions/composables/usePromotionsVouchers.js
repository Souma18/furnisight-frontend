import { computed, ref, watch } from 'vue'
import { promotionsApi } from '@shared/lib/api/services'
import { normalizeList, normalizeVoucher } from '../lib/promotionNormalizers'
import {
  isExpiring,
  isShippingVoucher,
  matchesVoucherTime,
  matchesVoucherType,
} from '../lib/voucherPresentation'

export function usePromotionsVouchers({
  activeFilter,
  isAuthenticated,
  mineVoucherTypeFilter,
  mineVoucherTimeFilter,
  onAuthRequired,
  showToast,
}) {
  const vouchers = ref([])
  const claimingCode = ref('')
  const pendingVoucher = ref(null)

  const filteredVouchers = computed(() => {
    const key = activeFilter.value
    if (key === 'freeship') return vouchers.value.filter((item) => isShippingVoucher(item))
    if (key === 'expiring') return vouchers.value.filter((item) => isExpiring(item.endDate))
    if (key === 'saved') return vouchers.value.filter((item) => item.saved)
    return vouchers.value
  })

  const savedVouchers = computed(() => vouchers.value.filter((item) => item.saved && !item.used))
  const filteredSavedVouchers = computed(() => savedVouchers.value
    .filter((voucher) => matchesVoucherType(voucher, mineVoucherTypeFilter.value))
    .filter((voucher) => matchesVoucherTime(voucher, mineVoucherTimeFilter.value)))
  const activeVoucherCount = computed(() => vouchers.value.filter((item) => item.active !== false).length)

  async function loadVouchers() {
    try {
      const response = await promotionsApi.getPublicVouchers({ placement: 'PROMOTION_PAGE' })
      vouchers.value = normalizeList(response.data).map(normalizeVoucher)
      if (isAuthenticated.value) {
        await mergeUserVoucherStatus()
      }
      return true
    } catch (error) {
      vouchers.value = []
      showToast('Chưa tải được voucher', error.response?.data?.message || 'Vui lòng thử lại sau.', 'alert')
      return false
    }
  }

  async function mergeUserVoucherStatus() {
    try {
      const response = await promotionsApi.getUserVouchers()
      const byCode = new Map(normalizeList(response.data).map((item) => [item.code, normalizeVoucher(item)]))
      vouchers.value = vouchers.value.map((item) => {
        const userVoucher = byCode.get(item.code)
        return userVoucher ? { ...item, saved: userVoucher.saved, used: userVoucher.used } : item
      })
    } catch {
      // Public vouchers should still render when optional user-specific status fails.
    }
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
      vouchers.value = vouchers.value.map((item) =>
        item.code === voucher.code ? { ...item, saved: true, used: false, statusLabel: 'Đã lưu' } : item,
      )
      showToast('Đã lưu voucher', voucher.code, 'check')
    } catch (error) {
      showToast('Không thể lưu voucher', error.response?.data?.message || 'Vui lòng thử lại sau.', 'alert')
    } finally {
      claimingCode.value = ''
    }
  }

  watch(isAuthenticated, (authenticated) => {
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
    loadVouchers,
    claimVoucher,
  }
}
