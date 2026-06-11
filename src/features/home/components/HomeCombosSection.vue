<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
import { PriceFormatter } from '@shared/lib/formatters'

defineProps({
  combos: { type: Array, default: () => [] },
  buyingId: { type: String, default: '' },
})

defineEmits(['buy'])
</script>

<template>
  <section v-if="combos.length" class="home-combos fade-up">
    <header class="combo-heading">
      <div>
        <p class="section-label">Combo nội thất</p>
        <h2 class="section-title">Phối trọn không gian, <em>tiết kiệm hơn</em></h2>
      </div>
    </header>

    <div class="combo-grid">
      <article v-for="combo in combos" :key="combo.id" class="combo-card">
        <div class="combo-media">
          <img :src="combo.imageUrl" :alt="combo.name" loading="lazy">
          <span class="combo-saving">Tiết kiệm {{ PriceFormatter.format(combo.savedAmount) }}</span>
        </div>
        <div class="combo-body">
          <div>
            <p class="combo-count">{{ combo.itemCount || combo.items?.length || 0 }} sản phẩm</p>
            <h3>{{ combo.name }}</h3>
            <p class="combo-description">{{ combo.description }}</p>
          </div>
          <div class="combo-footer">
            <div>
              <span>Giá combo</span>
              <strong>{{ PriceFormatter.format(combo.finalAmount) }}</strong>
            </div>
            <button
              type="button"
              :disabled="buyingId === combo.id"
              @click="$emit('buy', combo)"
            >
              <AppIcon name="cart" :size="17" />
              {{ buyingId === combo.id ? 'Đang chuẩn bị' : 'Mua combo' }}
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.home-combos { padding-top: 72px; padding-bottom: 72px; }
.combo-heading { margin-bottom: 30px; }
.combo-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; }
.combo-card { overflow: hidden; border: 1px solid #e4ddd2; border-radius: 8px; background: #fff; box-shadow: 0 10px 28px rgba(18, 32, 46, .08); }
.combo-media { position: relative; aspect-ratio: 16 / 9; overflow: hidden; background: #eee8de; }
.combo-media img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s ease; }
.combo-card:hover .combo-media img { transform: scale(1.025); }
.combo-saving { position: absolute; left: 14px; bottom: 14px; padding: 6px 10px; border-radius: 6px; background: #c9922a; color: #12202e; font-size: 11px; font-weight: 700; }
.combo-body { min-height: 210px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; gap: 20px; }
.combo-count { margin: 0 0 6px; color: #c9922a; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.combo-body h3 { margin: 0; color: #182532; font-size: 21px; line-height: 1.35; }
.combo-description { margin: 8px 0 0; color: #6f6b65; font-size: 13px; line-height: 1.6; display: -webkit-box; overflow: hidden; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.combo-footer { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-top: 1px solid #eee7dc; padding-top: 16px; }
.combo-footer div { display: grid; gap: 2px; }
.combo-footer span { color: #817b72; font-size: 11px; }
.combo-footer strong { color: #c9922a; font-size: 19px; }
.combo-footer button { min-height: 40px; padding: 9px 15px; border: 0; border-radius: 7px; background: #12202e; color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-weight: 700; cursor: pointer; }
.combo-footer button:disabled { opacity: .6; cursor: wait; }
@media (max-width: 760px) {
  .combo-grid { grid-template-columns: 1fr; }
  .combo-footer { align-items: stretch; flex-direction: column; }
  .combo-footer button { width: 100%; }
}
</style>
