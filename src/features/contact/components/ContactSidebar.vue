<script setup>
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  sidebar: {
    type: Object,
    required: true,
  },
})

const { t } = useI18n()
</script>

<template>
  <aside class="ct-sidebar">
    <div class="ct-consultant-card ct-fade-up">
      <div class="ct-cc-header">
        <div class="ct-cc-avatar">
          <AppIcon :name="sidebar.consultant.avatarIcon" :size="24" />
        </div>
        <div>
          <div class="ct-cc-name">{{ sidebar.consultant.name }}</div>
          <div class="ct-cc-role">{{ sidebar.consultant.role }}</div>
          <div class="ct-cc-online">
            <span class="ct-cc-online-dot"></span>
            {{ sidebar.consultant.onlineText }}
          </div>
        </div>
      </div>

      <div class="ct-cc-body">
        <div class="ct-cc-desc">{{ sidebar.consultant.description }}</div>
        <div class="ct-cc-actions">
          <a
            v-for="action in sidebar.consultant.actions"
            :key="action.id"
            :href="action.href"
            class="ct-cc-btn"
            :class="{
              'ct-cc-btn-primary': !action.ghost,
              'ct-cc-btn-ghost': action.ghost,
            }"
          >
            <AppIcon :name="action.icon" :size="16" />
            {{ action.label }}
          </a>
        </div>
      </div>
    </div>

    <div class="ct-info-block ct-fade-up">
      <div class="ct-ib-title">
        <span class="ct-ib-title-icon">
          <AppIcon name="mapPin" :size="16" />
        </span>
        {{ t('contact.sidebar.contactInfo') }}
      </div>
      <div class="ct-info-rows">
        <div v-for="row in sidebar.contactInfo" :key="row.id" class="ct-info-row">
          <div class="ct-ir-icon">
            <AppIcon :name="row.icon" :size="16" />
          </div>
          <div class="ct-ir-body">
            <div class="ct-ir-label">{{ row.label }}</div>
            <div class="ct-ir-value">
              <a v-if="row.href" :href="row.href">{{ row.value }}</a>
              <template v-else>{{ row.value }}</template>
            </div>
          </div>
        </div>
      </div>

      <div class="ct-social-wrap">
        <div class="ct-ir-label ct-social-label">{{ t('contact.sidebar.social') }}</div>
        <div class="ct-social-row">
          <a
            v-for="social in sidebar.socials"
            :key="social.id"
            class="ct-soc-btn"
            :href="social.href"
            :title="social.label"
            :aria-label="social.label"
          >
            <AppIcon :name="social.icon" :size="18" />
          </a>
        </div>
      </div>
    </div>

    <div class="ct-info-block ct-fade-up">
      <div class="ct-ib-title">
        <span class="ct-ib-title-icon">
          <AppIcon name="clock3" :size="16" />
        </span>
        {{ t('contact.sidebar.hours') }}
      </div>
      <div class="ct-hours-grid">
        <div v-for="row in sidebar.hours" :key="row.id" class="ct-hours-row">
          <span class="ct-hr-day">{{ row.day }}</span>
          <span class="ct-hr-time" :class="{ 'ct-hr-time--success': row.accent === 'success' }">
            {{ row.time }}
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>
