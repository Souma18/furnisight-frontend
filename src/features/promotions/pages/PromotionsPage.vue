<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import { useAuthStore } from '@features/auth/store/authStore'
import { useCartStore } from '@features/cart/store/cartStore'
import { isPurchasableLine } from '@features/cart/lib/stockGuards'
import { useComboCart } from '../composables/useComboCart'
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
import { writeVoucherIntent } from '@features/checkout/lib/checkoutVoucherIntentStorage'
import { useToast } from '@shared/composables/useToast'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
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
const { show: showToastGlobal } = useToast()

function showToast(title, subtitle = '', icon = 'check') {
  const msg = subtitle ? `${title} - ${subtitle}` : title
  const type = icon === 'alert' ? 'error' : 'success'
  showToastGlobal(msg, type)
}
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
      showToast(t('promotions.toast.comboError'), message, 'alert')
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
  voucherTotal,
  loadingMoreVouchers,
  hasMoreVouchers,
  loadVouchers,
  loadMoreVouchers,
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

const filterTabs = computed(() => [
  { key: 'all', label: t('promotions.tabs.all'), icon: 'list' },
  { key: 'voucher', label: t('promotions.tabs.voucher'), icon: 'badgePercent' },
  { key: 'combo', label: t('promotions.tabs.combo'), icon: 'armchair' },
  { key: 'freeship', label: t('promotions.tabs.freeship'), icon: 'truck' },
  { key: 'expiring', label: t('promotions.tabs.expiring'), icon: 'clock3' },
  { key: 'saved', label: t('promotions.tabs.saved'), icon: 'wallet' },
])

const voucherTypeOptions = computed(() => [
  { value: 'all', label: t('promotions.filters.allTypes') },
  { value: 'shop', label: t('promotions.filters.shopVoucher') },
  { value: 'ship', label: t('promotions.filters.shippingVoucher') },
  { value: 'PUBLIC', label: t('promotions.filters.public') },
  { value: 'PERSONAL', label: t('promotions.filters.personal') },
  { value: 'MARKETING', label: t('promotions.filters.marketing') },
])

const voucherTimeOptions = computed(() => [
  { value: 'all', label: t('promotions.filters.allTimes') },
  { value: 'active', label: t('promotions.filters.active') },
  { value: 'expiring', label: t('promotions.filters.expiring') },
  { value: 'upcoming', label: t('promotions.filters.upcoming') },
  { value: 'expired', label: t('promotions.filters.expired') },
])

const showVoucherSection = computed(() => ['all', 'voucher', 'freeship', 'expiring', 'saved'].includes(activeFilter.value))
const showComboSection = computed(() => activeFilter.value === 'all' || activeFilter.value === 'combo')
const pageLoading = ref(true)
const pageError = ref(false)

async function loadPageData() {
  pageLoading.value = true
  pageError.value = false
  const results = await Promise.all([loadVouchers(), loadCombos(true)])
  const allFailed = results.every(success => !success)
  pageError.value = allFailed
  pageLoading.value = false
  cartStore.ensureHydrated().catch(() => null)
}

onMounted(() => {
  loadPageData()
})

async function useVoucherNow(voucher) {
  if (!voucher?.code) return
  await cartStore.ensureHydrated({ force: true }).catch(() => null)
  const hasPurchasableItem = cartItems.value.some(isPurchasableLine)
  if (hasPurchasableItem) {
    await router.push({ path: '/checkout', query: { voucherCode: voucher.code } })
    return
  }
  writeVoucherIntent(voucher.code)
  await router.push('/products')
}

function openCombo(combo) {
  selectedCombo.value = combo
}

async function scrollToPromotionSection(sectionId) {
  if (sectionId === 'voucher-section' && !showVoucherSection.value) activeFilter.value = 'all'
  if (sectionId === 'combo-section' && !showComboSection.value) activeFilter.value = 'all'
  await nextTick()

  const target = document.getElementById(sectionId)
  if (!target) return
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.history.replaceState(null, '', `#${sectionId}`)
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
}
</script>

