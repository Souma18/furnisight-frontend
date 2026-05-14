<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  breadcrumb: { type: Array, default: () => [] },
  hero: {
    type: Object,
    required: true,
  },
})

function isLink(item) {
  return Boolean(item?.to)
}
</script>

<template>
  <div>
    <div class="ct-breadcrumb">
      <div class="ct-inner">
        <template v-for="(item, idx) in breadcrumb" :key="`${item.label}-${idx}`">
          <RouterLink v-if="isLink(item)" :to="item.to">{{ item.label }}</RouterLink>
          <span :class="{ 'ct-breadcrumb-current': !isLink(item) }">{{ item.label }}</span>
          <span v-if="idx < breadcrumb.length - 1">›</span>
        </template>
      </div>
    </div>

    <section class="ct-hero">
      <div class="ct-hero-bg"></div>
      <div class="ct-orb ct-orb-a"></div>
      <div class="ct-orb ct-orb-b"></div>

      <div class="ct-inner ct-hero-inner">
        <div>
          <div class="ct-h-label">{{ hero.label }}</div>
          <h1 class="ct-h-title">
            {{ hero.titleLine1 }}<br>
            {{ hero.titleLine2Prefix }}<em>{{ hero.titleAccent }}</em>{{ hero.titleLine2Suffix }}
          </h1>
          <p class="ct-h-sub">{{ hero.subtitle }}</p>

          <div class="ct-h-quick">
            <a
              v-for="action in hero.quickActions"
              :key="action.label"
              :href="action.href"
              class="ct-hq-btn"
              :class="{
                'ct-hq-primary': action.variant === 'primary',
                'ct-hq-ghost': action.variant !== 'primary',
              }"
            >
              <AppIcon :name="action.icon" :size="16" />
              {{ action.label }}
            </a>
          </div>
        </div>

        <div class="ct-h-info-cards">
          <div v-for="card in hero.infoCards" :key="card.id" class="ct-h-info-card">
            <div class="ct-hic-icon">
              <AppIcon :name="card.icon" :size="20" />
            </div>
            <div class="ct-hic-body">
              <div class="ct-hic-label">{{ card.label }}</div>
              <div class="ct-hic-value">{{ card.value }}</div>
              <div class="ct-hic-sub" :class="{ 'ct-hic-sub--success': card.accent === 'success' }">
                <span v-if="card.accent === 'success'" class="ct-hic-dot"></span>
                {{ card.sub }}
              </div>
            </div>
            <div class="ct-hic-arrow">→</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
