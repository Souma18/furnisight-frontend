<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import { useAuthStore } from '@features/auth/store/authStore'
import { useCartStore } from '@features/cart/store/cartStore'
import { isPurchasableLine } from '@features/cart/lib/stockGuards'
import { useComboCart } from '../composables/useComboCart'
import { usePromotionToast } from '../composables/usePromotionToast'
import { usePromotionsCombos } from '../composables/usePromotionsCombos'
import { comboStockIssue } from '../lib/comboStock'
import { usePromotionsVouchers } from '../composables/usePromotionsVouchers'
import { useVoucherRailDrag } from '../composables/useVoucherRailDrag'
import {
  conditionText,
  discountLabel,
  formatCurrency,
  formatDate,
  isExpiring,
  isShippingVoucher,
} from '../lib/voucherPresentation'
import AppIcon from '@shared/ui/AppIcon.vue'
import ComboCard from '../components/ComboCard.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const { isAuthenticated } = storeToRefs(authStore)
const { items: cartItems } = storeToRefs(cartStore)

const activeFilter = ref(route.query.tab === 'combo' ? 'combo' : 'all')
const selectedVoucher = ref(null)
const selectedCombo = ref(null)
const voucherRail = ref(null)
const mineVoucherTypeFilter = ref('all')
const mineVoucherTimeFilter = ref('all')
const { toast, showToast } = usePromotionToast()
const {
  startVoucherDrag,
  moveVoucherDrag,
  stopVoucherDrag,
} = useVoucherRailDrag(voucherRail)
const {
  addingComboId,
  buyingComboId,
  addComboToCart,
  buyCombo,
  enrichComboItemImage,
} = useComboCart({
  authRequired: true,
  onAuthRequired: openAuthModal,
  onMessage(message, error, combo) {
    if (!message) return
    if (error) {
      showToast('Không thể xử lý combo', message, 'alert')
      return
    }
    showToast(message, combo?.name || '', 'cart')
  },
})

const {
  claimingCode,
  filteredVouchers,
  savedVouchers,
  filteredSavedVouchers,
  activeVoucherCount,
  loadVouchers,
  claimVoucher,
} = usePromotionsVouchers({
  activeFilter,
  isAuthenticated,
  mineVoucherTypeFilter,
  mineVoucherTimeFilter,
  onAuthRequired: openAuthModal,
  showToast,
})

const {
  combos,
  comboTotal,
  comboSort,
  loadingMore,
  hasMoreCombos,
  loadCombos,
  loadMoreCombos,
  changeComboSort,
} = usePromotionsCombos({
  enrichComboItemImage,
  showToast,
})

const filterTabs = [
  { key: 'all', label: 'Tất cả', icon: 'list' },
  { key: 'voucher', label: 'Voucher', icon: 'badgePercent' },
  { key: 'combo', label: 'Combo nội thất', icon: 'armchair' },
  { key: 'freeship', label: 'Freeship', icon: 'truck' },
  { key: 'expiring', label: 'Sắp hết hạn', icon: 'clock3' },
  { key: 'saved', label: 'Đã lưu', icon: 'wallet' },
]

const voucherTypeOptions = [
  { value: 'all', label: 'Tất cả loại' },
  { value: 'shop', label: 'Voucher đơn hàng' },
  { value: 'ship', label: 'Voucher vận chuyển' },
  { value: 'PUBLIC', label: 'Công khai' },
  { value: 'PERSONAL', label: 'Cá nhân' },
  { value: 'MARKETING', label: 'Marketing' },
]

const voucherTimeOptions = [
  { value: 'all', label: 'Tất cả thời gian' },
  { value: 'active', label: 'Đang dùng được' },
  { value: 'expiring', label: 'Sắp hết hạn' },
  { value: 'upcoming', label: 'Sắp diễn ra' },
  { value: 'expired', label: 'Đã hết hạn' },
]

const showVoucherSection = computed(() => ['all', 'voucher', 'freeship', 'expiring', 'saved'].includes(activeFilter.value))
const showComboSection = computed(() => activeFilter.value === 'all' || activeFilter.value === 'combo')

