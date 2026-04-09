<script setup>
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <section>
    <h1>Chi tiết sản phẩm</h1>
    <p>Mã: <code>{{ id }}</code> — tải bằng <code>fetchProductById</code>.</p>
  </section>
</template>
