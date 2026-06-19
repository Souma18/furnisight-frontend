<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="newsletter-wrap fade-up">
    <div class="newsletter-left">
      <p class="section-label">{{ t('home.newsletter.label') }}</p>
      <h3 class="newsletter-title">{{ t('home.newsletter.title') }}</h3>
      <p class="newsletter-sub">{{ t('home.newsletter.subtitle') }}</p>
    </div>
    <form class="newsletter-form" @submit.prevent>
      <input class="newsletter-input" type="email" :placeholder="t('home.newsletter.placeholder')" />
      <button class="newsletter-btn" type="submit">{{ t('home.newsletter.submit') }}</button>
    </form>
  </div>
</template>
