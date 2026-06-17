import { computed, onMounted, ref } from 'vue'
import { ordersApi } from '@shared/lib/api/services'
import {
  matchesVoucherTime,
  matchesVoucherType,
} from '@features/promotions/lib/voucherPresentation'

export const VOUCHER_TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả loại' },
  { value: 'shop', label: 'Voucher đơn hàng' },
  { value: 'ship', label: 'Voucher vận chuyển' },
  { value: 'PUBLIC', label: 'Công khai' },
  { value: 'PERSONAL', label: 'Cá nhân' },
  { value: 'MARKETING', label: 'Marketing' },
]

export const VOUCHER_TIME_OPTIONS = [
  { value: 'all', label: 'Tất cả thời gian' },
  { value: 'active', label: 'Đang dùng được' },
  { value: 'expiring', label: 'Sắp hết hạn' },
  { value: 'upcoming', label: 'Sắp diễn ra' },
  { value: 'expired', label: 'Đã hết hạn' },
]

export function useAccountVouchers(notify) {
  const loading = ref(false)
  const vouchers = ref([])
  const typeFilter = ref('all')
  const timeFilter = ref('all')

  const filteredVouchers = computed(() => vouchers.value
    .filter((voucher) => matchesVoucherType(voucher, typeFilter.value))
    .filter((voucher) => matchesVoucherTime(voucher, timeFilter.value)))

  onMounted(fetchVouchers)

  async function fetchVouchers() {
    loading.value = true
    try {
      const { data } = await ordersApi.getVouchers()
      vouchers.value = Array.isArray(data) ? data : data?.items ?? []
    } catch (error) {
      console.error('Failed to load account vouchers:', error)
      notify('Không tải được danh sách voucher.', 'error')
    } finally {
      loading.value = false
    }
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard?.writeText(code)
      notify(`Đã sao chép mã ${code}.`)
    } catch {
      notify('Không sao chép được mã voucher.', 'error')
    }
  }

  return {
    loading,
    typeFilter,
    timeFilter,
    typeOptions: VOUCHER_TYPE_OPTIONS,
    timeOptions: VOUCHER_TIME_OPTIONS,
    filteredVouchers,
    fetchVouchers,
    copyCode,
  }
}