<template>
  <main class="promo-page">
    <div v-if="pageLoading" class="promo-page-state">
      <div class="promo-page-state-spinner"></div>
      <p>{{ t('promotions.loading') }}</p>
    </div>

    <div v-else-if="pageError" class="promo-page-state">
      <AppIcon name="alert" :size="42" />
      <h2>{{ t('promotions.errorTitle') }}</h2>
      <p>{{ t('promotions.errorCopy') }}</p>
      <button type="button" class="promo-btn primary" @click="loadPageData">
        <AppIcon name="refresh" :size="16" />{{ t('common.retry') }}
      </button>
    </div>

    <template v-else>
    <section class="promo-hero">
      <nav class="promo-breadcrumb" aria-label="Breadcrumb">
        <RouterLink to="/">{{ t('nav.home') }}</RouterLink>
        <span>›</span>
        <span>{{ t('nav.promotions') }}</span>
      </nav>
      <div class="promo-hero-inner">
        <div class="promo-hero-copy">
          <p class="promo-eyebrow">{{ t('promotions.hero.eyebrow') }}</p>
          <h1>{{ t('promotions.hero.titlePrefix') }} <em>{{ t('promotions.hero.titleEmphasis') }}</em></h1>
          <p class="promo-desc">
            {{ t('promotions.hero.subtitle') }}
          </p>
          <div class="promo-actions">
            <button type="button" class="promo-btn primary" @click="scrollToPromotionSection('voucher-section')">
              <AppIcon name="badgePercent" :size="16" />{{ t('promotions.hero.claimVoucher') }}
            </button>
            <button type="button" class="promo-btn ghost" @click="scrollToPromotionSection('combo-section')">
              <AppIcon name="armchair" :size="16" />{{ t('promotions.hero.viewCombos') }}
            </button>
          </div>
        </div>

        <aside class="promo-overview" :aria-label="t('promotions.hero.overviewAria')">
          <p class="promo-overview-label">{{ t('promotions.hero.overviewLabel') }}</p>
          <div class="promo-stats">
            <span><b>{{ activeVoucherCount }}</b><small>{{ t('promotions.hero.availableVouchers') }}</small></span>
            <span><b>{{ comboTotal }}</b><small>{{ t('promotions.hero.comboDeals') }}</small></span>
            <span><b>{{ formatCurrency(combos[0]?.savedAmount || 0) }}</b><small>{{ t('promotions.hero.highlightSaving') }}</small></span>
          </div>
          <p class="promo-overview-note">{{ t('promotions.hero.overviewNote') }}</p>
        </aside>
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
          <p>{{ t('promotions.sections.voucherKicker') }}</p>
          <h2>{{ t('promotions.sections.voucherTitle') }}</h2>
        </div>
        <span class="promo-count">{{ t('promotions.voucher.count', { count: activeFilter === 'saved' ? filteredVouchers.length : voucherTotal }) }}</span>
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
            <button type="button" class="info-btn" @click="selectedVoucher = voucher" :aria-label="t('promotions.voucher.detail')">
              <AppIcon name="info" :size="14" />
            </button>
            <h3>{{ discountLabel(voucher) }}</h3>
            <p>{{ voucher.description || conditionText(voucher) }}</p>
            <div class="voucher-meta">
              <span><AppIcon name="creditCard" :size="13" />{{ conditionText(voucher) }}</span>
              <span :class="{ danger: isExpiring(voucher.endDate) }"><AppIcon name="calendar" :size="13" />{{ t('promotions.voucher.expires', { date: formatDate(voucher.endDate) }) }}</span>
            </div>
            <div class="voucher-footer">
              <span class="status" :class="{ saved: voucher.saved, used: voucher.used }">
                {{ voucher.used ? t('promotions.voucher.used') : voucher.saved ? t('promotions.voucher.saved') : t('promotions.voucher.notClaimed') }}
              </span>
              <button
                v-if="!voucher.saved && !voucher.used"
                type="button"
                class="claim-btn"
                :disabled="claimingCode === voucher.code"
                @click="claimVoucher(voucher)"
              >
                <AppIcon name="download" :size="14" />{{ t('promotions.voucher.claim') }}
              </button>
              <button v-else-if="!voucher.used" type="button" class="claim-btn outline" @click="useVoucherNow(voucher)">
                <AppIcon name="cart" :size="14" />{{ t('promotions.voucher.useNow') }}
              </button>
              <button v-else type="button" class="claim-btn muted" disabled>{{ t('promotions.voucher.used') }}</button>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="empty-state">{{ t('promotions.empty.vouchers') }}</div>
      <div v-if="activeFilter !== 'saved' && hasMoreVouchers" class="load-more-wrap">
        <button type="button" class="load-more" :disabled="loadingMoreVouchers" @click="loadMoreVouchers">
          {{ loadingMoreVouchers ? t('common.loading') : t('promotions.voucher.loadMore') }}
        </button>
      </div>
    </section>

    <section v-if="showComboSection" id="combo-section" class="promo-section">
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
          @view="openCombo"
          @buy="buyCombo"
        />
      </div>

      <div class="load-more-wrap">
        <button v-if="hasMoreCombos" type="button" class="load-more" :disabled="loadingMore" @click="loadMoreCombos">
          {{ loadingMore ? t('common.loading') : t('promotions.combo.loadMore') }}
        </button>
      </div>
    </section>

    <section class="promo-section">
      <div class="promo-section-head">
        <div>
          <p>{{ t('promotions.sections.mineKicker') }}</p>
          <h2>{{ t('promotions.sections.mineTitle') }}</h2>
        </div>
        <div class="mine-tools">
          <span class="promo-count">{{ filteredSavedVouchers.length }} / {{ savedVouchers.length }} voucher</span>
          <select v-model="mineVoucherTypeFilter" :aria-label="t('promotions.filters.mineTypeAria')">
            <option v-for="option in voucherTypeOptions" :key="`mine-type-${option.value}`" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <select v-model="mineVoucherTimeFilter" :aria-label="t('promotions.filters.mineTimeAria')">
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
          <small>{{ t('promotions.voucher.expires', { date: formatDate(voucher.endDate) }) }}</small>
          <button type="button" class="claim-btn outline" @click="useVoucherNow(voucher)">{{ t('promotions.voucher.useNow') }}</button>
        </article>
      </div>
      <div v-else class="empty-state">
        {{ isAuthenticated ? (savedVouchers.length ? t('promotions.empty.savedFiltered') : t('promotions.empty.savedNone')) : t('promotions.empty.loginToSave') }}
      </div>
    </section>

    <div v-if="selectedVoucher" class="modal-overlay" @click.self="selectedVoucher = null">
      <div class="modal-box">
        <button class="modal-close" type="button" @click="selectedVoucher = null"><AppIcon name="close" :size="16" /></button>
        <h3>{{ discountLabel(selectedVoucher) }}</h3>
        <p>{{ selectedVoucher.description || conditionText(selectedVoucher) }}</p>
        <ul>
          <li>{{ t('promotions.voucher.code', { code: selectedVoucher.code }) }}</li>
          <li>{{ conditionText(selectedVoucher) }}</li>
          <li>{{ t('promotions.voucher.expires', { date: formatDate(selectedVoucher.endDate) }) }}</li>
          <li>{{ t('promotions.voucher.discountType', { type: isShippingVoucher(selectedVoucher) ? t('promotions.voucher.shipping') : t('promotions.voucher.shop') }) }}</li>
        </ul>
      </div>
    </div>

    <div v-if="selectedCombo" class="modal-overlay" @click.self="selectedCombo = null">
      <div class="modal-box wide" role="dialog" aria-modal="true" :aria-label="t('promotions.combo.detailAria', { name: selectedCombo.name })">
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
              <small>{{ item.categoryName || t('promotions.combo.defaultProduct') }} · x{{ item.quantity || 1 }}</small>
            </span>
            <b>{{ formatCurrency(item.price) }}</b>
            <AppIcon class="combo-product-arrow" name="chevronRight" :size="18" />
          </RouterLink>
        </div>
        <div class="modal-actions">
          <button type="button" class="combo-btn outline" @click="selectedCombo = null">{{ t('common.close') }}</button>
          <button v-if="comboStockIssue(selectedCombo)" type="button" class="combo-btn unavailable" disabled>
            <AppIcon name="cart" :size="14" />{{ t('promotions.combo.soldOut') }}
          </button>
          <button v-else type="button" class="combo-btn dark" :disabled="addingComboId === selectedCombo.id" @click="addComboToCart(selectedCombo)">
            <AppIcon name="cart" :size="14" />{{ addingComboId === selectedCombo.id ? t('promotions.combo.adding') : t('promotions.combo.add') }}
          </button>
          <button v-if="!comboStockIssue(selectedCombo)" type="button" class="combo-btn dark" :disabled="buyingComboId === selectedCombo.id" @click="buyCombo(selectedCombo)">
            <AppIcon name="creditCard" :size="14" />{{ buyingComboId === selectedCombo.id ? t('promotions.combo.preparing') : t('promotions.combo.buy') }}
          </button>
        </div>
      </div>
    </div>

    </template>
  </main>
