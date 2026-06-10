<script setup>
import { NButton, NInput, NModal } from 'naive-ui'
import AppIcon from '@shared/ui/AppIcon.vue'

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
  <NModal :show="show" preset="card" title="Xác nhận đơn hàng" style="width: 560px" @update:show="$emit('update:show', $event)">
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
          <NInput placeholder="Họ và tên" />
          <NInput placeholder="Số điện thoại" />
          <NInput placeholder="Địa chỉ" />
        </div>
      </section>

      <NButton type="primary" block @click="$emit('submit')">Đặt hàng ngay</NButton>
    </div>
  </NModal>
</template>

<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  gap: 0.5rem;
}
</style>
