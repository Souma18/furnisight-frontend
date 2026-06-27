<script setup>
import AppImage from '@shared/ui/AppImage.vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

defineProps({
  categories: { type: Array, default: () => [] },
})

const { t } = useI18n()

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
          <div class="section-label">{{ t('home.categories.label') }}</div>
          <h2 class="section-title">{{ t('home.categories.titlePrefix') }} <em>{{ t('home.categories.titleEmphasis') }}</em></h2>
        </div>
      </div>

      <div class="rooms-grid">
        <article
          v-for="(category, index) in categories"
          :key="category.id"
          :class="['room-card', { big: index === 0 }]"
        >
          <RouterLink :to="categoryRoute(category)" class="room-link">
            <AppImage
              :src="categoryImage(category)"
              :alt="category.name"
              loading="lazy"
              @error="$event.target.src = '/home/rooms/livingroom.jpeg'"
             />
            <div class="room-overlay">
              <span class="room-badge">{{ t('home.categories.badge') }}</span>
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
  background:
    linear-gradient(180deg, rgba(255, 253, 249, 0.72), rgba(242, 234, 223, 0.78)),
    #faf6f0;
  padding: clamp(46px, 6vw, 76px) 0;
}

.rooms-inner {
  max-width: 1220px;
  margin: 0 auto;
  padding: 0 clamp(20px, 4vw, 48px);
}

.rooms-head .section-title {
  color: #17212d;
}

.rooms-grid {
  display: grid;
  grid-template-columns: 1.25fr 0.9fr 0.9fr;
  grid-template-rows: 210px 210px;
  gap: 12px;
}

.room-card {
  background: #e8dfd2;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
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
  transition:
    filter 0.3s ease,
    transform 0.35s ease;
}

.room-card:hover img {
  filter: saturate(1.04);
  transform: scale(1.035);
}

.room-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  background: linear-gradient(to top, rgba(18, 32, 46, 0.78), transparent 58%);
  padding: 18px;
}

.room-badge {
  border-radius: 8px;
  background: #e5b84a;
  color: #12202e;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  text-transform: uppercase;
}

.room-info {
  margin-left: 10px;
}

.room-name {
  color: #fff;
  font-size: clamp(0.96rem, 1.6vw, 1.16rem);
  font-weight: 760;
}

.room-count {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-top: 3px;
}

@media (max-width: 1100px) {
  .rooms-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: 190px 190px auto;
  }

  .room-card.big {
    grid-row: auto;
  }
}

@media (max-width: 720px) {
  .rooms-bg {
    padding: 44px 0;
  }

  .rooms-grid {
    grid-template-columns: 1fr;
    grid-template-rows: none;
  }

  .room-card {
    min-height: 190px;
  }
}
</style>
