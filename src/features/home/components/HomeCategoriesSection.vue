<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  activeCategoryId: { type: String, default: '' },
})

const emit = defineEmits(['select-category'])
</script>

<template>
  <section class="fade-up">
    <div class="section-head">
      <div>
        <div class="section-label">Danh muc san pham</div>
        <h2 class="section-title">Tim kiem theo <em>phong cach</em></h2>
      </div>
    </div>
    <div class="categories-grid">
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        :class="['cat-card', { active: activeCategoryId === category.id }]"
        @click="emit('select-category', category.id)"
      >
        <div class="cat-icon">
          <img v-if="category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/'))" :src="category.icon" :alt="category.name" class="cat-icon-img" />
          <span v-else>{{ category.icon }}</span>
        </div>
        <div class="cat-name">{{ category.name }}</div>
        <div class="cat-count">{{ category.count }}</div>
      </button>
    </div>
  </section>
</template>

<style scoped>
.cat-icon-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
</style>
