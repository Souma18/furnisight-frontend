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
  <NModal :show="show" preset="card" title="Dat hang thanh cong" style="width: 420px" @update:show="$emit('update:show', $event)">
    <div class="content">
      <p>Cam on ban da mua sam tai LUXNEST.</p>
      <p><strong>Ma don:</strong> {{ orderCode || 'Dang tao...' }}</p>
      <NButton block type="primary" @click="$emit('update:show', false)">Tiep tuc kham pha</NButton>
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
