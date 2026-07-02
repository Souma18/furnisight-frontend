<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { defineAsyncComponent } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@shared/ui/AppIcon.vue'
import ProductDetailTopSection from '../components/ProductDetailTopSection.vue'
import ProductDetailTabsSection from '../components/ProductDetailTabsSection.vue'
import { useProductDetailPage } from '../composables/useProductDetailPage'
import { useI18n } from 'vue-i18n'
import '../styles/productDetail.css'

const ProductDetail3DModal = defineAsyncComponent(() => import('../components/ProductDetail3DModal.vue'))

const props = defineProps({
  slug: { type: String, required: true },
})

const {
  product,
  loading,
  error,
  selectedColor,
  selectedSize,
  selectedStock,
  selectedOutOfStock,
  qty,
  wished,
  activeImage,
  activeTab,
  show3DModal,
  cartAdding,
  cartAdded,
  cartError,
  reviewEligibility,
  reviewForm,
  reviewSubmitting,
  reviewSubmitError,
  reviewSubmitSuccess,
  reviewCanSubmit,
  reviewIsAuthenticated,
  breadcrumbLinks,
  activeVariant,
  activeGallery,
  has3dModel,
  activeModelUrl,
  retry,
  changeQty,
  setQty,
  openRoom3D,
  addToCart,
  buyNow,
  addToWishlist,
  updateReviewField,
  openReviewLogin,
  submitReview,
} = useProductDetailPage(props)
</script>

<template>
  <div class="product-detail-page">
    <!-- Loading state -->
    <div v-if="loading" class="pd-state-center">
      <div class="pd-spinner"></div>
      <p>{{ t('productDetail.page.loading') }}</p>
    </div>

    <!-- Not found state -->
    <div v-else-if="error === 'not_found'" class="pd-state-center">
      <AppIcon class="pd-state-icon" name="search" :size="34" />
      <h2>{{ t('productDetail.page.notFoundTitle') }}</h2>
      <p>{{ t('productDetail.page.notFoundDesc') }}</p>
      <RouterLink class="pd-btn-back" :to="{ name: 'products' }">
        <AppIcon name="chevronLeft" :size="16" />
        {{ t('productDetail.page.backToList') }}
      </RouterLink>
    </div>

    <!-- API error state -->
    <div v-else-if="error === 'api_error'" class="pd-state-center">
      <AppIcon class="pd-state-icon" name="alert" :size="34" />
      <h2>{{ t('productDetail.page.errorTitle') }}</h2>
      <p>{{ t('productDetail.page.errorDesc') }}</p>
      <AppButton class="pd-btn-retry" @click="retry">
        <AppIcon name="refresh" :size="16" />
        {{ t('productDetail.page.retry') }}
      </AppButton>
    </div>

    <!-- Product loaded -->
    <template v-else-if="product">
      <nav class="pd-breadcrumb" aria-label="Breadcrumb">
        <div class="pd-breadcrumb-inner">
          <span v-for="(crumb, idx) in breadcrumbLinks" :key="crumb.label">
            <template v-if="idx > 0"> › </template>
            <RouterLink class="pd-breadcrumb-link" :to="crumb.to">{{ crumb.label }}</RouterLink>
          </span>
          <span> › <span class="pd-breadcrumb-current">{{ product.name }}</span></span>
        </div>
      </nav>
      <ProductDetailTopSection
        :product="product"
        :selected-color="selectedColor"
        :selected-size="selectedSize"
        :selected-stock="selectedStock"
        :selected-out-of-stock="selectedOutOfStock"
        :qty="qty"
        :wished="wished"
        :active-image="activeImage"
        :display-gallery="activeGallery"
        :cart-adding="cartAdding"
        :cart-added="cartAdded"
        :cart-error="cartError"
        @pick-image="activeImage = $event"
        @pick-color="selectedColor = $event"
        @pick-size="selectedSize = $event"
        @change-qty="changeQty"
        @set-qty="setQty"
        @add-cart="addToCart"
        @buy-now="buyNow"
        @toggle-wish="addToWishlist"
        @open-3d="show3DModal = true"
        @go-room3d="openRoom3D"
      />
      <ProductDetailTabsSection
        :product="product"
        :active-variant="activeVariant"
        :active-tab="activeTab"
        :review-eligibility="reviewEligibility"
        :review-form="reviewForm"
        :review-submitting="reviewSubmitting"
        :review-submit-error="reviewSubmitError"
        :review-submit-success="reviewSubmitSuccess"
        :review-can-submit="reviewCanSubmit"
        :review-is-authenticated="reviewIsAuthenticated"
        @switch-tab="activeTab = $event"
        @update-review-field="updateReviewField"
        @submit-review="submitReview"
        @open-login="openReviewLogin"
      />
      <ProductDetail3DModal
        v-if="show3DModal"
        :open="show3DModal"
        :model-url="activeModelUrl"
        :product-name="product.name"
        :supports3d="has3dModel"
        :room-type-hint="product.roomTypeHint"
        @close="show3DModal = false"
        @go-room3d="openRoom3D"
      />
    </template>
  </div>
</template>
