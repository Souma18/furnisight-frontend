<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { formatCurrency } from '../lib/voucherPresentation'
import { comboStockIssue } from '../lib/comboStock'

const props = defineProps({
  combo: { type: Object, default: null },
  addingId: { type: String, default: '' },
  buyingId: { type: String, default: '' },
})

const emit = defineEmits(['close', 'add-cart', 'buy-now'])
const { t } = useI18n()

const show = computed(() => !!props.combo)
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-box wide" role="dialog" aria-modal="true" :aria-label="t('promotions.combo.detailAria', { name: combo.name })">
      <AppButton class="modal-close" type="button" @click="emit('close')">
        <AppIcon name="close" :size="16" />
      </AppButton>
      <h3>{{ combo.name }}</h3>
      <p>{{ combo.description }}</p>
      <div class="combo-modal-list">
        <RouterLink
          v-for="item in combo.items"
          :key="`modal-${item.productId}-${item.variantId}`"
          class="combo-modal-row"
          :to="{ name: 'product-detail', params: { id: item.productId } }"
          @click="emit('close')"
        >
          <span class="combo-product-image">
            <AppImage
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.productName"
              loading="lazy"
              @error="$event.target.style.display = 'none'"
             />
          </span>
          <span class="combo-product-info">
            <strong>{{ item.productName }}</strong>
            <small>{{ item.categoryName || t('promotions.combo.defaultProduct') }} · x{{ item.quantity || 1 }}</small>
          </span>
          <b>{{ formatCurrency(item.price) }}</b>
          <AppIcon class="combo-product-arrow" name="chevronRight" :size="18" />
        </RouterLink>
      </div>
      <div class="modal-actions">
        <AppButton type="button" class="combo-btn outline" @click="emit('close')">{{ t('common.close') }}</AppButton>
        <AppButton v-if="comboStockIssue(combo)" type="button" class="combo-btn unavailable" disabled>
          <AppIcon name="cart" :size="14" />{{ t('promotions.combo.soldOut') }}
        </AppButton>
        <AppButton v-else type="button" class="combo-btn dark" :disabled="addingId === combo.id" @click="emit('add-cart', combo)">
          <AppIcon name="cart" :size="14" />{{ addingId === combo.id ? t('promotions.combo.adding') : t('promotions.combo.add') }}
        </AppButton>
        <AppButton v-if="!comboStockIssue(combo)" type="button" class="combo-btn dark" :disabled="buyingId === combo.id" @click="emit('buy-now', combo)">
          <AppIcon name="creditCard" :size="14" />{{ buyingId === combo.id ? t('promotions.combo.preparing') : t('promotions.combo.buy') }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
