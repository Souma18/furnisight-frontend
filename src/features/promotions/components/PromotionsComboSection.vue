<script setup>
import { useI18n } from 'vue-i18n'
import AppButton from '@shared/ui/AppButton.vue'
import ComboCard from './ComboCard.vue'

const props = defineProps({
  combos: { type: Array, default: () => [] },
  comboTotal: { type: Number, default: 0 },
  comboSort: { type: String, default: 'save-desc' },
  buyingComboId: { type: String, default: '' },
  hasMoreCombos: { type: Boolean, default: false },
  loadingMore: { type: Boolean, default: false },
})

const emit = defineEmits(['sort-change', 'view', 'buy', 'load-more'])
const { t } = useI18n()

function changeComboSort(event) {
  emit('sort-change', event)
}
</script>

<template>
  <section id="combo-section" class="promo-section">
    <div class="promo-section-head">
      <div>
        <p>{{ t('promotions.sections.comboKicker') }}</p>
        <h2>{{ t('promotions.sections.comboTitle') }}</h2>
      </div>
      <div class="combo-tools">
        <span class="promo-count">{{ t('promotions.combo.count', { count: comboTotal }) }}</span>
        <select :value="comboSort" @change="changeComboSort">
          <option value="save-desc">{{ t('promotions.sort.saveDesc') }}</option>
          <option value="price-asc">{{ t('promotions.sort.priceAsc') }}</option>
          <option value="price-desc">{{ t('promotions.sort.priceDesc') }}</option>
          <option value="default">{{ t('promotions.sort.newest') }}</option>
        </select>
      </div>
    </div>

    <div class="combo-grid">
      <ComboCard
        v-for="combo in combos"
        :key="combo.id"
        :combo="combo"
        :buying-id="buyingComboId"
        @view="emit('view', combo)"
        @buy="emit('buy', combo)"
      />
    </div>

    <div class="load-more-wrap">
      <AppButton variant="unstyled" size="unstyled" v-if="hasMoreCombos" type="button" class="load-more" :disabled="loadingMore" @click="emit('load-more')">
        {{ loadingMore ? t('common.loading') : t('promotions.combo.loadMore') }}
      </AppButton>
    </div>
  </section>
</template>
