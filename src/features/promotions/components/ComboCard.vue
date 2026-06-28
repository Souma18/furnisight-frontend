<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'
import { PriceFormatter } from '@shared/lib/formatters'
import { comboStockIssue } from '../lib/comboStock'

const props = defineProps({
  combo: { type: Object, required: true },
  buyingId: { type: String, default: '' },
  compact: { type: Boolean, default: false },
})

const emit = defineEmits(['view', 'buy'])
const { t } = useI18n()

function comboPreviewItems(combo = {}) {
  return (combo.items || []).filter((item) => item.imageUrl).slice(0, 4)
}

function comboRoomLabel(combo = {}) {
  return combo.roomLabel || combo.items?.[0]?.categoryName || t('promotions.combo.defaultRoom')
}

function stockIssue(combo = {}) {
  return combo.stockIssue || comboStockIssue(combo)
}
</script>

<template>
  <article
    class="combo-card"
    :class="{ 'combo-card--compact': compact }"
    role="button"
    tabindex="0"
    :aria-label="t('promotions.combo.detailAria', { name: combo.name })"
    @click="emit('view', combo)"
    @keydown.enter.self="emit('view', combo)"
    @keydown.space.self.prevent="emit('view', combo)"
  >
    <div class="combo-media">
      <AppImage
        v-if="combo.imageUrl"
        :src="combo.imageUrl"
        :alt="combo.name"
        loading="lazy"
        @error="$event.target.style.display = 'none'"
       />
      <AppIcon v-else name="armchair" :size="compact ? 42 : 52" />
      <span class="room-tag">{{ comboRoomLabel(combo) }}</span>
      <span class="save-tag">{{ t('promotions.combo.saveAmount', { amount: PriceFormatter.format(combo.savedAmount) }) }}</span>
      <div class="combo-thumbs">
        <span v-for="item in comboPreviewItems(combo)" :key="`${combo.id}-${item.productId}-${item.variantId}`">
          <AppImage :src="item.imageUrl" :alt="item.productName" loading="lazy" />
        </span>
      </div>
    </div>

    <div class="combo-body">
      <p class="combo-count">{{ t('promotions.combo.itemCount', { count: combo.itemCount || combo.items?.length || 0 }) }}</p>
      <h3>{{ combo.name }}</h3>
      <p class="combo-desc">{{ combo.description }}</p>
      <div class="combo-price">
        <span><small>{{ t('promotions.combo.originalPrice') }}</small><del>{{ PriceFormatter.format(combo.originalAmount) }}</del></span>
        <span><small>{{ t('promotions.combo.comboPrice') }}</small><b>{{ PriceFormatter.format(combo.finalAmount) }}</b></span>
      </div>
      <div class="combo-actions">
        <AppButton type="button" class="combo-btn outline" @click.stop="emit('view', combo)">
          <AppIcon name="eye" :size="14" />{{ t('promotions.combo.view') }}
        </AppButton>
        <AppButton
          type="button"
          class="combo-btn dark"
          :class="{ unavailable: stockIssue(combo) }"
          :disabled="buyingId === combo.id || Boolean(stockIssue(combo))"
          @click.stop="emit('buy', combo)"
        >
          <AppIcon name="cart" :size="14" />{{ stockIssue(combo) ? t('promotions.combo.soldOut') : buyingId === combo.id ? t('promotions.combo.preparing') : t('promotions.combo.buy') }}
        </AppButton>
      </div>
    </div>
  </article>
</template>

