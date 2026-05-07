<script setup>
defineProps({
  filters: { type: Array, default: () => [] },
  activeRoomFilter: { type: String, default: '' },
  rooms: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-filter'])
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
          <img :src="room.image" :alt="room.name" @error="$event.target.style.display = 'none'" />
          <div class="room-img-placeholder">{{ room.placeholder }}</div>
          <div class="room-overlay">
            <span class="room-badge">{{ room.type }}</span>
            <div class="room-info">
              <div class="room-name">{{ room.name }}</div>
              <div class="room-count">{{ room.count }}</div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>
