import { ref } from 'vue'

export function useCancelOrderDialog(cancelOrderFn) {
  const cancelTarget = ref(null)
  const canceling = ref(false)

  function openCancelDialog(order) {
    if (!order) return
    cancelTarget.value = order
  }

  function closeCancelDialog() {
    if (canceling.value) return
    cancelTarget.value = null
  }

  async function confirmCancel() {
    if (!cancelTarget.value || canceling.value) return
    canceling.value = true
    const success = await cancelOrderFn(cancelTarget.value.orderCode)
    canceling.value = false
    if (success) cancelTarget.value = null
  }

  return {
    cancelTarget,
    canceling,
    openCancelDialog,
    closeCancelDialog,
    confirmCancel,
  }
}
