import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

export function useCheckoutVoucherModal({
  shopVouchers,
  shippingVouchers,
  summary,
  applyVoucherByCode,
  applyVoucher,
  removeVoucher,
  showToast,
}) {
  const { t } = useI18n()
  const voucherModalOpen = ref(false)
  const voucherModalType = ref('shop')
  const voucherApplying = ref(false)

  const modalVouchers = computed(() =>
    voucherModalType.value === 'ship' ? shippingVouchers.value : shopVouchers.value,
  )

  function openVoucherModal(type) {
    voucherModalType.value = type
    voucherModalOpen.value = true
  }

  function closeVoucherModal() {
    voucherModalOpen.value = false
  }

  async function handleApplyVoucherCode(code) {
    voucherApplying.value = true
    try {
      const result = await applyVoucherByCode(code, voucherModalType.value, summary.value.voucherSubtotal, summary.value.shipFee)
      if (!result.ok) {
        showToast({ icon: 'badgePercent', title: t('checkout.toast.voucherFailed.title'), subtitle: result.message })
        return
      }

      showToast({ icon: 'check', title: t('checkout.toast.voucherApplied.title'), subtitle: code })
      closeVoucherModal()
    } catch (error) {
      showToast({
        icon: 'badgePercent',
        title: t('checkout.toast.voucherFailed.title'),
        subtitle: error.response?.data?.message || t('checkout.toast.voucherFailed.sub'),
      })
    } finally {
      voucherApplying.value = false
    }
  }

  async function handleConfirmVoucher(voucher) {
    if (!voucher?.code) return
    voucherApplying.value = true
    try {
      const result = await applyVoucherByCode(voucher.code, voucherModalType.value, summary.value.voucherSubtotal, summary.value.shipFee)
      if (!result.ok) {
        showToast({ icon: 'badgePercent', title: t('checkout.toast.voucherFailed.title'), subtitle: result.message })
        return
      }

      applyVoucher(result.voucher || voucher, voucherModalType.value)
      showToast({ icon: 'check', title: t('checkout.toast.voucherSelected.title'), subtitle: voucher.code })
      closeVoucherModal()
    } catch (error) {
      showToast({
        icon: 'badgePercent',
        title: t('checkout.toast.voucherFailed.title'),
        subtitle: error.response?.data?.message || t('checkout.toast.voucherFailed.sub'),
      })
    } finally {
      voucherApplying.value = false
    }
  }

  function handleRemoveVoucher(type) {
    removeVoucher(type)
  }

  return {
    voucherModalOpen,
    voucherModalType,
    voucherApplying,
    modalVouchers,
    openVoucherModal,
    closeVoucherModal,
    handleApplyVoucherCode,
    handleConfirmVoucher,
    handleRemoveVoucher,
  }
}
