<script setup>
import HomeRoomCard from './HomeRoomCard.vue'

defineProps({
  filters: { type: Array, default: () => [] },
  activeFilter: { type: String, default: '' },
  rooms: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-filter'])
</script>

<template>
  <section id="rooms" class="hn-section-dark js-reveal">
    <div class="hn-section-head">
      <div>
        <p class="hn-label">Bộ sưu tập</p>
        <h2 class="hn-title">Khám phá <em>không gian</em> sống</h2>
      </div>
      <a href="#" class="hn-link">Xem tat ca</a>
    </div>

    <div class="hn-filter-row">
      <button
        v-for="filter in filters"
        :key="filter"
        type="button"
        :class="['hn-filter-btn', { 'is-active': activeFilter === filter }]"
        @click="emit('select-filter', filter)"
      >
        {{ filter }}
      </button>
    </div>

    <div class="hn-rooms-grid">
      <HomeRoomCard v-for="room in rooms" :key="room.id" :room="room" />
    </div>
  </section>
</template>
