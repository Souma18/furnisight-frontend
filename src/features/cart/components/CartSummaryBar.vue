<script setup>
defineProps({
  selectedCount: {
    type: Number,
    default: 0,
  },
  totalLabel: {
    type: String,
    required: true,
  },
  checkoutDisabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['checkout'])
</script>

<template>
  <div class="cart-footer">
    <button
      type="button"
      class="checkout-btn"
      :disabled="checkoutDisabled"
      @click="$emit('checkout')"
    >
      Thanh toán ngay
    </button>

    <p class="total">
      Tổng cộng{{ selectedCount ? ` (${selectedCount} sản phẩm)` : '' }}: {{ totalLabel }}
    </p>
  </div>
</template>

<style scoped>
.cart-footer {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
}
.checkout-btn {
  border: none;
  border-radius: 10px;
  padding: 0.72rem 1.15rem;
  background: linear-gradient(135deg, var(--auth-brand-start), var(--auth-brand-end));
  color: var(--color-white);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(18, 32, 46, 0.12);
  transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.checkout-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(18, 32, 46, 0.16);
}
.checkout-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}
.total {
  margin: 0;
  font-weight: 700;
  color: var(--account-badge);
  text-align: right;
}

@media (max-width: 720px) {
  .cart-footer {
    flex-direction: column;
    align-items: stretch;
  }
  .checkout-btn,
  .total {
    width: 100%;
  }
  .total {
    text-align: left;
  }
}
</style>
