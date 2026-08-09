<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import { useAdminOrderDetail } from '../../composables/useAdminOrderDetail'
import { useAdminUiStore } from '../../store/adminUiStore'
import ConfirmDialog from '@shared/ui/ConfirmDialog.vue'
import { adminApi } from '@shared/lib/api/services'
import { canCancelOrder } from '@shared/lib/orders/orderStatusMapper'
import { ref } from 'vue'

const props = defineProps({
  orderCode: { type: String, required: true },
})

const router = useRouter()
const ui = useAdminUiStore()
const orderCodeRef = computed(() => props.orderCode)
const titleHtml = computed(() => `Chi tiết <em` + `>${orderCodeRef.value}</em` + `>`)
const canCancelCurrentOrder = computed(() => canCancelOrder(order.value))

const {
  order,
  loading,
  error,
  displayStatusMeta,
  shippingAddress,
  paymentStatusMeta,
  paymentRows,
  timelineItems,
  load,
  paymentMethodLabel,
  formatMoney,
  formatDate,
  formatDateTime,
} = useAdminOrderDetail(orderCodeRef)

function itemName(item = {}) {
  return item.productSnapshot?.productName || item.productSnapshot?.name || 'Sản phẩm'
}

function itemImage(item = {}) {
  return item.imageUrl || item.productSnapshot?.imageUrl || ''
}

function hideBrokenImage(event) {
  event.target.style.display = 'none'
}

const isCanceling = ref(false)
const showCancelConfirm = ref(false)

function promptCancelOrder() {
  showCancelConfirm.value = true
}

async function confirmCancelCurrentOrder() {
  if (!order.value?.orderCode || !canCancelCurrentOrder.value) return

  isCanceling.value = true
  try {
    await adminApi.updateOrder(order.value.orderCode, {
      status: 'CANCELLED',
      note: 'Admin hủy đơn',
    })
    ui.showToast({
      icon: 'check',
      title: 'Đã hủy đơn',
      subtitle: 'Đơn hàng đã được cập nhật và tồn kho sẽ được hoàn lại.',
    })
    await load()
    showCancelConfirm.value = false
  } catch (error) {
    ui.showToast({
      icon: 'x',
      title: 'Không thể hủy đơn',
      subtitle: error?.response?.data?.message || error.message || 'Vui lòng thử lại sau.',
    })
  } finally {
    isCanceling.value = false
  }
}

watch(() => props.orderCode, load, { immediate: true })
</script>

