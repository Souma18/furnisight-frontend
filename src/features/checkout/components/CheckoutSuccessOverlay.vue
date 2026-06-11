<script setup>
defineProps({
  open: { type: Boolean, default: false },
  orderCode: { type: String, default: '' },
})

defineEmits(['view-order', 'continue-shopping'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="checkout-success-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-success-title"
    >
      <div class="checkout-success-box">
        <div class="checkout-success-icon">🎉</div>
        <h2 id="checkout-success-title" class="checkout-success-title">
          Đặt hàng <em>thành công!</em>
        </h2>
        <p class="checkout-success-sub">
          Cảm ơn bạn đã tin tưởng LUXNEST. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến tay bạn.
        </p>

        <div class="checkout-success-steps">
          <div class="ss-item">
            <div class="ss-dot done">✓</div>
            <div class="ss-label">Đặt hàng</div>
          </div>
          <div class="ss-item">
            <div class="ss-dot pend">📦</div>
            <div class="ss-label">Xử lý</div>
          </div>
          <div class="ss-item">
            <div class="ss-dot pend">🚚</div>
            <div class="ss-label">Giao hàng</div>
          </div>
          <div class="ss-item">
            <div class="ss-dot pend">🏠</div>
            <div class="ss-label">Hoàn tất</div>
          </div>
        </div>

        <div v-if="orderCode" class="checkout-success-order-id">Mã đơn: {{ orderCode }}</div>

        <div class="checkout-success-actions">
          <button type="button" class="checkout-success-btn checkout-success-btn--primary" @click="$emit('view-order')">
            📦 Xem đơn hàng
          </button>
          <button type="button" class="checkout-success-btn checkout-success-btn--ghost" @click="$emit('continue-shopping')">
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.checkout-success-overlay {
  --co-navy: #12202e;
  --co-gold: #c9922a;
  --co-cream: #faf6f0;
  --co-cream-mid: #ece2cf;
  --co-text-mid: #555;
  --co-text-light: #888;
  --co-green: #2d9e6b;

  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(10, 18, 28, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: var(--sans);
}

.checkout-success-box {
  background: #fff;
  border-radius: 24px;
  width: 100%;
  max-width: 460px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.35);
}

.checkout-success-icon {
  font-size: 64px;
  line-height: 1;
  margin-bottom: 18px;
}

.checkout-success-title {
  font-family: var(--sans);
  font-size: 32px;
  font-weight: 300;
  color: #1a1a1a;
  margin: 0 0 10px;
  line-height: 1.2;
}

.checkout-success-title em {
  font-style: italic;
  color: var(--co-gold);
}

.checkout-success-sub {
  font-size: 14px;
  color: var(--co-text-mid);
  line-height: 1.75;
  margin: 0 0 24px;
}

.checkout-success-steps {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.ss-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  position: relative;
  min-width: 0;
}

.ss-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 14px;
  left: 60%;
  right: -40%;
  height: 2px;
  background: linear-gradient(90deg, var(--co-green), var(--co-cream-mid));
}

.ss-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  line-height: 1;
  z-index: 1;
}

.ss-dot.done {
  background: var(--co-green);
  color: #fff;
}

.ss-dot.pend {
  background: var(--co-cream-mid);
  color: var(--co-text-light);
}

.ss-label {
  font-size: 10px;
  color: var(--co-text-light);
  text-align: center;
}

.checkout-success-order-id {
  background: var(--co-cream);
  border: 1px dashed var(--co-cream-mid);
  border-radius: 10px;
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--co-navy);
  margin-bottom: 26px;
}

.checkout-success-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
}

.checkout-success-btn {
  width: 100%;
  min-height: 44px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: none;
  white-space: nowrap;
}

.checkout-success-btn--primary {
  background: #12202e;
  color: #ffffff;
}

.checkout-success-btn--primary:hover {
  opacity: 0.88;
}

.checkout-success-btn--ghost {
  background: #ffffff;
  color: #555555;
  border: 1.5px solid #ece2cf;
}

.checkout-success-btn--ghost:hover {
  border-color: #12202e;
  color: #12202e;
}

@media (max-width: 480px) {
  .checkout-success-actions {
    grid-template-columns: 1fr;
  }

  .checkout-success-box {
    padding: 36px 24px;
  }
}
</style>