<style scoped>
.combo-card {
  background: var(--app-surface, #fff);
  border: 1px solid var(--app-border, #e8e0d0);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}
.combo-card:hover {
  transform: translateY(-3px);
  border-color: var(--app-border-strong, #d8c39d);
  box-shadow: var(--app-shadow, 0 14px 34px rgba(18, 32, 46, .1));
}
.combo-card:focus-visible {
  outline: 3px solid rgba(201, 149, 58, .35);
  outline-offset: 3px;
}
.combo-media {
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--app-surface-soft, #e8decc);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  overflow: hidden;
}
.combo-media > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.room-tag,
.save-tag {
  position: absolute;
  left: 12px;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 900;
}
.room-tag {
  top: 12px;
  background: rgba(22, 35, 59, .82);
  color: #fff;
}
.save-tag {
  bottom: 12px;
  background: var(--app-gold, #c9953a);
  color: var(--app-bg-deep, #17233b);
}
.combo-thumbs {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
}
.combo-thumbs span {
  width: 34px;
  height: 34px;
  margin-left: -9px;
  overflow: hidden;
  border-radius: 7px;
  border: 2px solid var(--app-surface, #fff);
  background: var(--app-surface-soft, #f5f0e8);
  display: inline-flex;
}
.combo-thumbs img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.combo-body {
  padding: 16px;
}
.combo-count {
  margin: 0 0 8px;
  color: var(--app-gold, #c9953a);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2.4px;
  text-transform: uppercase;
}
.combo-body h3 {
  margin: 0;
  color: var(--app-heading, #182532);
  font-size: 15.5px;
  line-height: 1.3;
}
.combo-desc {
  margin: 0;
  color: var(--app-text-muted, #7a6a5a);
  font-size: 11.5px;
  line-height: 1.42;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.combo-price {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid var(--app-border, #e8e0d0);
  padding-top: 12px;
  margin-top: 12px;
}
.combo-price small {
  display: block;
  color: var(--app-text-muted, #918474);
  font-size: 11px;
}
.combo-price del {
  color: var(--app-text-muted, #9f9488);
  font-size: 12px;
}
.combo-price b {
  color: var(--app-heading, #16233b);
  font-size: 18px;
}
.combo-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
}
.combo-btn {
  flex: 1;
  min-height: 38px;
  padding: 9px 10px;
  border: 0;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
}
.combo-btn.outline {
  background: var(--app-control-bg, #fff);
  border: 1px solid var(--app-border, #e8e0d0);
  color: var(--app-heading, #1a2332);
}
.combo-btn.dark {
  background: var(--app-navy-soft, #16233b);
  color: var(--app-heading-inverse, #fff);
}
.combo-btn.unavailable {
  background: var(--app-surface-muted, #f1e7db);
  color: var(--app-text-muted, #7b6652);
}
.combo-btn:disabled {
  opacity: .65;
  cursor: wait;
}
.combo-btn.unavailable:disabled {
  cursor: not-allowed;
}

.combo-card--compact .combo-media {
  aspect-ratio: 16 / 10;
}
.combo-card--compact .room-tag,
.combo-card--compact .save-tag {
  left: 10px;
  padding: 5px 8px;
  font-size: 10px;
}
.combo-card--compact .room-tag {
  top: 10px;
}
.combo-card--compact .save-tag {
  bottom: 10px;
}
.combo-card--compact .combo-thumbs {
  right: 10px;
  bottom: 10px;
}
.combo-card--compact .combo-thumbs span {
  width: 29px;
  height: 29px;
  margin-left: -8px;
}
.combo-card--compact .combo-body {
  padding: 10px 12px 12px;
}
.combo-card--compact .combo-count {
  margin-bottom: 4px;
  font-size: 10px;
  letter-spacing: 1.6px;
}
.combo-card--compact .combo-body h3 {
  font-size: 14px;
  line-height: 1.25;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.combo-card--compact .combo-desc {
  margin-top: 4px;
  min-height: 0;
  font-size: 10.5px;
  line-height: 1.35;
  -webkit-line-clamp: 1;
}
.combo-card--compact .combo-price {
  padding-top: 8px;
  margin-top: 8px;
  gap: 8px;
}
.combo-card--compact .combo-price small {
  font-size: 10px;
}
.combo-card--compact .combo-price del {
  font-size: 11px;
}
.combo-card--compact .combo-price b {
  font-size: 15px;
}
.combo-card--compact .combo-actions {
  gap: 8px;
  margin-top: 8px;
}
.combo-card--compact .combo-btn {
  min-height: 32px;
  padding: 6px 8px;
  border-radius: 8px;
  gap: 6px;
  font-size: 11px;
}

@media (max-width: 760px) {
  .combo-actions {
    align-items: stretch;
    flex-direction: column;
  }
  .combo-btn {
    width: 100%;
  }
}

</style>