onMounted(async () => {
  await Promise.allSettled([loadVouchers(), loadCombos(true)])
  cartStore.ensureHydrated().catch(() => null)
})

async function useVoucherNow() {
  await cartStore.ensureHydrated({ force: true }).catch(() => null)
  const hasPurchasableItem = cartItems.value.some(isPurchasableLine)
  await router.push(hasPurchasableItem ? '/checkout' : '/products')
}

function openCombo(combo) {
  selectedCombo.value = combo
}
</script>

<template>
  <main class="promo-page">
    <section class="promo-hero">
      <div class="promo-hero-inner">
        <p class="promo-eyebrow">Khuyến mãi nội thất tháng này</p>
        <h1>Nhận voucher, sắm combo <em>tiết kiệm hơn</em></h1>
        <p class="promo-desc">
          Lưu voucher vào tài khoản để dùng khi thanh toán, hoặc chọn combo nội thất được phối sẵn theo phòng.
        </p>
        <div class="promo-actions">
          <a class="promo-btn primary" href="#voucher-section"><AppIcon name="badgePercent" :size="16" />Nhận voucher ngay</a>
          <a class="promo-btn ghost" href="#combo-section"><AppIcon name="armchair" :size="16" />Xem combo nội thất</a>
        </div>
        <div class="promo-stats">
          <span><b>{{ activeVoucherCount }}</b> voucher đang mở</span>
          <span><b>{{ comboTotal }}</b> combo ưu đãi</span>
          <span><b>{{ formatCurrency(combos[0]?.savedAmount || 0) }}</b> tiết kiệm nổi bật</span>
        </div>
      </div>
    </section>

    <div class="promo-tabs">
      <button
        v-for="tab in filterTabs"
        :key="tab.key"
        type="button"
        :class="['promo-tab', { active: activeFilter === tab.key }]"
        @click="activeFilter = tab.key"
      >
        <AppIcon :name="tab.icon" :size="15" />{{ tab.label }}
      </button>
    </div>

    <section v-if="showVoucherSection" id="voucher-section" class="promo-section">
      <div class="promo-section-head">
        <div>
          <p>Ưu đãi dành cho bạn</p>
          <h2>Voucher nổi bật</h2>
        </div>
        <span class="promo-count">{{ filteredVouchers.length }} voucher</span>
      </div>

      <div
        v-if="filteredVouchers.length"
        ref="voucherRail"
        class="voucher-rail"
        @pointerdown="startVoucherDrag"
        @pointermove="moveVoucherDrag"
        @pointerup="stopVoucherDrag"
        @pointercancel="stopVoucherDrag"
        @pointerleave="stopVoucherDrag"
      >
        <article v-for="voucher in filteredVouchers" :key="voucher.id" class="voucher-card" :class="{ disabled: voucher.used || !voucher.active }">
          <div class="voucher-stub">
            <span>{{ isShippingVoucher(voucher) ? 'Freeship' : 'Voucher' }}</span>
            <strong>{{ voucher.code }}</strong>
          </div>
          <div class="voucher-body">
            <button type="button" class="info-btn" @click="selectedVoucher = voucher" aria-label="Chi tiết voucher">
              <AppIcon name="info" :size="14" />
            </button>
            <h3>{{ discountLabel(voucher) }}</h3>
            <p>{{ voucher.description || conditionText(voucher) }}</p>
            <div class="voucher-meta">
              <span><AppIcon name="creditCard" :size="13" />{{ conditionText(voucher) }}</span>
              <span :class="{ danger: isExpiring(voucher.endDate) }"><AppIcon name="calendar" :size="13" />Hết hạn {{ formatDate(voucher.endDate) }}</span>
            </div>
            <div class="voucher-footer">
              <span class="status" :class="{ saved: voucher.saved, used: voucher.used }">
                {{ voucher.used ? 'Đã dùng' : voucher.saved ? 'Đã lưu' : 'Chưa nhận' }}
              </span>
              <button
                v-if="!voucher.saved && !voucher.used"
                type="button"
                class="claim-btn"
                :disabled="claimingCode === voucher.code"
                @click="claimVoucher(voucher)"
              >
                <AppIcon name="download" :size="14" />Nhận
              </button>
              <button v-else-if="!voucher.used" type="button" class="claim-btn outline" @click="useVoucherNow">
                <AppIcon name="cart" :size="14" />Dùng ngay
              </button>
              <button v-else type="button" class="claim-btn muted" disabled>Đã dùng</button>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="empty-state">Chưa có voucher phù hợp với bộ lọc này.</div>
    </section>

    <section v-if="showComboSection" id="combo-section" class="promo-section">
      <div class="promo-section-head">
        <div>
          <p>Phối sẵn, tiết kiệm hơn</p>
          <h2>Combo nội thất đang ưu đãi</h2>
        </div>
        <div class="combo-tools">
          <span class="promo-count">{{ comboTotal }} combo</span>
          <select :value="comboSort" @change="changeComboSort">
            <option value="save-desc">Tiết kiệm nhiều nhất</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="default">Mới nhất</option>
          </select>
        </div>
      </div>

      <div class="combo-grid">
        <ComboCard
          v-for="combo in combos"
          :key="combo.id"
          :combo="combo"
          :buying-id="buyingComboId"
          @view="openCombo"
          @buy="buyCombo"
        />
      </div>

      <div class="load-more-wrap">
        <button v-if="hasMoreCombos" type="button" class="load-more" :disabled="loadingMore" @click="loadMoreCombos">
          {{ loadingMore ? 'Đang tải...' : 'Xem thêm combo' }}
        </button>
      </div>
    </section>

    <section class="promo-section">
      <div class="promo-section-head">
        <div>
          <p>Tài khoản của bạn</p>
          <h2>Voucher của tôi</h2>
        </div>
        <div class="mine-tools">
          <span class="promo-count">{{ filteredSavedVouchers.length }} / {{ savedVouchers.length }} voucher</span>
          <select v-model="mineVoucherTypeFilter" aria-label="Lọc loại voucher của tôi">
            <option v-for="option in voucherTypeOptions" :key="`mine-type-${option.value}`" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <select v-model="mineVoucherTimeFilter" aria-label="Lọc thời gian voucher của tôi">
            <option v-for="option in voucherTimeOptions" :key="`mine-time-${option.value}`" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
      <div v-if="isAuthenticated && filteredSavedVouchers.length" class="mine-list">
        <article v-for="voucher in filteredSavedVouchers" :key="`mine-${voucher.id}`" class="mine-row">
          <strong>{{ voucher.code }}</strong>
          <span>{{ discountLabel(voucher) }}</span>
          <small>Hết hạn {{ formatDate(voucher.endDate) }}</small>
          <button type="button" class="claim-btn outline" @click="useVoucherNow">Dùng ngay</button>
        </article>
      </div>
      <div v-else class="empty-state">
        {{ isAuthenticated ? (savedVouchers.length ? 'Không có voucher phù hợp bộ lọc.' : 'Bạn chưa lưu voucher nào.') : 'Đăng nhập để lưu voucher và sử dụng khi thanh toán.' }}
      </div>
    </section>

    <div v-if="selectedVoucher" class="modal-overlay" @click.self="selectedVoucher = null">
      <div class="modal-box">
        <button class="modal-close" type="button" @click="selectedVoucher = null"><AppIcon name="close" :size="16" /></button>
        <h3>{{ discountLabel(selectedVoucher) }}</h3>
        <p>{{ selectedVoucher.description || conditionText(selectedVoucher) }}</p>
        <ul>
          <li>Mã voucher: {{ selectedVoucher.code }}</li>
          <li>{{ conditionText(selectedVoucher) }}</li>
          <li>Hết hạn {{ formatDate(selectedVoucher.endDate) }}</li>
          <li>Loại giảm: {{ isShippingVoucher(selectedVoucher) ? 'Vận chuyển' : 'Voucher shop' }}</li>
        </ul>
      </div>
    </div>

    <div v-if="selectedCombo" class="modal-overlay" @click.self="selectedCombo = null">
      <div class="modal-box wide" role="dialog" aria-modal="true" :aria-label="`Chi tiết ${selectedCombo.name}`">
        <button class="modal-close" type="button" @click="selectedCombo = null"><AppIcon name="close" :size="16" /></button>
        <h3>{{ selectedCombo.name }}</h3>
        <p>{{ selectedCombo.description }}</p>
        <div class="combo-modal-list">
          <RouterLink
            v-for="item in selectedCombo.items"
            :key="`modal-${item.productId}-${item.variantId}`"
            class="combo-modal-row"
            :to="{ name: 'product-detail', params: { id: item.productId } }"
            @click="selectedCombo = null"
          >
            <span class="combo-product-image">
              <img
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.productName"
                loading="lazy"
                @error="$event.target.style.display = 'none'"
              >
            </span>
            <span class="combo-product-info">
              <strong>{{ item.productName }}</strong>
              <small>{{ item.categoryName || 'Sản phẩm nội thất' }} · x{{ item.quantity || 1 }}</small>
            </span>
            <b>{{ formatCurrency(item.price) }}</b>
            <AppIcon class="combo-product-arrow" name="chevronRight" :size="18" />
          </RouterLink>
        </div>
        <div class="modal-actions">
          <button type="button" class="combo-btn outline" @click="selectedCombo = null">Đóng</button>
          <button v-if="comboStockIssue(selectedCombo)" type="button" class="combo-btn unavailable" disabled>
            <AppIcon name="cart" :size="14" />Hết hàng
          </button>
          <button v-else type="button" class="combo-btn dark" :disabled="addingComboId === selectedCombo.id" @click="addComboToCart(selectedCombo)">
            <AppIcon name="cart" :size="14" />{{ addingComboId === selectedCombo.id ? 'Đang thêm' : 'Thêm combo' }}
          </button>
          <button v-if="!comboStockIssue(selectedCombo)" type="button" class="combo-btn dark" :disabled="buyingComboId === selectedCombo.id" @click="buyCombo(selectedCombo)">
            <AppIcon name="creditCard" :size="14" />{{ buyingComboId === selectedCombo.id ? 'Đang chuẩn bị' : 'Mua combo' }}
          </button>
        </div>
      </div>
    </div>

    <div class="promo-toast" :class="{ show: toast.show }">
      <AppIcon :name="toast.icon" :size="17" />
      <span><b>{{ toast.title }}</b><small>{{ toast.subtitle }}</small></span>
    </div>
  </main>
