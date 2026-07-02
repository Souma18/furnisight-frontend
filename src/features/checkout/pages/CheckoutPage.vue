<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CheckoutAddressCard from '../components/CheckoutAddressCard.vue'
import CheckoutAddressModal from '../components/CheckoutAddressModal.vue'
import CheckoutBreadcrumb from '../components/CheckoutBreadcrumb.vue'
import CheckoutPaymentCard from '../components/CheckoutPaymentCard.vue'
import CheckoutShopCard from '../components/CheckoutShopCard.vue'
import CheckoutStepsBar from '../components/CheckoutStepsBar.vue'
import CheckoutSuccessOverlay from '../components/CheckoutSuccessOverlay.vue'
import CheckoutSummaryCard from '../components/CheckoutSummaryCard.vue'
import CheckoutToolbar from '../components/CheckoutToolbar.vue'
import CheckoutVoucherCard from '../components/CheckoutVoucherCard.vue'
import CheckoutVoucherModal from '../components/CheckoutVoucherModal.vue'
import { useCheckout } from '../composables/useCheckout'
import { useCheckoutVoucherModal } from '../composables/useCheckoutVoucherModal'
import { useCheckoutStore } from '../store/checkoutStore'
import { getApiErrorMessage } from '@shared/lib/api'
import '../styles/checkoutPage.css'

const router = useRouter()
const { t } = useI18n()
const checkoutStore = useCheckoutStore()

const addressModalOpen = ref(false)
const addressToEdit = ref(null)

function openAddressModal(address = null) {
  addressToEdit.value = address
  addressModalOpen.value = true
}

async function handleSaveAddress(payload) {
  await saveCheckoutAddress(payload)
  addressModalOpen.value = false
}

const {
  checkoutLines,
  addressList,
  selectedAddressId,
  summary,
  isEmpty,
  loading,
  placing,
  showSuccess,
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
  selectedCombo,
  comboMessage,
  lastOrder,
  formatMoney,
  initCheckout,
  goBackToCart,
  selectAddress,
  saveCheckoutAddress,
  updateLineQty,
  placeOrder,
  showToast,
  applyVoucherByCode,
} = useCheckout()

const { applyVoucher, removeVoucher } = checkoutStore

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
  try {
    await initCheckout()
    if (isEmpty.value && !showSuccess.value && !placing.value) {
      router.replace('/cart')
    }
  } catch (error) {
    showToast({
      icon: 'alert',
      title: t('checkout.page.errorTitle'),
      subtitle: getApiErrorMessage(error, t('checkout.page.errorSubtitle')),
    })
  }
})

async function handlePlaceOrder() {
  await placeOrder()
}

function handleViewOrder() {
  const orderCode = lastOrder.value?.orderCode
  showSuccess.value = false
  router.push({
    path: '/account',
    query: orderCode ? { view: 'order-detail', orderCode } : { view: 'orders' },
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
      {{ $t('checkout.page.loading') }}
    </div>

    <template v-else-if="!isEmpty">
      <div class="checkout-body">
        <div>
          <CheckoutAddressCard
            :addresses="addressList"
            :selected-address-id="selectedAddressId"
            @select-address="selectAddress"
            @open-create="openAddressModal()"
            @open-edit="openAddressModal"
          />

          <CheckoutShopCard
            :lines="checkoutLines"
            :format-money="formatMoney"
            :insurance-option="insuranceOption"
            :has-insurance="hasInsurance"
            :seller-note="sellerNote"
            :shipping-options="shippingOptions"
            :selected-shipping-id="selectedShippingId"
            :item-qty="summary.itemQty"
            :subtotal="summary.subtotal"
            @update-qty="updateLineQty"
            @update-insurance="hasInsurance = $event"
            @update-note="sellerNote = $event"
            @update-shipping="selectedShippingId = $event"
          />

          <CheckoutVoucherCard
            :shop-voucher="shopVoucher"
            :shipping-voucher="shippingVoucher"
            :selected-combo="selectedCombo"
            :combo-message="comboMessage"
            :shop-discount="summary.shopDiscount"
            :shipping-discount="summary.shippingDiscount"
            :combo-discount="summary.comboDiscount"
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

    <CheckoutAddressModal
      :open="addressModalOpen"
      :address="addressToEdit"
      @close="addressModalOpen = false"
      @save="handleSaveAddress"
    />

    <CheckoutSuccessOverlay
      :open="showSuccess"
      :order-code="lastOrder?.orderCode ?? ''"
      @view-order="handleViewOrder"
      @continue-shopping="handleContinueShopping"
    />

  </section>
</template>
