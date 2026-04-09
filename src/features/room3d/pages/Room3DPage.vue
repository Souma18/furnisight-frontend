<script setup>
import { onMounted, onUnmounted } from 'vue'
import { createRoom3DEngine } from '../core'

let engine

onMounted(() => {
  engine = createRoom3DEngine()
})

onUnmounted(() => {
  engine?.dispose?.()
})
</script>

<template>
  <section>
    <h1>Trực quan phòng 3D</h1>
    <p>Canvas WebGL và pipeline <code>roomApi</code> + <code>core/</code> sẽ triển khai tại đây.</p>
  </section>
</template>
