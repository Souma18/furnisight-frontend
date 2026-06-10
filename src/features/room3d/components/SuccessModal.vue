<script setup>
import { NButton, NModal } from 'naive-ui'

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  orderCode: {
    type: String,
    default: '',
  },
})

defineEmits(['update:show'])
</script>

<template>
  <NModal :show="show" preset="card" title="Đặt hàng thành công" style="width: 420px" @update:show="$emit('update:show', $event)">
    <div class="content">
      <p>Cảm ơn bạn đã mua sắm tại LUXNEST.</p>
      <p><strong>Mã đơn:</strong> {{ orderCode || 'Đang tạo...' }}</p>
      <NButton block type="primary" @click="$emit('update:show', false)">Tiếp tục khám phá</NButton>
    </div>
  </NModal>
</template>

<style scoped>
.content {
  display: grid;
  gap: 0.75rem;
}
p {
  margin: 0;
}
</style>
