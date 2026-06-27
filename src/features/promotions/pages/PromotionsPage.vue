<script setup>
import '../styles/promotions.css'
import AppButton from '@shared/ui/AppButton.vue'
import AppImage from '@shared/ui/AppImage.vue'
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
      <AppButton type="button" class="promo-btn primary" @click="loadPageData">
        <AppIcon name="refresh" :size="16" />{{ t('common.retry') }}
      </AppButton>
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
            <AppButton type="button" class="promo-btn primary" @click="scrollToPromotionSection('voucher-section')">
              <AppIcon name="badgePercent" :size="16" />{{ t('promotions.hero.claimVoucher') }}
            </AppButton>
            <AppButton type="button" class="promo-btn ghost" @click="scrollToPromotionSection('combo-section')">
              <AppIcon name="armchair" :size="16" />{{ t('promotions.hero.viewCombos') }}
            </AppButton>
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
      <AppButton
        v-for="tab in filterTabs"
        :key="tab.key"
        type="button"
        :class="['promo-tab', { active: activeFilter === tab.key }]"
        @click="activeFilter = tab.key"
      >
        <AppIcon :name="tab.icon" :size="15" />{{ tab.label }}
      </AppButton>
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
            <AppButton type="button" class="info-btn" @click="selectedVoucher = voucher" :aria-label="t('promotions.voucher.detail')">
              <AppIcon name="info" :size="14" />
            </AppButton>
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
              <AppButton
                v-if="!voucher.saved && !voucher.used"
                type="button"
                class="claim-btn"
                :disabled="claimingCode === voucher.code"
                @click="claimVoucher(voucher)"
              >
                <AppIcon name="download" :size="14" />{{ t('promotions.voucher.claim') }}
              </AppButton>
              <AppButton v-else-if="!voucher.used" type="button" class="claim-btn outline" @click="useVoucherNow(voucher)">
                <AppIcon name="cart" :size="14" />{{ t('promotions.voucher.useNow') }}
              </AppButton>
              <AppButton v-else type="button" class="claim-btn muted" disabled>{{ t('promotions.voucher.used') }}</AppButton>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="empty-state">{{ t('promotions.empty.vouchers') }}</div>
      <div v-if="activeFilter !== 'saved' && hasMoreVouchers" class="load-more-wrap">
        <AppButton type="button" class="load-more" :disabled="loadingMoreVouchers" @click="loadMoreVouchers">
          {{ loadingMoreVouchers ? t('common.loading') : t('promotions.voucher.loadMore') }}
        </AppButton>
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
        <AppButton v-if="hasMoreCombos" type="button" class="load-more" :disabled="loadingMore" @click="loadMoreCombos">
          {{ loadingMore ? t('common.loading') : t('promotions.combo.loadMore') }}
        </AppButton>
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
          <AppButton type="button" class="claim-btn outline" @click="useVoucherNow(voucher)">{{ t('promotions.voucher.useNow') }}</AppButton>
        </article>
      </div>
      <div v-else class="empty-state">
        {{ isAuthenticated ? (savedVouchers.length ? t('promotions.empty.savedFiltered') : t('promotions.empty.savedNone')) : t('promotions.empty.loginToSave') }}
      </div>
    </section>

    <div v-if="selectedVoucher" class="modal-overlay" @click.self="selectedVoucher = null">
      <div class="modal-box">
        <AppButton class="modal-close" type="button" @click="selectedVoucher = null"><AppIcon name="close" :size="16" /></AppButton>
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
        <AppButton class="modal-close" type="button" @click="selectedCombo = null"><AppIcon name="close" :size="16" /></AppButton>
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
          <AppButton type="button" class="combo-btn outline" @click="selectedCombo = null">{{ t('common.close') }}</AppButton>
          <AppButton v-if="comboStockIssue(selectedCombo)" type="button" class="combo-btn unavailable" disabled>
            <AppIcon name="cart" :size="14" />{{ t('promotions.combo.soldOut') }}
          </AppButton>
          <AppButton v-else type="button" class="combo-btn dark" :disabled="addingComboId === selectedCombo.id" @click="addComboToCart(selectedCombo)">
            <AppIcon name="cart" :size="14" />{{ addingComboId === selectedCombo.id ? t('promotions.combo.adding') : t('promotions.combo.add') }}
          </AppButton>
          <AppButton v-if="!comboStockIssue(selectedCombo)" type="button" class="combo-btn dark" :disabled="buyingComboId === selectedCombo.id" @click="buyCombo(selectedCombo)">
            <AppIcon name="creditCard" :size="14" />{{ buyingComboId === selectedCombo.id ? t('promotions.combo.preparing') : t('promotions.combo.buy') }}
          </AppButton>
        </div>
      </div>
    </div>

    </template>
  </main>
</template>
