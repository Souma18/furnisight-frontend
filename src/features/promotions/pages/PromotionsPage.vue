<script setup>
import '../styles/promotions.css'
import { useI18n } from 'vue-i18n'
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import VoucherDetailModal from '../components/VoucherDetailModal.vue'
import ComboDetailModal from '../components/ComboDetailModal.vue'
import PromotionsHeroSection from '../components/PromotionsHeroSection.vue'
import PromotionsVoucherSection from '../components/PromotionsVoucherSection.vue'
import PromotionsComboSection from '../components/PromotionsComboSection.vue'
import PromotionsMineSection from '../components/PromotionsMineSection.vue'
import { usePromotionsPage } from '../composables/usePromotionsPage'

const { t } = useI18n()

const {
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
} = usePromotionsPage()
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
    <PromotionsHeroSection
      :active-voucher-count="activeVoucherCount"
      :combo-total="comboTotal"
      :max-saved-amount="combos[0]?.savedAmount || 0"
      @scroll-to="scrollToPromotionSection"
    />

    <div class="promo-tabs">
      <AppButton
        v-for="tab in filterTabs"
        :key="tab.key"
        type="button"
        variant="unstyled"
        size="unstyled"
        :class="['promo-tab', { active: activeFilter === tab.key }]"
        @click="activeFilter = tab.key"
      >
        <AppIcon :name="tab.icon" :size="15" />{{ tab.label }}
      </AppButton>
    </div>

    <PromotionsVoucherSection
      v-if="showVoucherSection"
      ref="voucherSectionRef"
      :filtered-vouchers="filteredVouchers"
      :active-filter="activeFilter"
      :voucher-total="voucherTotal"
      :claiming-code="claimingCode"
      :has-more-vouchers="hasMoreVouchers"
      :loading-more-vouchers="loadingMoreVouchers"
      @start-drag="startVoucherDrag"
      @move-drag="moveVoucherDrag"
      @stop-drag="stopVoucherDrag"
      @view-detail="selectedVoucher = $event"
      @claim="claimVoucher"
      @use-now="useVoucherNow"
      @load-more="loadMoreVouchers"
    />

    <PromotionsComboSection
      v-if="showComboSection"
      :combos="combos"
      :combo-total="comboTotal"
      :combo-sort="comboSort"
      :buying-combo-id="buyingComboId"
      :has-more-combos="hasMoreCombos"
      :loading-more="loadingMore"
      @sort-change="changeComboSort"
      @view="openCombo"
      @buy="buyCombo"
      @load-more="loadMoreCombos"
    />

    <PromotionsMineSection
      :is-authenticated="isAuthenticated"
      :filtered-saved-vouchers="filteredSavedVouchers"
      :saved-vouchers="savedVouchers"
      :type-filter="mineVoucherTypeFilter"
      :time-filter="mineVoucherTimeFilter"
      :voucher-type-options="voucherTypeOptions"
      :voucher-time-options="voucherTimeOptions"
      @update:type-filter="mineVoucherTypeFilter = $event"
      @update:time-filter="mineVoucherTimeFilter = $event"
      @use-now="useVoucherNow"
    />

    <VoucherDetailModal
      :voucher="selectedVoucher"
      @close="selectedVoucher = null"
    />

    <ComboDetailModal
      :combo="selectedCombo"
      :adding-id="addingComboId"
      :buying-id="buyingComboId"
      @close="selectedCombo = null"
      @add-cart="addComboToCart"
      @buy-now="buyCombo"
    />

    </template>
  </main>
</template>
