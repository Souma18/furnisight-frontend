import { onBeforeUnmount, onMounted, ref } from 'vue'
import { parseOrderDate } from '@shared/lib/api/services/orders/orders.model'

export function usePaymentCountdown() {
  const now = ref(Date.now())
  let timerId = null

  function remainingSeconds(order = {}) {
    if (!order.paymentExpiresAt) return 0
    const expiresAt = parseOrderDate(order.paymentExpiresAt)
    if (!expiresAt) return 0
    return Math.max(0, Math.ceil((expiresAt.getTime() - now.value) / 1000))
  }

  function formatCountdown(order = {}) {
    const seconds = remainingSeconds(order)
    const minutesPart = Math.floor(seconds / 60)
    const secondsPart = seconds % 60
    return `${String(minutesPart).padStart(2, '0')}:${String(secondsPart).padStart(2, '0')}`
  }

  function isPaymentTimeRemaining(order = {}) {
    return remainingSeconds(order) > 0
  }

  onMounted(() => {
    now.value = Date.now()
    timerId = window.setInterval(() => {
      now.value = Date.now()
    }, 1000)
  })

  onBeforeUnmount(() => {
    if (timerId) window.clearInterval(timerId)
  })

  return {
    formatCountdown,
    isPaymentTimeRemaining,
    remainingSeconds,
  }
}