<template>
  <AdminPageHeader
    eyebrow="Quản lý hệ thống"
    :title-html="titleHtml"
    subtitle="Thông tin sản phẩm, giao hàng và thanh toán"
  >
    <template #actions>
      <AppButton variant="unstyled" v-if="canCancelCurrentOrder" type="button" class="btn-cancel-order" @click="promptCancelOrder">
        <AppIcon name="ban" :size="15" />Hủy đơn
      </AppButton>
      <AppButton variant="unstyled" type="button" class="btn-export" @click="router.push({ name: 'admin-orders' })">
        <AppIcon name="chevronLeft" :size="15" />Quay lại
      </AppButton>
    </template>
  </AdminPageHeader>

  <div v-if="loading" class="admin-detail-state">Đang tải chi tiết đơn hàng...</div>
  <div v-else-if="error" class="admin-detail-state admin-detail-state--error">{{ error }}</div>

  <section v-else-if="order" class="admin-order-detail">
    <article class="admin-detail-card admin-detail-card--main">
      <div class="admin-detail-card-head">
        <div>
          <p class="admin-detail-label">Mã đơn</p>
          <h2>{{ order.orderCode }}</h2>
          <p class="admin-detail-muted">Ngày đặt: {{ formatDate(order.createdAt) }}</p>
        </div>
        <span class="badge" :class="displayStatusMeta.className">{{ displayStatusMeta.label }}</span>
      </div>

      <div class="admin-order-lines">
        <div v-for="item in order.items" :key="item.id" class="admin-order-line">
          <span class="admin-order-thumb">
            <AppImage v-if="itemImage(item)" :src="itemImage(item)" alt="" @error="hideBrokenImage"  />
            <AppIcon v-else name="image" :size="18" />
          </span>
          <div>
            <strong>{{ itemName(item) }}</strong>
            <p v-if="item.variantLabel">{{ item.variantLabel }}</p>
          </div>
          <span>SL: {{ item.quantity }}</span>
          <strong>{{ formatMoney(item.price * item.quantity) }}</strong>
        </div>
      </div>

      <div class="admin-order-timeline">
        <div class="admin-detail-section-head">
          <div>
            <p class="admin-detail-label">Minh bạch xử lý</p>
            <h3>Timeline đơn hàng</h3>
          </div>
        </div>
        <div class="admin-timeline-list">
          <div v-for="item in timelineItems" :key="item.key" class="admin-timeline-item" :class="`is-${item.state}`">
            <span class="admin-timeline-dot">
              <AppIcon :name="item.icon" :size="14" />
            </span>
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.desc }}</p>
              <small>{{ formatDateTime(item.at) || 'Chưa ghi nhận thời điểm' }}</small>
            </div>
          </div>
        </div>
      </div>
    </article>

    <aside class="admin-detail-side">
      <article class="admin-detail-card">
        <h3>Thanh toán</h3>
        <div class="admin-summary-row"><span>Tạm tính</span><strong>{{ formatMoney(order.subTotal) }}</strong></div>
        <div class="admin-summary-row"><span>Giảm giá</span><strong>{{ formatMoney(order.savedAmount) }}</strong></div>
        <div class="admin-summary-row"><span>Phí vận chuyển</span><strong>{{ formatMoney(order.fee?.shippingFee) }}</strong></div>
        <div class="admin-summary-row admin-summary-row--total"><span>Tổng cộng</span><strong>{{ formatMoney(order.totalAmount) }}</strong></div>
        <p class="admin-detail-muted">Phương thức: {{ paymentMethodLabel(order) }}</p>
      </article>

      <article class="admin-detail-card">
        <div class="admin-detail-card-head admin-detail-card-head--compact">
          <h3>Giao dịch</h3>
          <span class="badge" :class="paymentStatusMeta.className">{{ paymentStatusMeta.label }}</span>
        </div>
        <div class="admin-transaction-list">
          <div v-for="row in paymentRows" :key="row.label" class="admin-transaction-row">
            <span>{{ row.label }}</span>
            <strong>{{ row.value }}</strong>
          </div>
        </div>
      </article>

      <article class="admin-detail-card">
        <h3>Giao hàng</h3>
        <p class="admin-detail-text">
          <strong>{{ order.shippingDetail?.shippingAddressName || 'Khách hàng' }}</strong><br />
          {{ order.shippingDetail?.shippingAddressPhone || '' }}<br />
          {{ shippingAddress || order.shippingDetail?.shippingAddressDetail || 'Chưa có địa chỉ' }}
        </p>
        <p v-if="order.shippingDetail?.shippingMethod" class="admin-detail-muted">
          Đơn vị: {{ order.shippingDetail.shippingMethod }}
        </p>
      </article>

      <article v-if="order.customerNote" class="admin-detail-card">
        <h3>Ghi chú khách hàng</h3>
        <p class="admin-detail-text">{{ order.customerNote }}</p>
      </article>

      <article v-if="order.note" class="admin-detail-card">
        <h3>Ghi chú nội bộ</h3>
        <p class="admin-detail-text">{{ order.note }}</p>
      </article>
    </aside>
  </section>

  <ConfirmDialog
    :open="showCancelConfirm"
    :title="`Hủy đơn ${order?.orderCode}?`"
    message="Hàng trong đơn sẽ được trả lại kho."
    :loading="isCanceling"
    danger
    @close="showCancelConfirm = false"
    @confirm="confirmCancelCurrentOrder"
  />
