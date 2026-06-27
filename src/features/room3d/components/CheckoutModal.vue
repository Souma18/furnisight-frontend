<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
import AppModal from '@shared/ui/AppModal.vue'

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  cartItems: {
    type: Array,
    default: () => [],
  },
  cartTotal: {
    type: Number,
    default: 0,
  },
  formatCurrency: {
    type: Function,
    required: true,
  },
})

defineEmits(['update:show', 'submit'])
</script>

<template>
  <AppModal :open="show" width="560px" @close="$emit('update:show', false)">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Xác nhận đơn hàng</h3>
        <button type="button" class="modal-close" aria-label="Đóng" @click="$emit('update:show', false)">
          <AppIcon name="close" :size="16" />
        </button>
      </div>
    <div class="body">
      <section class="section">
        <h4>Sản phẩm đã chọn</h4>
        <div v-if="cartItems.length === 0" class="muted">Không có sản phẩm.</div>
        <div v-else class="items">
          <div v-for="item in cartItems" :key="item.id" class="item">
            <span class="item-name">
              <AppIcon :name="item.icon || 'box'" :size="15" />
              {{ item.name }}
            </span>
            <strong>{{ formatCurrency(item.price) }}</strong>
          </div>
        </div>
        <div class="total">
          <span>Tổng cộng</span>
          <strong>{{ formatCurrency(cartTotal) }}</strong>
        </div>
      </section>

      <section class="section">
        <h4>Thông tin giao hàng</h4>
        <div class="form">
          <input type="text" class="mc-input" placeholder="Họ và tên" />
          <input type="text" class="mc-input" placeholder="Số điện thoại" />
          <input type="text" class="mc-input" placeholder="Địa chỉ" />
        </div>
      </section>

      <button type="button" class="btn-primary block" @click="$emit('submit')">Đặt hàng ngay</button>
    </div>
    </div>
  </AppModal>
</template>

<style scoped>
.modal-content {
  background: var(--app-surface, #fff);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--app-border, #eaeaea);
}
.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
}
.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--app-text-muted, #666);
}
.body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 20px;
}
.section h4 {
  margin: 0 0 0.5rem;
}
.muted {
  color: var(--text-muted);
}
.items {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.item,
.total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.item-name {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.total {
  margin-top: 0.5rem;
}
.form {
  display: grid;
  gap: 0.75rem;
}
.mc-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--app-border, #eaeaea);
  border-radius: 6px;
  background: var(--app-control-bg, #fff);
  font-family: inherit;
}
.btn-primary.block {
  width: 100%;
  padding: 12px;
  background: var(--app-navy, #16233b);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
</style>
