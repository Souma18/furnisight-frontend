<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  activeCategoryId: { type: String, default: '' },
})

const emit = defineEmits(['select-category'])
</script>

<template>
  <section class="hn-section js-reveal">
    <div class="hn-section-head">
      <div>
        <p class="hn-label">Danh muc san pham</p>
        <h2 class="hn-title">Tim kiem theo <em>phong cach</em></h2>
      </div>
      <a href="#products" class="hn-link">Tat ca danh muc</a>
    </div>

    <div class="hn-categories">
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        :class="['hn-category-card', { 'is-active': activeCategoryId === category.id }]"
        @click="emit('select-category', category.id)"
      >
        <div class="hn-category-icon">{{ category.icon }}</div>
        <div class="hn-category-name">{{ category.name }}</div>
        <div class="hn-category-count">{{ category.count }}</div>
      </button>
    </div>
  </section>
</template>