</template>

<style scoped>
.promo-page { width: 100%; background: #faf6f0; color: #1a1a1a; min-height: 100vh; }
.promo-page-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; min-height: 60vh; padding: 60px 24px; text-align: center; color: #7a6a5a; }
.promo-page-state h2 { margin: 0; color: #12202e; font-size: 24px; }
.promo-page-state p { margin: 0; max-width: 400px; line-height: 1.6; }
.promo-page-state-spinner { width: 36px; height: 36px; border: 3px solid #e8e0d0; border-top-color: #c9922a; border-radius: 50%; animation: promoSpin .7s linear infinite; }
@keyframes promoSpin { to { transform: rotate(360deg); } }
.promo-hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse 60% 70% at 72% 36%, rgba(201,146,42,.13) 0%, transparent 60%),
    radial-gradient(ellipse 42% 52% at 18% 82%, rgba(28,49,72,.8) 0%, transparent 60%),
    #12202e;
  color: #fff;
  padding-top: 26px;
}
.promo-breadcrumb {
  align-items: center;
  color: rgba(255, 255, 255, 0.54);
  display: flex;
  font-size: 12px;
  gap: 8px;
  margin: 0 auto;
  max-width: 1440px;
  padding: 0 60px 18px;
  box-sizing: border-box;
}
.promo-breadcrumb a,
.promo-breadcrumb span {
  color: inherit;
  text-decoration: none;
}
.promo-breadcrumb a:hover,
.promo-breadcrumb a:focus-visible {
  color: #e5b84a;
  outline: none;
}
.promo-hero-inner { align-items: end; box-sizing: border-box; display: grid; gap: clamp(44px, 7vw, 100px); grid-template-columns: minmax(0, 1fr) minmax(310px, .62fr); margin: 0 auto; max-width: 1300px; padding: 18px 60px 64px; width: 100%; }
.promo-hero-copy { max-width: 690px; }
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
  max-width: 680px;
  margin: 0;
  color: #fff;
  font-family: var(--sans);
  font-size: clamp(40px, 4.4vw, 58px);
  line-height: 1.06;
  font-weight: 480;
  letter-spacing: 0;
  text-wrap: balance;
}
.promo-hero h1 em { color: #e5b84a; display: block; font-style: normal; }
.promo-desc { max-width: 590px; color: rgba(255,255,255,.68); font-size: 15px; line-height: 1.7; margin: 18px 0 0; }
.promo-actions, .combo-actions, .modal-actions, .combo-tools, .mine-tools { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.promo-actions { margin-top: 24px; }
.promo-btn, .claim-btn, .combo-btn, .load-more { border: 0; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-weight: 800; cursor: pointer; text-decoration: none; }
.promo-btn { padding: 13px 22px; }
.promo-btn.primary, .claim-btn, .load-more { background: #c9953a; color: #17233b; }
.promo-btn.ghost { border: 1px solid rgba(255,255,255,.36); color: #fff; background: transparent; }
.promo-btn { transition: background .2s ease, border-color .2s ease, color .2s ease, transform .2s ease; }
.promo-btn.primary:hover, .promo-btn.primary:focus-visible { background: #e5b84a; color: #12202e; transform: translateY(-1px); }
.promo-btn.ghost:hover, .promo-btn.ghost:focus-visible { background: #fffdf9; border-color: #fffdf9; color: #12202e; transform: translateY(-1px); }
.promo-btn:focus-visible { outline: 2px solid #e5b84a; outline-offset: 3px; }
.promo-btn:active { transform: translateY(0); }
.promo-overview { border-left: 1px solid rgba(255,255,255,.16); padding: 4px 0 4px clamp(24px, 4vw, 46px); }
.promo-overview-label { color: #e5b84a; font-size: 11px; font-weight: 760; letter-spacing: 1.8px; margin: 0 0 8px; text-transform: uppercase; }
.promo-stats { color: rgba(255,255,255,.62); display: grid; }
.promo-stats span { align-items: baseline; border-bottom: 1px solid rgba(255,255,255,.1); display: grid; gap: 2px 16px; grid-template-columns: minmax(92px, auto) 1fr; padding: 13px 0; }
.promo-stats b { color: #fff; font-size: 25px; font-variant-numeric: tabular-nums; font-weight: 620; white-space: nowrap; }
.promo-stats small { font-size: 12px; line-height: 1.45; }
.promo-overview-note { color: rgba(255,255,255,.44); font-size: 11px; line-height: 1.55; margin: 14px 0 0; }
.promo-tabs { width: 100%; max-width: 1300px; margin: 0 auto; padding: 28px 60px 0; box-sizing: border-box; display: flex; gap: 10px; overflow-x: auto; }
.promo-tab { flex: 0 0 auto; border: 1px solid #e8e0d0; background: #fff; border-radius: 24px; padding: 9px 16px; color: #5a4a3a; font-weight: 800; display: inline-flex; align-items: center; gap: 7px; }
.promo-tab.active { background: #16233b; color: #fff; border-color: #16233b; }
.promo-section { width: 100%; max-width: 1300px; margin: 0 auto; padding: 56px 60px; box-sizing: border-box; scroll-margin-top: 76px; }
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
@media (max-width: 980px) {
  .promo-breadcrumb, .promo-hero-inner, .promo-section, .promo-tabs { padding-left: 24px; padding-right: 24px; }
  .promo-hero-inner { gap: 34px; grid-template-columns: 1fr; }
  .promo-overview { border-left: 0; border-top: 1px solid rgba(255,255,255,.16); padding: 20px 0 0; }
  .promo-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .promo-stats span { align-content: start; border-bottom: 0; border-left: 1px solid rgba(255,255,255,.1); display: grid; grid-template-columns: 1fr; padding: 8px 18px; }
  .promo-stats span:first-child { border-left: 0; padding-left: 0; }
  .promo-hero h1 { font-size: 40px; }
  .combo-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mine-row { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .promo-hero-inner { padding-top: 18px; padding-bottom: 52px; }
  .promo-section { padding-top: 44px; padding-bottom: 44px; }
  .voucher-card { flex-basis: 310px; }
  .combo-grid { grid-template-columns: 1fr; }
  .promo-section-head { align-items: flex-start; flex-direction: column; }
  .promo-actions { align-items: stretch; flex-direction: column; }
  .promo-actions .promo-btn { width: 100%; }
  .promo-stats { grid-template-columns: 1fr; }
  .promo-stats span { border-left: 0; border-top: 1px solid rgba(255,255,255,.1); grid-template-columns: 110px 1fr; padding: 12px 0; }
  .promo-stats span:first-child { border-top: 0; padding-left: 0; }
  .combo-modal-row { grid-template-columns: 56px minmax(0, 1fr) 18px; }
  .combo-product-image { width: 56px; height: 52px; }
  .combo-modal-row > b { grid-column: 2; }
  .combo-product-arrow { grid-column: 3; grid-row: 1 / span 2; }
}
@media (max-width: 560px) {
  .promo-breadcrumb { padding-left: 16px; padding-right: 16px; }
}
</style>
