<script setup>
defineProps({
  lines: { type: Array, default: () => [] },
  summary: { type: Object, required: true },
  formatMoney: { type: Function, required: true },
  agreedTerms: { type: Boolean, default: true },
  placing: { type: Boolean, default: false },
})

defineEmits(['update-agreed', 'place-order'])

function lineThumb(line) {
  return line.imageFallback ?? line.emoji ?? '🛍️'
}
</script>

<template>
  <aside class="checkout-summary">
    <div class="co-sum-card">
      <div class="co-sum-head">
        <p class="co-sum-title">Đơn hàng <em>của bạn</em></p>
        <p class="co-sum-count">{{ summary.itemQty }} sản phẩm</p>
      </div>

      <div class="co-sum-products">
        <div v-for="line in lines" :key="line.id" class="co-sum-item">
          <div class="co-sum-thumb">
            {{ lineThumb(line) }}
            <span class="co-sum-qty">{{ line.qty }}</span>
          </div>
          <span class="co-sum-name">{{ line.name }}</span>
          <span class="co-sum-price">{{ formatMoney(line.price * line.qty) }}</span>
        </div>
      </div>

      <div class="co-sum-rows">
        <div class="co-sum-row">
          <span>Tạm tính</span>
          <span>{{ formatMoney(summary.subtotal) }}</span>
        </div>
        <div class="co-sum-row">
          <span>Phí vận chuyển</span>
          <span>{{ formatMoney(summary.shipFee) }}</span>
        </div>
        <div v-if="summary.shippingDiscount" class="co-sum-row">
          <span>Voucher vận chuyển</span>
          <span class="green">−{{ formatMoney(summary.shippingDiscount) }}</span>
        </div>
        <div class="co-sum-row">
          <span>Voucher Shop</span>
          <span :class="{ green: summary.shopDiscount }">
            {{ summary.shopDiscount ? `−${formatMoney(summary.shopDiscount)}` : 'Chưa áp dụng' }}
          </span>
        </div>
        <div class="co-sum-row">
          <span>Bảo hiểm</span>
          <span :class="{ green: summary.insuranceAmount }">
            {{ summary.insuranceAmount ? formatMoney(summary.insuranceAmount) : 'Không' }}
          </span>
        </div>
        <div v-if="summary.saved" class="co-sum-row">
          <span>Tiết kiệm được</span>
          <span class="green">−{{ formatMoney(summary.saved) }}</span>
        </div>
      </div>

      <div class="co-sum-total">
        <p style="font-size: 0.78rem; color: var(--co-text-mid, #555)">Tổng thanh toán</p>
        <p class="co-sum-total-val">{{ formatMoney(summary.total) }}</p>
        <p v-if="summary.saved" class="co-sum-saving">🎉 Tiết kiệm {{ formatMoney(summary.saved) }} so với giá gốc</p>
      </div>

      <div class="co-sum-confirm">
        <label class="co-agree">
          <input
            type="checkbox"
            :checked="agreedTerms"
            @change="$emit('update-agreed', $event.target.checked)"
          >
          <span>
            Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý tuân theo
            <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a> của LUXNEST.
          </span>
        </label>
        <button
          type="button"
          class="co-btn-order"
          :disabled="placing"
          @click="$emit('place-order')"
        >
          ✦ Đặt hàng – {{ formatMoney(summary.total) }}
        </button>
        <p class="co-btn-order-sub">🔒 Thanh toán được mã hoá và bảo mật</p>
      </div>
    </div>
  </aside>
</template>
