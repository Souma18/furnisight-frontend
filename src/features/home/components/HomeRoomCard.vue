<script setup>
defineProps({
  room: { type: Object, required: true },
})
</script>

<template>
  <article :class="['hn-room-card', { 'is-big': room.isBig }]">
    <img
      :src="room.image"
      :alt="room.name"
      class="hn-room-image"
      loading="lazy"
      @error="$event.target.style.display = 'none'"
    />
    <div class="hn-room-fallback">{{ room.placeholder }}</div>
    <div class="hn-room-overlay">
      <span class="hn-room-badge">{{ room.type }}</span>
      <div>
        <h3 class="hn-room-name">{{ room.name }}</h3>
        <p class="hn-room-count">{{ room.count }}</p>
      </div>
    </div>
  </article>
</template>
