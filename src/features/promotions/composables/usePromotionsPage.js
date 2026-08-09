import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import { useAuthStore } from '@features/auth/store/authStore'
import { useCartStore } from '@features/cart/store/cartStore'
import { isPurchasableLine } from '@features/cart/lib/stockGuards'
import { useComboCart } from './useComboCart'
import { usePromotionsCombos } from './usePromotionsCombos'
import { usePromotionsVouchers } from './usePromotionsVouchers'
import { useVoucherRailDrag } from './useVoucherRailDrag'
import { writeVoucherIntent } from '@features/checkout/lib/checkoutVoucherIntentStorage'
import { useToast } from '@shared/composables/useToast'
import { useLocaleStore } from '@shared/stores/localeStore'

export function usePromotionsPage() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const authStore = useAuthStore()
  const cartStore = useCartStore()
  const localeStore = useLocaleStore()
  const { isAuthenticated } = storeToRefs(authStore)
  const { locale } = storeToRefs(localeStore)
  const { items: cartItems } = storeToRefs(cartStore)

  const activeFilter = ref(route.query.tab === 'combo' ? 'combo' : 'all')
  const selectedVoucher = ref(null)
  const selectedCombo = ref(null)
  const voucherSectionRef = ref(null)
  const voucherRail = computed(() => voucherSectionRef.value?.voucherRail)
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

  watch(locale, () => {
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

  return {
    t,
    isAuthenticated,
    activeFilter,
    selectedVoucher,
    selectedCombo,
    voucherSectionRef,
    mineVoucherTypeFilter,
    mineVoucherTimeFilter,
    startVoucherDrag,
    moveVoucherDrag,
    stopVoucherDrag,
    addingComboId,
    buyingComboId,
    addComboToCart,
    buyCombo,
    claimingCode,
    filteredVouchers,
    savedVouchers,
    filteredSavedVouchers,
    activeVoucherCount,
    voucherTotal,
    loadingMoreVouchers,
    hasMoreVouchers,
    loadMoreVouchers,
    claimVoucher,
    combos,
    comboTotal,
    comboSort,
    loadingMore,
    hasMoreCombos,
    loadMoreCombos,
    changeComboSort,
    filterTabs,
    voucherTypeOptions,
    voucherTimeOptions,
    showVoucherSection,
    showComboSection,
    pageLoading,
    pageError,
    loadPageData,
    useVoucherNow,
    openCombo,
    scrollToPromotionSection,
  }
}
