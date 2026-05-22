import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchCheckoutSessionMock,
  placeCheckoutOrderMock,
  validateCheckoutVoucherMock,
} from '../api/checkoutMockApi'
import { buildCheckoutSummary } from '../utils/checkoutPricing'

export const useCheckoutStore = defineStore('checkout', () => {
  const loading = ref(false)
  const placing = ref(false)
  const hydrated = ref(false)

  const shippingOptions = ref([])
  const paymentMethods = ref([])
  const shopVouchers = ref([])
  const shippingVouchers = ref([])
  const insuranceOption = ref(null)
  const codNote = ref('')

  const selectedShippingId = ref('')
  const selectedPaymentId = ref('cod')
  const sellerNote = ref('')
  const hasInsurance = ref(false)
  const agreedTerms = ref(true)

  const shopVoucher = ref(null)
  const shippingVoucher = ref(null)

  const lastOrder = ref(null)

  const selectedShipping = computed(
    () => shippingOptions.value.find((item) => item.id === selectedShippingId.value) ?? null,
  )

  const shipFee = computed(() => {
    const fee = Number(selectedShipping.value?.fee) || 0
    return selectedShipping.value?.isFree ? 0 : fee
  })

  async function hydrateSession() {
    if (hydrated.value) return
    loading.value = true

    try {
      // TODO(BE): replace with checkoutApi.getCheckoutSession()
      const response = await fetchCheckoutSessionMock()
      const data = response?.data ?? {}

      shippingOptions.value = data.shippingOptions ?? []
      paymentMethods.value = data.paymentMethods ?? []
      shopVouchers.value = data.shopVouchers ?? []
      shippingVouchers.value = data.shippingVouchers ?? []
      insuranceOption.value = data.insurance ?? null
      codNote.value = data.codNote ?? ''

      selectedShippingId.value = data.defaultShippingId ?? shippingOptions.value[0]?.id ?? ''
      selectedPaymentId.value = data.defaultPaymentId ?? 'cod'

      const defaultShipVoucher = shippingVouchers.value.find(
        (item) => item.code === data.defaultShippingVoucherCode,
      )
      shippingVoucher.value = defaultShipVoucher ?? null

      hydrated.value = true
    } finally {
      loading.value = false
    }
  }

  function buildSummary(lines) {
    return buildCheckoutSummary({
      lines,
      shipFee: shipFee.value,
      shopVoucher: shopVoucher.value,
      shippingVoucher: shippingVoucher.value,
      hasInsurance: hasInsurance.value,
      insurancePrice: insuranceOption.value?.price ?? 0,
    })
  }

  async function applyVoucherByCode(code, type, subtotal) {
    // TODO(BE): replace with checkoutApi.validateCheckoutVoucher()
    const response = await validateCheckoutVoucherMock({ code, type, subtotal })
    const data = response?.data ?? {}

    if (!data.valid) {
      return { ok: false, message: data.message ?? 'Mã không hợp lệ.' }
    }

    if (type === 'ship') {
      shippingVoucher.value = data.voucher
    } else {
      shopVoucher.value = data.voucher
    }

    return { ok: true, voucher: data.voucher, discount: data.discount ?? 0 }
  }

  function applyVoucher(voucher, type = 'shop') {
    if (!voucher) return
    if (type === 'ship') shippingVoucher.value = voucher
    else shopVoucher.value = voucher
  }

  function removeVoucher(type = 'shop') {
    if (type === 'ship') shippingVoucher.value = null
    else shopVoucher.value = null
  }

  async function placeOrder(payload) {
    placing.value = true
    try {
      // TODO(BE): replace with checkoutApi.placeCheckoutOrder(payload)
      const response = await placeCheckoutOrderMock(payload)
      lastOrder.value = response?.data ?? null
      return lastOrder.value
    } finally {
      placing.value = false
    }
  }

  function resetCheckoutState() {
    shopVoucher.value = null
    shippingVoucher.value = null
    sellerNote.value = ''
    hasInsurance.value = false
    agreedTerms.value = true
    lastOrder.value = null
  }

  return {
    loading,
    placing,
    hydrated,
    shippingOptions,
    paymentMethods,
    shopVouchers,
    shippingVouchers,
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
    selectedShipping,
    shipFee,
    hydrateSession,
    buildSummary,
    applyVoucherByCode,
    applyVoucher,
    removeVoucher,
    placeOrder,
    resetCheckoutState,
  }
})
