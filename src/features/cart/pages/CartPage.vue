<script setup>
import { storeToRefs } from 'pinia'
import { useCartStore } from '../store/cartStore'

const store = useCartStore()
const { lines } = storeToRefs(store)
</script>

<template>
  <section>
    <h1>Giỏ hàng</h1>
    <p v-if="!lines.length">Giỏ trống — đồng bộ qua <code>cartApi</code> sau.</p>
    <ul v-else>
      <li v-for="line in lines" :key="line.id">{{ line }}</li>
    </ul>
  </section>
</template>
