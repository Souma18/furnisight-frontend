import { computed, onMounted, ref } from 'vue'
import { ordersApi } from '@shared/lib/api/services'
import { i18n } from '@shared/i18n'
import {
  matchesVoucherTime,
  matchesVoucherType,
} from '@features/promotions/lib/voucherPresentation'

const t = (key, params) => i18n.global.t(key, params)

export function useAccountVouchers(notify) {
  const loading = ref(false)
  const vouchers = ref([])
  const typeFilter = ref('all')
  const timeFilter = ref('all')

  const typeOptions = computed(() => [
    { value: 'all', label: t('promotions.filters.allTypes') },
    { value: 'shop', label: t('promotions.filters.shopVoucher') },
    { value: 'ship', label: t('promotions.filters.shippingVoucher') },
    { value: 'PUBLIC', label: t('promotions.filters.public') },
    { value: 'PERSONAL', label: t('promotions.filters.personal') },
    { value: 'MARKETING', label: t('promotions.filters.marketing') },
  ])

  const timeOptions = computed(() => [
    { value: 'all', label: t('promotions.filters.allTimes') },
    { value: 'active', label: t('promotions.filters.active') },
    { value: 'expiring', label: t('promotions.filters.expiring') },
    { value: 'upcoming', label: t('promotions.filters.upcoming') },
    { value: 'expired', label: t('promotions.filters.expired') },
  ])

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
      notify(t('account.vouchers.loadError'), 'error')
    } finally {
      loading.value = false
    }
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard?.writeText(code)
      notify(t('account.vouchers.copied', { code }))
    } catch {
      notify(t('account.vouchers.copyError'), 'error')
    }
  }

  return {
    loading,
    typeFilter,
    timeFilter,
    typeOptions,
    timeOptions,
    filteredVouchers,
    fetchVouchers,
    copyCode,
  }
}
