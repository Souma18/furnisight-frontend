<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'
import { PriceFormatter } from '@shared/lib/formatters'
import ComboCard from '@features/promotions/components/ComboCard.vue'
import { comboStockIssue } from '@features/promotions/lib/comboStock'

defineProps({
  combos: { type: Array, default: () => [] },
  buyingId: { type: String, default: '' },
  addingId: { type: String, default: '' },
})

defineEmits(['buy', 'add'])

const selectedCombo = ref(null)
const { t } = useI18n()

function openCombo(combo) {
  selectedCombo.value = combo
}
</script>

<template>
  <section v-if="combos.length" class="home-combos">
    <header class="combo-heading">
      <div>
        <p class="section-label">{{ t('home.combos.label') }}</p>
        <h2 class="section-title">{{ t('home.combos.titlePrefix') }} <em>{{ t('home.combos.titleEmphasis') }}</em></h2>
      </div>
      <RouterLink class="combo-all-link" to="/khuyen-mai?tab=combo">
        {{ t('home.combos.viewAll') }}
        <AppIcon name="arrowRight" :size="16" />
      </RouterLink>
    </header>

    <div class="combo-grid">
      <ComboCard
        v-for="combo in combos"
        :key="combo.id"
        :combo="combo"
        :buying-id="buyingId"
        compact
        @view="openCombo"
        @buy="$emit('buy', $event)"
      />
    </div>

    <div v-if="selectedCombo" class="modal-overlay" @click.self="selectedCombo = null">
      <div class="modal-box wide" role="dialog" aria-modal="true" :aria-label="t('home.combos.detailAria', { name: selectedCombo.name })">
        <button class="modal-close" type="button" @click="selectedCombo = null">
          <AppIcon name="close" :size="16" />
        </button>
        <h3>{{ selectedCombo.name }}</h3>
        <p>{{ selectedCombo.description }}</p>
        <div class="combo-modal-list">
          <RouterLink
            v-for="item in selectedCombo.items"
            :key="`home-modal-${item.productId}-${item.variantId}`"
            class="combo-modal-row"
            :to="{ name: 'product-detail', params: { id: item.productId } }"
            @click="selectedCombo = null"
          >
            <span class="combo-product-image">
              <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.productName" loading="lazy">
              <AppIcon v-else name="image" :size="18" />
            </span>
            <span class="combo-product-info">
              <strong>{{ item.productName }}</strong>
              <small>x{{ item.quantity || 1 }}</small>
            </span>
            <b>{{ PriceFormatter.format(item.price) }}</b>
            <AppIcon class="combo-product-arrow" name="chevronRight" :size="18" />
          </RouterLink>
        </div>
        <div class="modal-actions">
          <button type="button" class="combo-btn outline" @click="selectedCombo = null">{{ t('home.combos.close') }}</button>
          <button v-if="comboStockIssue(selectedCombo)" type="button" class="combo-btn unavailable" disabled>
            <AppIcon name="cart" :size="14" />{{ t('home.combos.soldOut') }}
          </button>
          <button
            v-else
            type="button"
            class="combo-btn dark"
            :disabled="addingId === selectedCombo.id"
            @click="$emit('add', selectedCombo)"
          >
            <AppIcon name="cart" :size="14" />{{ addingId === selectedCombo.id ? t('home.combos.adding') : t('home.combos.add') }}
          </button>
          <button
            v-if="!comboStockIssue(selectedCombo)"
            type="button"
            class="combo-btn dark"
            :disabled="buyingId === selectedCombo.id"
            @click="$emit('buy', selectedCombo)"
          >
            <AppIcon name="creditCard" :size="14" />{{ buyingId === selectedCombo.id ? t('home.combos.preparing') : t('home.combos.buy') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-combos {
  padding-top: clamp(46px, 6vw, 76px);
  padding-bottom: clamp(46px, 6vw, 76px);
}

.combo-heading {
  align-items: flex-end;
  display: flex;
  gap: 18px;
  justify-content: space-between;
  margin-bottom: 22px;
}

.combo-all-link {
  align-items: center;
  background: var(--app-navy-soft, #12202e);
  border: 1px solid var(--app-navy-soft, #12202e);
  border-radius: 8px;
  color: var(--app-heading-inverse, #fffdf9);
  display: inline-flex;
  font-size: 13px;
  font-weight: 760;
  gap: 7px;
  justify-content: center;
  min-height: 42px;
  padding: 0 15px;
  text-decoration: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
  white-space: nowrap;
}

.combo-all-link:hover,
.combo-all-link:focus-visible {
  background: var(--app-navy, #1c3148);
  border-color: var(--app-border-strong, #1c3148);
  color: var(--app-heading-inverse, #fffdf9);
  transform: translateY(-1px);
}

.combo-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
}

.modal-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.combo-btn {
  align-items: center;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  flex: 1;
  font-size: 11px;
  font-weight: 800;
  gap: 6px;
  justify-content: center;
  min-height: 36px;
  padding: 7px 8px;
  text-decoration: none;
}

.combo-btn.outline {
  background: var(--app-control-bg, #fffdf9);
  border: 1px solid var(--app-border, #e8e0d0);
  color: var(--app-heading, #1a2332);
}

.combo-btn.outline:hover:not(:disabled),
.combo-btn.outline:focus-visible {
  background: var(--app-control-hover, #f5f0e8);
  border-color: var(--app-border-strong, #dcc69f);
  color: var(--app-heading, #1a2332);
}

.combo-btn.dark {
  background: var(--app-navy-soft, #16233b);
  color: var(--app-heading-inverse, #fff);
}

.combo-btn.dark:hover:not(:disabled),
.combo-btn.dark:focus-visible {
  background: var(--app-navy, #233656);
  color: var(--app-heading-inverse, #fff);
}

.combo-btn.unavailable {
  background: var(--app-surface-muted, #f1e7db);
  color: var(--app-text-muted, #7b6652);
}

.combo-btn:disabled {
  cursor: wait;
  opacity: 0.65;
}

.combo-btn.unavailable:disabled {
  cursor: not-allowed;
}

.modal-overlay {
  align-items: center;
  backdrop-filter: blur(4px);
  background: rgba(15, 23, 36, 0.48);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 80;
}

.modal-box {
  background: var(--app-surface, #fffdf9);
  border: 1px solid var(--app-border, rgba(224, 210, 184, 0.82));
  border-radius: 8px;
  box-shadow: var(--app-shadow, 0 24px 80px rgba(18, 32, 46, 0.28));
  color: var(--app-text, #1a2332);
  max-height: 90vh;
  overflow: auto;
  padding: 28px;
  position: relative;
  width: min(560px, 100%);
}

.modal-box.wide {
  width: min(650px, 100%);
}

.modal-box h3 {
  color: var(--app-heading, #182532);
  font-size: 21px;
  margin: 0;
}

.modal-box p {
  color: var(--app-text-muted, #7a6a5a);
  font-size: 13px;
  line-height: 1.5;
  margin: 6px 0 0;
}

.modal-close {
  background: var(--app-control-bg, #f5f0e8);
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--app-heading, #1a2332);
  cursor: pointer;
  display: grid;
  height: 36px;
  place-items: center;
  position: absolute;
  right: 18px;
  top: 18px;
  width: 36px;
}

.combo-modal-list {
  display: grid;
  gap: 10px;
  margin: 18px 0;
}

.combo-modal-row {
  align-items: center;
  background: var(--app-surface-soft, #f5f0e8);
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--app-text, inherit);
  display: grid;
  gap: 12px;
  grid-template-columns: 64px minmax(0, 1fr) auto 18px;
  padding: 10px;
  text-decoration: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.combo-modal-row:hover {
  background: var(--app-control-hover, #fffaf1);
  border-color: var(--app-border-strong, #dcc69f);
  transform: translateX(2px);
}

.combo-product-image {
  align-items: center;
  background: var(--app-surface-muted, #e8e0d5);
  border-radius: 8px;
  display: inline-flex;
  height: 56px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 64px;
}

.combo-product-image img {
  height: 100%;
  inset: 0;
  object-fit: cover;
  position: absolute;
  width: 100%;
}

.combo-product-info {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.combo-product-info strong {
  color: var(--app-heading, #182532);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.combo-product-info small {
  color: var(--app-text-muted, #7a6a5a);
}

.combo-modal-row b {
  color: var(--app-heading, #17233b);
  white-space: nowrap;
}

.combo-product-arrow {
  color: var(--app-gold, #9b8052);
}
@media (max-width: 760px) {
  .combo-heading { align-items: flex-start; flex-direction: column; }
  .modal-actions { align-items: stretch; flex-direction: column; }
  .combo-btn { width: 100%; }
  .combo-modal-row { grid-template-columns: 56px minmax(0, 1fr) 18px; }
  .combo-product-image { width: 56px; height: 52px; }
  .combo-modal-row > b { grid-column: 2; }
  .combo-product-arrow { grid-column: 3; grid-row: 1 / span 2; }
}
</style>
