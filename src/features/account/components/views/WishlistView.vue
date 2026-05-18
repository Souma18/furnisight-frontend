<script setup>
import AccountSectionCard from '../AccountSectionCard.vue'
import HomeProductTile from '@features/home/components/HomeProductTile.vue'

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <AccountSectionCard title="Sản phẩm yêu thích">
    <div v-if="!items.length" class="empty-state">Chưa có sản phẩm nào trong danh sách yêu thích.</div>

    <div v-else class="grid">
      <HomeProductTile
        v-for="item in items"
        :key="item.id"
        :product="item"
        :wished="item.isFavorite !== false"
        :wish-readonly="true"
      />
    </div>
  </AccountSectionCard>
</template>

<style scoped>
.empty-state {
  border: 1px dashed var(--auth-border);
  border-radius: 14px;
  padding: 1rem;
  color: var(--auth-text-secondary);
  text-align: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

@media (max-width: 1100px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 780px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
