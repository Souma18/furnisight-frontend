<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  section: {
    type: Object,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['book'])
const { t } = useI18n()
</script>

<template>
  <section id="contact-booking" class="ct-booking-section">
    <div class="ct-inner ct-booking-inner">
      <div class="ct-booking-head ct-fade-up">
        <div class="ct-b-label">{{ section.label }}</div>
        <h2 class="ct-b-title">
          {{ section.titleLine1 }}
          <em v-if="section.titleLine2Prefix || section.titleAccent || section.titleLine2Suffix">
            {{ section.titleLine2Prefix }}{{ section.titleAccent }}
          </em>
          <template v-if="section.titleLine2Suffix">{{ section.titleLine2Suffix }}</template>
        </h2>
        <p class="ct-b-sub">{{ section.subtitle }}</p>
      </div>

      <div class="ct-booking-cards ct-fade-up">
        <article v-for="item in items" :key="item.id" class="ct-booking-card">
          <div v-if="item.popular" class="ct-bc-popular">{{ t('contact.booking.popular') }}</div>
          <div class="ct-bc-icon-wrap">
            <AppIcon :name="item.icon" :size="24" />
          </div>
          <div class="ct-bc-type">{{ item.type }}</div>
          <div class="ct-bc-name">{{ item.name }}</div>
          <div class="ct-bc-desc">{{ item.description }}</div>
          <div class="ct-bc-duration">
            <AppIcon name="clock3" :size="14" />
            {{ item.duration }}
          </div>
          <AppButton type="button" class="ct-bc-btn" @click="emit('book', item)">
            <AppIcon name="calendar" :size="14" />
            {{ item.buttonLabel }}
          </AppButton>
        </article>
      </div>
    </div>
  </section>
</template>