</template>

<style scoped>
.promo-page { width: 100%; background: #faf6f0; color: #1a1a1a; min-height: 100vh; }
.promo-hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse 60% 70% at 72% 36%, rgba(201,146,42,.13) 0%, transparent 60%),
    radial-gradient(ellipse 42% 52% at 18% 82%, rgba(28,49,72,.8) 0%, transparent 60%),
    #12202e;
  color: #fff;
}
.promo-hero-inner { width: 100%; max-width: 1300px; margin: 0 auto; padding: 80px 60px 72px; box-sizing: border-box; }
.promo-eyebrow, .promo-section-head p, .combo-count { margin: 0 0 8px; color: #c9953a; font-size: 12px; font-weight: 800; letter-spacing: 2.4px; text-transform: uppercase; }
.promo-hero .promo-eyebrow {
  display: inline-flex;
  background: rgba(201,146,42,.15);
  border: 1px solid rgba(201,146,42,.3);
  color: #e5b84a;
  padding: 6px 14px;
  border-radius: 20px;
  margin-bottom: 24px;
}
.promo-hero h1 {
  max-width: 760px;
  margin: 0;
  color: #fff;
  font-family: var(--sans);
  font-size: 58px;
  line-height: 1.1;
  font-weight: 300;
}
.promo-hero h1 em { color: #e5b84a; font-style: normal; }
.promo-desc { max-width: 560px; color: rgba(255,255,255,.68); font-size: 15px; line-height: 1.7; }
.promo-actions, .promo-stats, .combo-actions, .modal-actions, .combo-tools, .mine-tools { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.promo-btn, .claim-btn, .combo-btn, .load-more { border: 0; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-weight: 800; cursor: pointer; text-decoration: none; }
.promo-btn { padding: 13px 22px; }
.promo-btn.primary, .claim-btn, .load-more { background: #c9953a; color: #17233b; }
.promo-btn.ghost { border: 1px solid rgba(255,255,255,.36); color: #fff; background: transparent; }
.promo-stats { margin-top: 28px; color: rgba(255,255,255,.68); }
.promo-stats b { display: block; color: #fff; font-size: 22px; }
.promo-tabs { width: 100%; max-width: 1300px; margin: 0 auto; padding: 28px 60px 0; box-sizing: border-box; display: flex; gap: 10px; overflow-x: auto; }
.promo-tab { flex: 0 0 auto; border: 1px solid #e8e0d0; background: #fff; border-radius: 24px; padding: 9px 16px; color: #5a4a3a; font-weight: 800; display: inline-flex; align-items: center; gap: 7px; }
.promo-tab.active { background: #16233b; color: #fff; border-color: #16233b; }
.promo-section { width: 100%; max-width: 1300px; margin: 0 auto; padding: 56px 60px; box-sizing: border-box; }
.promo-section-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 18px; margin-bottom: 22px; }
.promo-section-head h2 { margin: 0; font-family: 'Cormorant Garamond', serif; font-size: 34px; font-weight: 600; }
.promo-count { border: 1px solid #e8e0d0; border-radius: 999px; padding: 8px 13px; background: #fff; color: #665846; font-size: 12px; font-weight: 800; white-space: nowrap; }
.voucher-rail { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 2px 2px 12px; cursor: grab; user-select: none; }
.voucher-rail:active { cursor: grabbing; }
.voucher-rail { scrollbar-width: none; -ms-overflow-style: none; }
.voucher-rail::-webkit-scrollbar { display: none; }
.voucher-card { flex: 0 0 340px; min-height: 182px; display: flex; position: relative; overflow: hidden; background: #fff; border: 1px solid #e8e0d0; border-radius: 14px; scroll-snap-align: start; }
.voucher-card.disabled { opacity: .62; }
.voucher-stub { width: 62px; flex: 0 0 62px; background: #16233b; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px; }
.voucher-stub span { color: #c9953a; font-size: 9px; font-weight: 900; text-transform: uppercase; }
.voucher-stub strong { writing-mode: vertical-rl; transform: rotate(180deg); letter-spacing: 1.6px; font-size: 12px; }
.voucher-body { flex: 1; min-width: 0; padding: 12px 13px; display: flex; flex-direction: column; gap: 6px; }
.voucher-body h3, .combo-body h3, .modal-box h3 { margin: 0; font-size: 15.5px; }
.voucher-body p, .combo-desc, .modal-box p { margin: 0; color: #7a6a5a; font-size: 11.5px; line-height: 1.42; }
.voucher-meta { display: grid; gap: 3px; color: #6c5f52; font-size: 10.5px; }
.voucher-meta span { display: inline-flex; align-items: center; gap: 4px; }
.voucher-meta .danger { color: #b8392f; }
.voucher-footer { margin-top: auto; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.status { border-radius: 999px; padding: 4px 8px; background: #fef3e2; color: #a6660c; font-size: 10px; font-weight: 800; }
.status.saved { background: #e0f2e9; color: #137a4e; }
.status.used { background: #efedf7; color: #5b4fa8; }
.claim-btn { min-height: 30px; padding: 6px 10px; font-size: 11px; }
.claim-btn.outline, .combo-btn.outline { background: #fff; border: 1px solid #e8e0d0; color: #1a2332; }
.claim-btn.muted { background: #eee8dd; color: #827464; }
.info-btn, .modal-close { border: 0; background: #f5f0e8; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; }
.info-btn { position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; color: #827464; }
.combo-tools select,
.mine-tools select { border: 1px solid #e8e0d0; background: #fff; border-radius: 999px; padding: 9px 38px 9px 13px; color: #4d4135; font-weight: 700; }
.mine-tools { justify-content: flex-end; }
.combo-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.combo-btn { flex: 1; min-height: 38px; padding: 9px 10px; font-size: 12px; }
.combo-btn.dark { background: #16233b; color: #fff; }
.combo-btn.unavailable { background: #f1e7db; color: #7b6652; }
.combo-btn.unavailable:disabled { cursor: not-allowed; }
.load-more-wrap { text-align: center; padding-top: 24px; }
.load-more { padding: 12px 22px; }
.empty-state { border: 1px dashed #d8cdbb; border-radius: 14px; padding: 34px 18px; color: #7a6a5a; text-align: center; background: #fff; }
.mine-list { display: grid; gap: 10px; }
.mine-row { display: grid; grid-template-columns: 110px 1fr auto auto; align-items: center; gap: 12px; background: #fff; border: 1px solid #e8e0d0; border-radius: 12px; padding: 12px 14px; }
.mine-row small { color: #b8392f; }
.modal-overlay { position: fixed; inset: 0; background: rgba(15,27,46,.55); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-box { position: relative; width: min(500px, 100%); max-height: 86vh; overflow: auto; background: #fff; border-radius: 16px; padding: 24px; }
.modal-box.wide { width: min(720px, 100%); }
.modal-close { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; }
.modal-box ul { padding-left: 18px; color: #6c5f52; line-height: 1.8; }
.combo-modal-list { display: grid; gap: 10px; margin: 18px 0; }
.combo-modal-row { display: grid; grid-template-columns: 64px minmax(0, 1fr) auto 18px; align-items: center; gap: 12px; background: #f5f0e8; border: 1px solid transparent; border-radius: 12px; padding: 10px; color: inherit; text-decoration: none; transition: background .2s ease, border-color .2s ease, transform .2s ease; }
.combo-modal-row:hover { background: #fffaf1; border-color: #dcc69f; transform: translateX(2px); }
.combo-product-image { position: relative; width: 64px; height: 56px; overflow: hidden; background: #e8e0d5; border-radius: 9px; display: inline-flex; }
.combo-product-image img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.combo-product-info { min-width: 0; display: grid; gap: 4px; }
.combo-product-info strong { overflow: hidden; color: #182532; text-overflow: ellipsis; white-space: nowrap; }
.combo-product-info small { color: #7a6a5a; }
.combo-modal-row b { color: #17233b; white-space: nowrap; }
.combo-product-arrow { color: #9b8052; }
.promo-toast { position: fixed; right: 22px; bottom: 22px; z-index: 140; display: flex; align-items: center; gap: 10px; background: #16233b; color: #fff; border-radius: 12px; padding: 12px 14px; opacity: 0; transform: translateY(12px); pointer-events: none; transition: .2s ease; }
.promo-toast.show { opacity: 1; transform: translateY(0); }
.promo-toast small { display: block; color: #d7deeb; }
@media (max-width: 980px) {
  .promo-hero-inner, .promo-section, .promo-tabs { padding-left: 24px; padding-right: 24px; }
  .promo-hero h1 { font-size: 40px; }
  .combo-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mine-row { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .promo-hero-inner { padding-top: 56px; padding-bottom: 52px; }
  .promo-section { padding-top: 44px; padding-bottom: 44px; }
  .voucher-card { flex-basis: 310px; }
  .combo-grid { grid-template-columns: 1fr; }
  .promo-section-head { align-items: flex-start; flex-direction: column; }
  .combo-modal-row { grid-template-columns: 56px minmax(0, 1fr) 18px; }
  .combo-product-image { width: 56px; height: 52px; }
  .combo-modal-row > b { grid-column: 2; }
  .combo-product-arrow { grid-column: 3; grid-row: 1 / span 2; }
}
</style>
