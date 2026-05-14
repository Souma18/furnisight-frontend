<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  filters: { type: Array, default: () => [] },
  activeRoomFilter: { type: String, default: '' },
  rooms: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-filter'])

function getCategoryRoute(roomName) {
  // Map display names to the breadcrumb format expected by ProductListPage.vue
  return {
    name: 'products',
    query: { breadcrumb: roomName.toLowerCase() }
  }
}
</script>

<template>
  <div class="rooms-bg fade-up">
    <div class="rooms-inner">
      <div class="rooms-head">
        <div>
          <div class="section-label">Bo suu tap</div>
          <h2 class="section-title">Kham pha <em>khong gian</em> song</h2>
        </div>
      </div>
      <div class="room-filters">
        <button
          v-for="filter in filters"
          :key="filter"
          type="button"
          :class="['room-filter', { active: activeRoomFilter === filter }]"
          @click="emit('select-filter', filter)"
        >
          {{ filter }}
        </button>
      </div>
      <div class="rooms-grid">
        <article
          v-for="room in rooms"
          :key="room.id"
          :class="['room-card', { big: room.isBig }]"
        >
          <RouterLink :to="getCategoryRoute(room.name)" class="room-link">
            <img :src="room.image" :alt="room.name" @error="$event.target.style.display = 'none'" />
            <div class="room-img-placeholder">{{ room.placeholder }}</div>
            <div class="room-overlay">
              <span class="room-badge">{{ room.type }}</span>
              <div class="room-info">
                <div class="room-name">{{ room.name }}</div>
                <div class="room-count">{{ room.count }}</div>
              </div>
            </div>
          </RouterLink>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.room-link {
  display: block;
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: inherit;
}
</style>
