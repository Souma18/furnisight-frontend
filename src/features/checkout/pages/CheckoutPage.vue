<script setup>
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import CheckoutAddressCard from '../components/CheckoutAddressCard.vue'
import CheckoutBreadcrumb from '../components/CheckoutBreadcrumb.vue'
import CheckoutPaymentCard from '../components/CheckoutPaymentCard.vue'
import CheckoutShopCard from '../components/CheckoutShopCard.vue'
import CheckoutStepsBar from '../components/CheckoutStepsBar.vue'
import CheckoutSuccessOverlay from '../components/CheckoutSuccessOverlay.vue'
import CheckoutSummaryCard from '../components/CheckoutSummaryCard.vue'
import CheckoutToast from '../components/CheckoutToast.vue'
import CheckoutToolbar from '../components/CheckoutToolbar.vue'
import CheckoutVoucherCard from '../components/CheckoutVoucherCard.vue'
import CheckoutVoucherModal from '../components/CheckoutVoucherModal.vue'
import { useCheckout } from '../composables/useCheckout'
import { useCheckoutVoucherModal } from '../composables/useCheckoutVoucherModal'
import { useCheckoutStore } from '../store/checkoutStore'
import '../styles/checkoutPage.css'

const router = useRouter()
const checkoutStore = useCheckoutStore()

const {
  checkoutLines,
  defaultAddress,
  summary,
  isEmpty,
  loading,
  placing,
  showSuccess,
  toast,
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
  formatMoney,
  initCheckout,
  goBackToCart,
  goChangeAddress,
  updateLineQty,
  placeOrder,
  showToast,
} = useCheckout()

const { applyVoucherByCode, applyVoucher, removeVoucher } = checkoutStore

const {
  voucherModalOpen,
  voucherModalType,
  voucherApplying,
  modalVouchers,
  openVoucherModal,
  closeVoucherModal,
  handleApplyVoucherCode,
  handleConfirmVoucher,
  handleRemoveVoucher,
} = useCheckoutVoucherModal({
  shopVouchers,
  shippingVouchers,
  summary,
  applyVoucherByCode,
  applyVoucher,
  removeVoucher,
  showToast,
})

onMounted(async () => {
  await initCheckout()
  if (isEmpty.value) {
    router.replace({ path: '/account', query: { view: 'cart' } })
  }
})

watch(isEmpty, (empty) => {
  if (empty && !showSuccess.value && !placing.value) {
    router.replace({ path: '/account', query: { view: 'cart' } })
  }
})

async function handlePlaceOrder() {
  await placeOrder()
}

function handleViewOrder() {
  const orderId = lastOrder.value?.orderId
  showSuccess.value = false
  router.push({
    path: '/account',
    query: orderId ? { view: 'order-detail', orderId } : { view: 'orders' },
  })
}

function handleContinueShopping() {
  showSuccess.value = false
  router.push('/products')
}
</script>

<template>
  <section class="checkout-page">
    <CheckoutToolbar @back="goBackToCart" />
    <CheckoutStepsBar />
    <CheckoutBreadcrumb />

    <div v-if="loading" style="padding: 2rem; text-align: center; color: var(--co-text-mid, #555)">
      Đang tải thông tin thanh toán...
    </div>

    <template v-else-if="!isEmpty">
      <div class="checkout-body">
        <div>
          <CheckoutAddressCard :address="defaultAddress" @change-address="goChangeAddress" />

          <CheckoutShopCard
            :lines="checkoutLines"
            :format-money="formatMoney"
            :insurance-option="insuranceOption"
            :has-insurance="hasInsurance"
            :seller-note="sellerNote"
            :shipping-options="shippingOptions"
            :selected-shipping-id="selectedShippingId"
            @update-qty="updateLineQty"
            @update-insurance="hasInsurance = $event"
            @update-note="sellerNote = $event"
            @update-shipping="selectedShippingId = $event"
          />

          <CheckoutVoucherCard
            :shop-voucher="shopVoucher"
            :shipping-voucher="shippingVoucher"
            :shipping-discount="summary.shippingDiscount"
            :format-money="formatMoney"
            @open-voucher="openVoucherModal"
            @remove-voucher="handleRemoveVoucher"
          />

          <CheckoutPaymentCard
            :payment-methods="paymentMethods"
            :selected-payment-id="selectedPaymentId"
            :cod-note="codNote"
            @update-payment="selectedPaymentId = $event"
          />
        </div>

        <CheckoutSummaryCard
          :lines="checkoutLines"
          :summary="summary"
          :format-money="formatMoney"
          :agreed-terms="agreedTerms"
          :placing="placing"
          @update-agreed="agreedTerms = $event"
          @place-order="handlePlaceOrder"
        />
      </div>
    </template>

    <CheckoutVoucherModal
      :open="voucherModalOpen"
      :type="voucherModalType"
      :vouchers="modalVouchers"
      :applying="voucherApplying"
      @close="closeVoucherModal"
      @apply-code="handleApplyVoucherCode"
      @confirm="handleConfirmVoucher"
    />

    <CheckoutSuccessOverlay
      :open="showSuccess"
      :order-code="lastOrder?.orderCode ?? ''"
      @view-order="handleViewOrder"
      @continue-shopping="handleContinueShopping"
    />

    <CheckoutToast
      :show="toast.show"
      :icon="toast.icon"
      :title="toast.title"
      :subtitle="toast.subtitle"
    />
  </section>
</template>
