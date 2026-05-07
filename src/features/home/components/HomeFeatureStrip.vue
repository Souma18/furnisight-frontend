<script setup>
defineProps({
  items: { type: Array, default: () => [] },
})
</script>

<template>
  <section class="hn-strip">
    <div v-for="item in items" :key="item.title" class="hn-strip-item">
      <span class="hn-strip-icon">{{ item.icon }}</span>
      <div>
        <strong>{{ item.title }}</strong>
        <p>{{ item.subtitle }}</p>
      </div>
    </div>
  </section>
</template>
