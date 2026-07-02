<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useCartStore } from '@features/cart/store/cartStore'
import { useCheckoutStore } from '../store/checkoutStore'
import CheckoutSuccessOverlay from '../components/CheckoutSuccessOverlay.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const cartStore = useCartStore()

const status = ref('processing')
const message = ref('')
const orderCode = ref('')

const pendingPayment = computed(() => checkoutStore.pendingPayment)
const isSuccess = computed(() => status.value === 'success')
const isFailure = computed(() => status.value === 'failure')

function normalizeQuery(query) {
  return Object.entries(query).reduce((params, [key, value]) => {
    if (value == null) return params
    params[key] = Array.isArray(value) ? value[0] : value
    return params
  }, {})
}

function pickGatewayParams(paymentMethod, query) {
  const params = normalizeQuery(query)

  delete params.paymentMethod
  delete params.method

  if (String(paymentMethod).toLowerCase() === 'vnpay') {
    return Object.fromEntries(
      Object.entries(params).filter(([key]) => key.startsWith('vnp_')),
    )
  }

  return params
}

function resolvePaymentMethod() {
  const queryMethod = route.query.paymentMethod || route.query.method
  return String(queryMethod || pendingPayment.value?.paymentMethod || 'vnpay').toLowerCase()
}

function resolveOrderCode(params = {}) {
  const txnRef = params.vnp_TxnRef || ''
  if (txnRef.includes('_')) return txnRef.slice(0, txnRef.lastIndexOf('_'))
  return txnRef || pendingPayment.value?.orderCode || ''
}

function isGatewaySuccess(paymentMethod, params = {}) {
  if (String(paymentMethod).toLowerCase() !== 'vnpay') return true
  return params.vnp_ResponseCode === '00' && params.vnp_TransactionStatus === '00'
}

async function removePaidCartLines() {
  const lineIds = pendingPayment.value?.lineIds ?? []
  if (!lineIds.length) return

  await cartStore.ensureHydrated().catch(() => null)
  for (const lineId of lineIds) {
    await cartStore.removeItem(lineId).catch(() => null)
  }
}

async function redirectToOrderDetail() {
  const resolvedOrderCode = orderCode.value || pendingPayment.value?.orderCode || ''
  checkoutStore.clearPendingPayment()

  await router.replace({
    name: 'account',
    query: resolvedOrderCode
      ? { view: 'order-detail', orderCode: resolvedOrderCode }
      : { view: 'orders' },
  })
}

async function processCallback() {
  if (route.name === 'payment-success') {
    status.value = 'success'
    orderCode.value = pendingPayment.value?.orderCode || ''
    message.value = t('checkout.callback.status.success')
    await removePaidCartLines()
    await redirectToOrderDetail()
    return
  }

  if (route.name === 'payment-failure') {
    status.value = 'failure'
    orderCode.value = pendingPayment.value?.orderCode || ''
    message.value = t('checkout.callback.status.failed')
    checkoutStore.clearPendingPayment()
    return
  }

  const paymentMethod = resolvePaymentMethod()
  const callbackParams = pickGatewayParams(paymentMethod, route.query)

  orderCode.value = resolveOrderCode(callbackParams)

  if (!paymentMethod || !Object.keys(callbackParams).length) {
    status.value = 'failure'
    message.value = t('checkout.callback.status.notFound')
    return
  }

  try {
    await checkoutStore.verifyPaymentCallback(paymentMethod, callbackParams)

    if (isGatewaySuccess(paymentMethod, callbackParams)) {
      status.value = 'success'
      message.value = t('checkout.callback.status.success')
      await removePaidCartLines()
      await redirectToOrderDetail()
      return
    }

    status.value = 'failure'
    message.value = t('checkout.callback.status.failed')
    checkoutStore.clearPendingPayment()
  } catch (error) {
    status.value = 'failure'
    message.value = error?.response?.data?.message || error.message || 'Không thể xác nhận thanh toán.'
  }
}

function goOrders() {
  router.push({ path: '/account', query: { view: 'orders' } })
}

function goProducts() {
  router.push('/products')
}

function retryCheckout() {
  router.push('/checkout')
}

onMounted(() => {
  message.value = t('checkout.callback.status.processing')
  processCallback()
})
</script>

<template>
  <main class="payment-callback-page">
    <CheckoutSuccessOverlay
      :open="isSuccess"
      :order-code="orderCode"
      @view-order="goOrders"
      @continue-shopping="goProducts"
    />

    <section v-if="!isSuccess" class="payment-result">
      <div class="payment-icon" :class="{ failure: isFailure }">
        <AppIcon
          v-if="status === 'processing'"
          name="refresh"
          :size="34"
          :stroke-width="2"
        />
        <AppIcon
          v-else
          name="close"
          :size="34"
          :stroke-width="2.4"
        />
      </div>

      <p class="payment-eyebrow">{{ $t('checkout.callback.title') }}</p>
      <h1>
        <span v-if="status === 'processing'">{{ $t('checkout.callback.status.processing') }}</span>
        <span v-else>{{ $t('checkout.callback.status.failedLabel') }}</span>
      </h1>
      <p class="payment-message">{{ message }}</p>
      <p v-if="orderCode" class="payment-order">{{ $t('checkout.callback.orderCode', { code: orderCode }) }}</p>

      <div v-if="status !== 'processing'" class="payment-actions">
        <AppButton type="button" class="primary" @click="goOrders">
          <AppIcon name="box" :size="15" />
          {{ $t('checkout.callback.viewOrder') }}
        </AppButton>
        <AppButton v-if="isFailure" type="button" class="ghost" @click="retryCheckout">
          {{ $t('checkout.callback.retry') }}
        </AppButton>
      </div>
    </section>
  </main>
</template>

<style scoped>
.payment-callback-page {
  min-height: calc(100svh - 62px);
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  background: #f6f3ee;
}

.payment-result {
  width: min(100%, 30rem);
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  background: #fff;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.1);
}

.payment-icon {
  width: 4.5rem;
  height: 4.5rem;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #b9852f;
  background: #fff7e8;
}

.payment-icon :deep(svg) {
  animation: spin 1s linear infinite;
}

.payment-icon.success {
  color: #15803d;
  background: #dcfce7;
}

.payment-icon.failure {
  color: #b91c1c;
  background: #fee2e2;
}

.payment-icon.success :deep(svg),
.payment-icon.failure :deep(svg) {
  animation: none;
}

.payment-eyebrow {
  margin: 0 0 0.35rem;
  color: #8a6a2a;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #101828;
  font-size: clamp(1.7rem, 4vw, 2.35rem);
  line-height: 1.1;
}

.payment-message {
  margin: 0.9rem auto 0;
  max-width: 24rem;
  color: #475467;
  line-height: 1.55;
}

.payment-order {
  display: inline-flex;
  margin: 1rem 0 0;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: #f6f3ee;
  color: #5f451b;
  font-size: 0.86rem;
  font-weight: 700;
}

.payment-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.payment-actions button,
.payment-actions a {
  min-height: 2.65rem;
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.payment-actions .primary {
  color: #fff;
  background: #101828;
}

.payment-actions .ghost {
  color: #101828;
  background: #fff;
  border-color: rgba(15, 23, 42, 0.14);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
