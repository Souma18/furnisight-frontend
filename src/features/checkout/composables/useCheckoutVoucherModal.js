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
      const result = await applyVoucherByCode(code, voucherModalType.value, summary.value.voucherSubtotal, summary.value.shipFee)
      if (!result.ok) {
        showToast({ icon: 'badgePercent', title: 'Không áp dụng được', subtitle: result.message })
        return
      }

      showToast({ icon: 'check', title: 'Đã áp dụng voucher', subtitle: code })
      closeVoucherModal()
    } catch (error) {
      showToast({
        icon: 'badgePercent',
        title: 'Không áp dụng được',
        subtitle: error.response?.data?.message || 'Hệ thống chưa thể kiểm tra voucher.',
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
        showToast({ icon: 'badgePercent', title: 'Không áp dụng được', subtitle: result.message })
        return
      }

      applyVoucher(result.voucher || voucher, voucherModalType.value)
      showToast({ icon: 'check', title: 'Đã chọn voucher', subtitle: voucher.code })
      closeVoucherModal()
    } catch (error) {
      showToast({
        icon: 'badgePercent',
        title: 'Không áp dụng được',
        subtitle: error.response?.data?.message || 'Hệ thống chưa thể kiểm tra voucher.',
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
