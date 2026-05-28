import { computed, ref } from 'vue'

export function useCheckoutVoucherModal({
  shopVouchers,
  shippingVouchers,
  summary,
  applyVoucherByCode,
  applyVoucher,
  removeVoucher,
  showToast,
}) {
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
      const result = await applyVoucherByCode(code, voucherModalType.value, summary.value.subtotal)
      if (!result.ok) {
        showToast({ icon: 'badgePercent', title: 'Không áp dụng được', subtitle: result.message })
        return
      }

      showToast({ icon: 'check', title: 'Đã áp dụng voucher', subtitle: code })
      closeVoucherModal()
    } finally {
      voucherApplying.value = false
    }
  }

  function handleConfirmVoucher(voucher) {
    applyVoucher(voucher, voucherModalType.value)
    showToast({ icon: 'check', title: 'Đã chọn voucher', subtitle: voucher.code })
    closeVoucherModal()
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
