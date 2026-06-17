import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { buildCheckoutSummary } from '../utils/checkoutPricing'
import { readPendingPayment, writePendingPayment } from '../lib/checkoutPendingPaymentStorage'
import { normalizeCheckoutVoucher } from '../lib/checkoutNormalizers'

export const useCheckoutStore = defineStore('checkout', () => {
  const loading = ref(false)
  const placing = ref(false)
  const hydrated = ref(false)
  const combosHydrated = ref(false)

  const shippingOptions = ref([])
  const paymentMethods = ref([])
  const shopVouchers = ref([])
  const shippingVouchers = ref([])
  const activeCombos = ref([])
  const selectedCombo = ref(null)
  const comboMessage = ref('')
  const insuranceOption = ref(null)
  const codNote = ref('')

  const selectedShippingId = ref('')
  const selectedPaymentId = ref('vnpay')
  const sellerNote = ref('')
  const hasInsurance = ref(false)
  const agreedTerms = ref(true)

  const shopVoucher = ref(null)
  const shippingVoucher = ref(null)

  const lastOrder = ref(null)
  const pendingPayment = ref(readPendingPayment())

  const selectedShipping = computed(
    () => shippingOptions.value.find((item) => item.id === selectedShippingId.value) ?? null,
  )

  const shipFee = computed(() => {
    const fee = Number(selectedShipping.value?.fee) || 0
    return selectedShipping.value?.isFree ? 0 : fee
  })

  function buildSummary(lines) {
    return buildCheckoutSummary({
      lines,
      shipFee: shipFee.value,
      shopVoucher: shopVoucher.value,
      shippingVoucher: shippingVoucher.value,
      combo: selectedCombo.value,
      hasInsurance: hasInsurance.value,
      insurancePrice: insuranceOption.value?.price ?? 0,
    })
  }

  function applyVoucher(voucher, type = 'shop') {
    if (!voucher) return
    const normalizedVoucher = normalizeCheckoutVoucher(voucher)
    if (type === 'ship') shippingVoucher.value = normalizedVoucher
    else shopVoucher.value = normalizedVoucher
  }

  function removeVoucher(type = 'shop') {
    if (type === 'ship') shippingVoucher.value = null
    else shopVoucher.value = null
  }

  function resetCheckoutState() {
    loading.value = false
    placing.value = false
    hydrated.value = false
    combosHydrated.value = false
    shippingOptions.value = []
    paymentMethods.value = []
    shopVouchers.value = []
    shippingVouchers.value = []
    activeCombos.value = []
    shopVoucher.value = null
    shippingVoucher.value = null
    selectedCombo.value = null
    comboMessage.value = ''
    insuranceOption.value = null
    codNote.value = ''
    selectedShippingId.value = ''
    selectedPaymentId.value = 'vnpay'
    sellerNote.value = ''
    hasInsurance.value = false
    agreedTerms.value = true
    lastOrder.value = null
    clearPendingPayment()
  }

  function rememberPendingPayment(payload = {}) {
    const next = {
      paymentMethod: payload.paymentMethod || selectedPaymentId.value,
      orderCode: payload.orderCode || '',
      orderId: payload.orderId || '',
      lineIds: Array.isArray(payload.lineIds) ? payload.lineIds : [],
      createdAt: Date.now(),
    }

    pendingPayment.value = next
    writePendingPayment(next)
    return next
  }

  function clearPendingPayment() {
    pendingPayment.value = null
    writePendingPayment(null)
  }

  return {
    loading,
    placing,
    hydrated,
    shippingOptions,
    paymentMethods,
    shopVouchers,
    shippingVouchers,
    activeCombos,
    selectedCombo,
    comboMessage,
    insuranceOption,
    codNote,
    selectedShippingId,
    selectedPaymentId,
    sellerNote,
    hasInsurance,
    agreedTerms,
    shopVoucher,
    shippingVoucher,
    lastOrder,
    pendingPayment,
    selectedShipping,
    shipFee,
    buildSummary,
    applyVoucher,
    removeVoucher,
    rememberPendingPayment,
    clearPendingPayment,
    resetCheckoutState,
  }
})
