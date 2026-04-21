<script setup>
import { NButton, NInput, NModal } from 'naive-ui'

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
  <NModal :show="show" preset="card" title="Xac nhan don hang" style="width: 560px" @update:show="$emit('update:show', $event)">
    <div class="body">
      <section class="section">
        <h4>San pham da chon</h4>
        <div v-if="cartItems.length === 0" class="muted">Khong co san pham.</div>
        <div v-else class="items">
          <div v-for="item in cartItems" :key="item.id" class="item">
            <span>{{ item.emoji }} {{ item.name }}</span>
            <strong>{{ formatCurrency(item.price) }}</strong>
          </div>
        </div>
        <div class="total">
          <span>Tong cong</span>
          <strong>{{ formatCurrency(cartTotal) }}</strong>
        </div>
      </section>

      <section class="section">
        <h4>Thong tin giao hang</h4>
        <div class="form">
          <NInput placeholder="Ho va ten" />
          <NInput placeholder="So dien thoai" />
          <NInput placeholder="Dia chi" />
        </div>
      </section>

      <NButton type="primary" block @click="$emit('submit')">Dat hang ngay</NButton>
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
  justify-content: space-between;
  gap: 0.5rem;
}
.total {
  margin-top: 0.5rem;
}
.form {
  display: grid;
  gap: 0.5rem;
}
</style>
