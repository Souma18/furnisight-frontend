<script setup>
import { computed, ref } from 'vue'
import AccountSectionCard from '../AccountSectionCard.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  orders: {
    type: Array,
    default: () => [],
  },
})

const filter = ref('all')
const filteredOrders = computed(() =>
  filter.value === 'all' ? props.orders : props.orders.filter((order) => order.status === filter.value),
)

const statusLabels = {
  all: 'Tất cả',
  pending: 'Chờ xác nhận',
  delivering: 'Đang giao',
  done: 'Hoàn thành',
  cancel: 'Đã hủy',
}

function getStatusLabel(status) {
  return statusLabels[status] ?? status
}
</script>

<template>
  <AccountSectionCard title="Đơn hàng của tôi">
    <div class="filters">
      <button v-for="item in ['all', 'pending', 'delivering', 'done', 'cancel']" :key="item" :class="{ active: filter === item }" @click="filter = item">
        {{ getStatusLabel(item) }}
      </button>
    </div>
    <div class="list">
      <article v-for="order in filteredOrders" :key="order.id" class="item">
        <div>
          <p class="id">#{{ order.id }}</p>
          <p class="meta">{{ order.date }} · {{ order.items }} sản phẩm</p>
        </div>
        <div class="right">
          <span class="badge">{{ getStatusLabel(order.status) }}</span>
          <strong>{{ order.total.toLocaleString('vi-VN') }}đ</strong>
        </div>
      </article>
      <p v-if="!filteredOrders.length" class="empty">
        <AppIcon name="box" :size="14" /> Không có đơn hàng ở trạng thái này.
      </p>
    </div>
  </AccountSectionCard>
</template>

<style scoped>
.filters { display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.7rem; }
.filters button { border:1px solid var(--auth-border); background:var(--account-surface); border-radius:999px; padding:0.35rem 0.7rem; cursor:pointer; }
.filters button.active { border-color:var(--auth-brand-start); color:var(--auth-brand-start); }
.list { display:grid; gap:0.6rem; }
.item { border:1px solid var(--auth-border); border-radius:12px; padding:0.72rem; display:flex; justify-content:space-between; gap:0.6rem; }
.id { margin:0; font-weight:600; }
.meta { margin:0.2rem 0 0; color:var(--auth-text-secondary); font-size:0.82rem; }
.right { text-align:right; display:grid; gap:0.2rem; }
.badge { font-size:0.75rem; color:var(--account-badge); text-transform:capitalize; }
.empty { margin:0; color:var(--auth-text-secondary); display:flex; align-items:center; gap:0.35rem; }
</style>
