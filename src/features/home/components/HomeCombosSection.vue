<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@shared/ui/AppIcon.vue'
import { PriceFormatter } from '@shared/lib/formatters'

defineProps({
  combos: { type: Array, default: () => [] },
  buyingId: { type: String, default: '' },
  addingId: { type: String, default: '' },
})

defineEmits(['buy', 'add'])

const selectedCombo = ref(null)

function thumbIcon(item = {}) {
  const text = `${item.categoryName || ''} ${item.productName || ''}`.toLowerCase()
  if (text.includes('giường') || text.includes('bed')) return 'bed'
  if (text.includes('sofa') || text.includes('ghế')) return 'sofa'
  if (text.includes('bàn') || text.includes('table')) return 'table'
  if (text.includes('tủ') || text.includes('cabinet')) return 'archive'
  return 'box'
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
      <article v-for="combo in combos" :key="combo.id" class="combo-card">
        <div class="combo-media">
          <img
            v-if="combo.imageUrl"
            :src="combo.imageUrl"
            :alt="combo.name"
            loading="lazy"
          >
          <AppIcon v-else name="armchair" :size="52" />
          <span class="room-tag">{{ combo.items?.[0]?.categoryName || 'Nội thất' }}</span>
          <span class="save-tag">Tiết kiệm {{ PriceFormatter.format(combo.savedAmount) }}</span>
          <div class="combo-thumbs">
            <span v-for="item in combo.items?.slice(0, 4)" :key="`${combo.id}-${item.productId}-${item.variantId}`">
              <AppIcon :name="thumbIcon(item)" :size="15" />
            </span>
          </div>
        </div>

        <div class="combo-body">
          <p class="combo-count">{{ combo.itemCount || combo.items?.length || 0 }} sản phẩm</p>
          <h3>{{ combo.name }}</h3>
          <p class="combo-desc">{{ combo.description }}</p>
          <div class="combo-price">
            <span><small>Giá gốc</small><del>{{ PriceFormatter.format(combo.originalAmount) }}</del></span>
            <span><small>Giá combo</small><b>{{ PriceFormatter.format(combo.finalAmount) }}</b></span>
          </div>
          <div class="combo-actions">
            <button type="button" class="combo-btn outline" @click="selectedCombo = combo">
              <AppIcon name="eye" :size="14" />Xem combo
            </button>
            <button
              type="button"
              class="combo-btn dark"
              :disabled="buyingId === combo.id"
              @click="$emit('buy', combo)"
            >
              <AppIcon name="cart" :size="14" />{{ buyingId === combo.id ? 'Đang chuẩn bị' : 'Mua combo' }}
            </button>
          </div>
        </div>
      </article>
    </div>

    <div v-if="selectedCombo" class="modal-overlay" @click.self="selectedCombo = null">
      <div class="modal-box wide">
        <button class="modal-close" type="button" @click="selectedCombo = null">
          <AppIcon name="close" :size="16" />
        </button>
        <h3>{{ selectedCombo.name }}</h3>
        <p>{{ selectedCombo.description }}</p>
        <div class="combo-modal-list">
          <div v-for="item in selectedCombo.items" :key="`home-modal-${item.productId}-${item.variantId}`" class="combo-modal-row">
            <span><AppIcon :name="thumbIcon(item)" :size="18" /></span>
            <strong>{{ item.productName }}</strong>
            <small>x{{ item.quantity || 1 }}</small>
            <b>{{ PriceFormatter.format(item.price) }}</b>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="combo-btn outline" @click="selectedCombo = null">Đóng</button>
          <button
            type="button"
            class="combo-btn dark"
            :disabled="addingId === selectedCombo.id"
            @click="$emit('add', selectedCombo)"
          >
            <AppIcon name="cart" :size="14" />{{ addingId === selectedCombo.id ? 'Đang thêm' : 'Thêm combo' }}
          </button>
          <button
            type="button"
            class="combo-btn dark"
            :disabled="buyingId === selectedCombo.id"
            @click="$emit('buy', selectedCombo)"
          >
            <AppIcon name="cart" :size="14" />{{ buyingId === selectedCombo.id ? 'Đang chuẩn bị' : 'Mua combo' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-combos { padding-top: 72px; padding-bottom: 72px; }
.combo-heading { margin-bottom: 30px; display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; }
.combo-all-link { min-height: 40px; padding: 9px 15px; border-radius: 7px; background: #12202e; color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-size: 13px; font-weight: 700; text-decoration: none; white-space: nowrap; }
.combo-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.combo-card { background: #fff; border: 1px solid #e8e0d0; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 28px rgba(18, 32, 46, .08); }
.combo-media { position: relative; aspect-ratio: 16 / 10; background: #e8decc; display: flex; align-items: center; justify-content: center; color: #fff; overflow: hidden; }
.combo-media img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s ease; }
.combo-card:hover .combo-media img { transform: scale(1.025); }
.room-tag, .save-tag { position: absolute; top: 10px; padding: 5px 8px; border-radius: 999px; font-size: 10px; font-weight: 800; }
.room-tag { left: 10px; background: rgba(255,255,255,.92); color: #17233b; }
.save-tag { right: 10px; background: #d99a28; color: #17233b; }
.combo-thumbs { position: absolute; right: 10px; bottom: 10px; display: flex; }
.combo-thumbs span { width: 27px; height: 27px; margin-left: -8px; border-radius: 7px; border: 2px solid #fff; background: #fff; color: #17233b; display: inline-flex; align-items: center; justify-content: center; }
.combo-body { padding: 14px; }
.combo-count { margin: 0 0 7px; color: #c9953a; font-size: 10.5px; font-weight: 800; letter-spacing: 1.8px; text-transform: uppercase; }
.combo-body h3 { margin: 0; color: #182532; font-size: 17px; line-height: 1.32; }
.combo-desc { min-height: 38px; margin: 8px 0 0; color: #7a6a5a; font-size: 12.5px; line-height: 1.5; display: -webkit-box; overflow: hidden; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.combo-price { display: flex; justify-content: space-between; gap: 10px; border-top: 1px solid #e8e0d0; padding-top: 11px; margin-top: 11px; }
.combo-price small { display: block; color: #918474; font-size: 11px; }
.combo-price del { color: #9f9488; font-size: 12px; }
.combo-price b { color: #16233b; font-size: 16px; }
.combo-actions, .modal-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 14px; }
.combo-btn { flex: 1; min-height: 36px; padding: 8px 9px; border: 0; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-size: 11.5px; font-weight: 800; cursor: pointer; text-decoration: none; }
.combo-btn.outline { background: #fff; border: 1px solid #e8e0d0; color: #1a2332; }
.combo-btn.dark { background: #16233b; color: #fff; }
.combo-btn:disabled { opacity: .65; cursor: wait; }
.modal-overlay { position: fixed; inset: 0; z-index: 80; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(15, 23, 36, .48); backdrop-filter: blur(4px); }
.modal-box { width: min(560px, 100%); max-height: 90vh; overflow: auto; position: relative; background: #fff; border-radius: 18px; padding: 28px; box-shadow: 0 24px 80px rgba(18, 32, 46, .28); }
.modal-box.wide { width: min(650px, 100%); }
.modal-box h3 { margin: 0; font-size: 21px; color: #182532; }
.modal-box p { margin: 6px 0 0; color: #7a6a5a; font-size: 13px; line-height: 1.5; }
.modal-close { position: absolute; top: 18px; right: 18px; width: 36px; height: 36px; border: 0; border-radius: 50%; background: #f5f0e8; color: #1a2332; display: grid; place-items: center; cursor: pointer; }
.combo-modal-list { display: grid; gap: 10px; margin: 18px 0; }
.combo-modal-row { display: grid; grid-template-columns: 38px 1fr auto auto; align-items: center; gap: 10px; background: #f5f0e8; border-radius: 10px; padding: 10px; }
.combo-modal-row span { width: 32px; height: 32px; background: #fff; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; }
.combo-modal-row strong { color: #182532; }
.combo-modal-row b { color: #17233b; white-space: nowrap; }
@media (max-width: 760px) {
  .combo-heading { align-items: flex-start; flex-direction: column; }
  .combo-grid { grid-template-columns: 1fr; }
  .combo-actions, .modal-actions { align-items: stretch; flex-direction: column; }
  .combo-btn { width: 100%; }
  .combo-modal-row { grid-template-columns: 34px 1fr; }
  .combo-modal-row small, .combo-modal-row b { grid-column: 2; }
}
@media (min-width: 761px) and (max-width: 1080px) {
  .combo-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