</template>

<style scoped>
.admin-detail-state {
  padding: 18px 20px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--white);
  color: var(--text2);
}
.admin-detail-state--error { color: var(--red2); }
.btn-cancel-order {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 14px;
  border: 1.5px solid var(--red-bg);
  border-radius: 8px;
  background: var(--red-bg);
  color: var(--red2);
  font-family: var(--sans);
  font-weight: 700;
  cursor: pointer;
}
.btn-cancel-order:hover {
  border-color: var(--red);
}
.admin-order-detail {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
}
.admin-detail-card {
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--white);
  box-shadow: var(--shadow-sm);
}
.admin-detail-card h2,
.admin-detail-card h3 {
  margin: 0;
}
.admin-detail-card h2 { font-size: 24px; }
.admin-detail-card h3 { margin-bottom: 14px; font-size: 15px; }
.admin-detail-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.admin-detail-card-head--compact {
  align-items: center;
  margin-bottom: 12px;
}
.admin-detail-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
.admin-detail-label {
  margin: 0 0 4px;
  color: var(--text3);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
}
.admin-detail-muted {
  margin: 8px 0 0;
  color: var(--text3);
  font-size: 12px;
}
.admin-detail-text {
  margin: 0;
  color: var(--text2);
  line-height: 1.55;
}
.admin-detail-side {
  display: grid;
  gap: 14px;
  align-content: start;
}
.admin-order-lines {
  display: grid;
  gap: 10px;
}
.admin-order-timeline {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}
.admin-timeline-list {
  display: grid;
  gap: 12px;
}
.admin-timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--cream);
}
.admin-timeline-item strong {
  display: block;
  color: var(--text);
  font-size: 13px;
}
.admin-timeline-item p {
  margin: 4px 0 0;
  color: var(--text2);
  font-size: 12px;
  line-height: 1.45;
}
.admin-timeline-item small {
  display: block;
  margin-top: 5px;
  color: var(--text4);
  font-size: 11px;
}
.admin-timeline-dot {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--white);
  color: var(--text3);
  border: 1px solid var(--border);
}
.admin-timeline-item.is-done .admin-timeline-dot {
  color: var(--green);
  background: var(--green-bg);
  border-color: rgba(42, 122, 80, .18);
}
.admin-timeline-item.is-current .admin-timeline-dot {
  color: var(--gold);
  background: var(--gold-pale);
  border-color: rgba(201, 146, 42, .24);
}
.admin-timeline-item.is-failed .admin-timeline-dot {
  color: var(--red);
  background: var(--red-bg);
  border-color: rgba(192, 57, 43, .18);
}
.admin-timeline-item.is-muted {
  opacity: .72;
}
.admin-order-line {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
}
.admin-order-line p {
  margin: 4px 0 0;
  color: var(--text3);
  font-size: 12px;
}
.admin-order-thumb {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 8px;
  background: var(--cream);
  overflow: hidden;
}
.admin-order-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.admin-summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  color: var(--text2);
  border-bottom: 1px solid var(--border);
}
.admin-summary-row--total {
  border-bottom: 0;
  color: var(--text);
  font-size: 16px;
}
.admin-transaction-list {
  display: grid;
  gap: 8px;
}
.admin-transaction-row {
  display: grid;
  grid-template-columns: minmax(0, 120px) minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.admin-transaction-row:last-child {
  border-bottom: 0;
}
.admin-transaction-row span {
  color: var(--text3);
  font-size: 12px;
}
.admin-transaction-row strong {
  min-width: 0;
  color: var(--text);
  font-size: 12px;
  text-align: right;
  overflow-wrap: anywhere;
}
@media (max-width: 960px) {
  .admin-order-detail { grid-template-columns: 1fr; }
  .admin-order-line { grid-template-columns: 52px minmax(0, 1fr); }
  .admin-transaction-row { grid-template-columns: 1fr; }
  .admin-transaction-row strong { text-align: left; }
}
</style>
