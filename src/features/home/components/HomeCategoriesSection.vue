<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  categories: { type: Array, default: () => [] },
})

function categoryRoute(category) {
  return {
    name: 'products',
    query: { category: category.slug || category.name },
  }
}

function categoryImage(category) {
  return category.imageUrl || '/home/rooms/livingroom.jpeg'
}
</script>

<template>
  <div v-if="categories.length" class="rooms-bg">
    <div class="rooms-inner">
      <div class="rooms-head">
        <div>
          <div class="section-label">Danh mục sản phẩm</div>
          <h2 class="section-title">Khám phá <em>không gian</em> sống</h2>
        </div>
      </div>

      <div class="rooms-grid">
        <article
          v-for="(category, index) in categories"
          :key="category.id"
          :class="['room-card', { big: index === 0 }]"
        >
          <RouterLink :to="categoryRoute(category)" class="room-link">
            <img
              :src="categoryImage(category)"
              :alt="category.name"
              loading="lazy"
              @error="$event.target.src = '/home/rooms/livingroom.jpeg'"
            >
            <div class="room-overlay">
              <span class="room-badge">Danh mục</span>
              <div class="room-info">
                <div class="room-name">{{ category.name }}</div>
                <div class="room-count">{{ category.count }}</div>
              </div>
            </div>
          </RouterLink>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rooms-bg {
  background: #12202e;
  padding: 80px 0;
}

.rooms-inner {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 60px;
}

.rooms-head .section-title {
  color: #fff;
}

.rooms-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr;
  grid-template-rows: 240px 240px;
  gap: 14px;
}

.room-card {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: #1a2535;
}

.room-card.big {
  grid-row: 1 / 3;
}

.room-link {
  display: block;
  width: 100%;
  height: 100%;
  color: inherit;
  text-decoration: none;
}

.room-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .35s ease;
}

.room-card:hover img {
  transform: scale(1.035);
}

.room-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 22px;
  background: linear-gradient(to top, rgba(0, 0, 0, .75), transparent 55%);
}

.room-badge {
  padding: 4px 10px;
  border-radius: 8px;
  background: #c9922a;
  color: #12202e;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.room-info {
  margin-left: 10px;
}

.room-name {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.room-count {
  color: rgba(255, 255, 255, .65);
  font-size: 12px;
}

@media (max-width: 1100px) {
  .rooms-inner {
    padding: 0 24px;
  }

  .rooms-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: 220px 220px auto;
  }

  .room-card.big {
    grid-row: auto;
  }
}

@media (max-width: 720px) {
  .rooms-bg {
    padding: 56px 0;
  }

  .rooms-grid {
    grid-template-columns: 1fr;
    grid-template-rows: none;
  }

  .room-card {
    min-height: 230px;
  }
}
</style>
