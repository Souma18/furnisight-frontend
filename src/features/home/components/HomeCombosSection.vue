<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
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

function openCombo(combo) {
  selectedCombo.value = combo
}
</script>

<template>
  <section v-if="combos.length" class="home-combos">
    <header class="combo-heading">
      <div>
        <p class="section-label">Combo nội thất</p>
        <h2 class="section-title">Phối trọn không gian, <em>tiết kiệm hơn</em></h2>
      </div>
      <RouterLink class="combo-all-link" to="/khuyen-mai?tab=combo">
        Xem tất cả
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
      <div class="modal-box wide" role="dialog" aria-modal="true" :aria-label="`Chi tiết ${selectedCombo.name}`">
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
          <button type="button" class="combo-btn outline" @click="selectedCombo = null">Đóng</button>
          <button v-if="comboStockIssue(selectedCombo)" type="button" class="combo-btn unavailable" disabled>
            <AppIcon name="cart" :size="14" />Hết hàng
          </button>
          <button
            v-else
            type="button"
            class="combo-btn dark"
            :disabled="addingId === selectedCombo.id"
            @click="$emit('add', selectedCombo)"
          >
            <AppIcon name="cart" :size="14" />{{ addingId === selectedCombo.id ? 'Đang thêm' : 'Thêm combo' }}
          </button>
          <button
            v-if="!comboStockIssue(selectedCombo)"
            type="button"
            class="combo-btn dark"
            :disabled="buyingId === selectedCombo.id"
            @click="$emit('buy', selectedCombo)"
          >
            <AppIcon name="creditCard" :size="14" />{{ buyingId === selectedCombo.id ? 'Đang chuẩn bị' : 'Mua combo' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-combos { padding-top: 64px; padding-bottom: 64px; }
.combo-heading { margin-bottom: 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; }
.combo-all-link { min-height: 40px; padding: 9px 15px; border-radius: 7px; background: #12202e; color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-size: 13px; font-weight: 700; text-decoration: none; white-space: nowrap; }
.combo-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.modal-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.combo-btn { flex: 1; min-height: 34px; padding: 7px 8px; border: 0; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 11px; font-weight: 800; cursor: pointer; text-decoration: none; }
.combo-btn.outline { background: #fff; border: 1px solid #e8e0d0; color: #1a2332; }
.combo-btn.dark { background: #16233b; color: #fff; }
.combo-btn.unavailable { background: #f1e7db; color: #7b6652; }
.combo-btn:disabled { opacity: .65; cursor: wait; }
.combo-btn.unavailable:disabled { cursor: not-allowed; }
.modal-overlay { position: fixed; inset: 0; z-index: 80; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(15, 23, 36, .48); backdrop-filter: blur(4px); }
.modal-box { width: min(560px, 100%); max-height: 90vh; overflow: auto; position: relative; background: #fff; border-radius: 18px; padding: 28px; box-shadow: 0 24px 80px rgba(18, 32, 46, .28); }
.modal-box.wide { width: min(650px, 100%); }
.modal-box h3 { margin: 0; font-size: 21px; color: #182532; }
.modal-box p { margin: 6px 0 0; color: #7a6a5a; font-size: 13px; line-height: 1.5; }
.modal-close { position: absolute; top: 18px; right: 18px; width: 36px; height: 36px; border: 0; border-radius: 50%; background: #f5f0e8; color: #1a2332; display: grid; place-items: center; cursor: pointer; }
.combo-modal-list { display: grid; gap: 10px; margin: 18px 0; }
.combo-modal-row { display: grid; grid-template-columns: 64px minmax(0, 1fr) auto 18px; align-items: center; gap: 12px; background: #f5f0e8; border: 1px solid transparent; border-radius: 12px; padding: 10px; color: inherit; text-decoration: none; transition: background .2s ease, border-color .2s ease, transform .2s ease; }
.combo-modal-row:hover { background: #fffaf1; border-color: #dcc69f; transform: translateX(2px); }
.combo-product-image { position: relative; width: 64px; height: 56px; overflow: hidden; background: #e8e0d5; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; }
.combo-product-image img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.combo-product-info { min-width: 0; display: grid; gap: 4px; }
.combo-product-info strong { overflow: hidden; color: #182532; text-overflow: ellipsis; white-space: nowrap; }
.combo-product-info small { color: #7a6a5a; }
.combo-modal-row b { color: #17233b; white-space: nowrap; }
.combo-product-arrow { color: #9b8052; }
@media (max-width: 760px) {
  .combo-heading { align-items: flex-start; flex-direction: column; }
  .combo-grid { grid-template-columns: 1fr; }
  .modal-actions { align-items: stretch; flex-direction: column; }
  .combo-btn { width: 100%; }
  .combo-modal-row { grid-template-columns: 56px minmax(0, 1fr) 18px; }
  .combo-product-image { width: 56px; height: 52px; }
  .combo-modal-row > b { grid-column: 2; }
  .combo-product-arrow { grid-column: 3; grid-row: 1 / span 2; }
}
@media (min-width: 761px) and (max-width: 1023px) {
  .combo-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1024px) and (max-width: 1279px) {
  .combo-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
