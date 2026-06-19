<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'

const { t } = useI18n()
const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer-inner">
      <div class="app-footer-top">
        <div class="brand-block">
          <a href="/" class="brand-link">
            <span class="brand-icon" aria-hidden="true">
              <img src="/brand/furnisight-logo-mark.png" alt="" />
            </span>
            <span class="brand">FurniSight</span>
          </a>
          <p class="desc">
            {{ t('footer.description') }}
          </p>
          <div class="socials">
            <a href="#" aria-label="Facebook"><AppIcon name="facebook" :size="14" /></a>
            <a href="#" aria-label="Instagram"><AppIcon name="instagram" :size="14" /></a>
            <a href="#" aria-label="YouTube"><AppIcon name="youtube" :size="14" /></a>
            <a href="#" aria-label="Map"><AppIcon name="mapPin" :size="14" /></a>
          </div>
        </div>
        <div class="col">
          <h4>{{ t('footer.products') }}</h4>
          <a href="/products">{{ t('footer.officeChair') }}</a>
          <a href="/products">{{ t('footer.bed') }}</a>
          <a href="/products">{{ t('footer.sofa') }}</a>
          <a href="/products">{{ t('footer.diningTable') }}</a>
          <a href="/products">{{ t('footer.cabinet') }}</a>
          <a href="/products">{{ t('footer.decorLight') }}</a>
        </div>
        <div class="col">
          <h4>{{ t('footer.features') }}</h4>
          <a href="/room3d">{{ t('nav.room3d') }}</a>
          <a href="/room3d">{{ t('footer.aiSuggest') }}</a>
        </div>
        <div class="col">
          <h4>{{ t('footer.support') }}</h4>
          <a href="/contact">{{ t('nav.contact') }}</a>
        </div>
      </div>
      <div class="app-footer-bottom">
        <span>{{ t('footer.copyright', { year: currentYear }) }}</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: var(--app-bg-deep);
  color: rgba(255, 255, 255, 0.72);
  padding: 2.5rem 1.25rem 1.25rem;
}

.app-footer-inner {
  max-width: 1300px;
  margin: 0 auto;
}

.app-footer-top {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 2rem;
  padding-bottom: 1.4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
}

.brand-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--app-surface);
  overflow: hidden;
  padding: 2px;
}

.brand-icon img {
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;
}

.brand {
  margin: 0;
  font-size: 1.1rem;
  color: var(--app-heading-inverse);
  font-weight: 700;
  letter-spacing: 0.04em;
}

.desc {
  margin: 0;
  max-width: 320px;
  line-height: 1.7;
  font-size: 0.88rem;
}

.socials {
  margin-top: 1rem;
  display: inline-flex;
  gap: 0.5rem;
}

.socials a {
  width: 2rem;
  height: 2rem;
  border-radius: 0.45rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.68);
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.78rem;
}

.socials a:hover {
  background: var(--app-gold);
  color: var(--brand-navy-900);
}

.col {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.col h4 {
  margin: 0 0 0.45rem;
  color: #fff;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.col a {
  color: rgba(255, 255, 255, 0.62);
  text-decoration: none;
  font-size: 0.88rem;
}

.col a:hover {
  color: var(--brand-gold-400);
}

.app-footer-bottom {
  padding-top: 0.9rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}


@media (max-width: 900px) {
  .app-footer-top {
    grid-template-columns: 1fr;
  }

  .app-footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
