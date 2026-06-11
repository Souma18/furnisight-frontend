<script setup>
import { RouterLink } from 'vue-router'
import AppIcon from '@shared/ui/AppIcon.vue'
import ProductDetailTopSection from '../components/ProductDetailTopSection.vue'
import ProductDetailTabsSection from '../components/ProductDetailTabsSection.vue'
import ProductDetail3DModal from '../components/ProductDetail3DModal.vue'
import { useProductDetailPage } from '../composables/useProductDetailPage'
import '../styles/productDetail.css'

const props = defineProps({
  id: { type: String, required: true },
})

const {
  product,
  loading,
  error,
  selectedColor,
  selectedSize,
  qty,
  wished,
  activeImage,
  activeTab,
  show3DModal,
  breadcrumbLinks,
  retry,
  changeQty,
  openRoom3D,
  addToCart,
  addToWishlist,
} = useProductDetailPage(props)
</script>

<template>
  <div class="product-detail-page">
    <!-- Loading state -->
    <div v-if="loading" class="pd-state-center">
      <div class="pd-spinner"></div>
      <p>Đang tải sản phẩm...</p>
    </div>

    <!-- Not found state -->
    <div v-else-if="error === 'not_found'" class="pd-state-center">
      <AppIcon class="pd-state-icon" name="search" :size="34" />
      <h2>Sản phẩm không tồn tại</h2>
      <p>Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      <RouterLink class="pd-btn-back" :to="{ name: 'products' }">
        <AppIcon name="chevronLeft" :size="16" />
        Quay lại danh sách
      </RouterLink>
    </div>

    <!-- API error state -->
    <div v-else-if="error === 'api_error'" class="pd-state-center">
      <AppIcon class="pd-state-icon" name="alert" :size="34" />
      <h2>Không thể tải sản phẩm</h2>
      <p>Đã xảy ra lỗi kết nối. Vui lòng thử lại.</p>
      <button class="pd-btn-retry" @click="retry">
        <AppIcon name="refresh" :size="16" />
        Thử lại
      </button>
    </div>

    <!-- Product loaded -->
    <template v-else-if="product">
      <div class="pd-breadcrumb">
        <span v-for="(crumb, idx) in breadcrumbLinks" :key="crumb.label">
          <template v-if="idx > 0"> › </template>
          <RouterLink class="pd-breadcrumb-link" :to="crumb.to">{{ crumb.label }}</RouterLink>
        </span>
        <span> › <span class="pd-breadcrumb-current">{{ product.name }}</span></span>
      </div>
      <ProductDetailTopSection
        :product="product"
        :selected-color="selectedColor"
        :selected-size="selectedSize"
        :qty="qty"
        :wished="wished"
        :active-image="activeImage"
        @pick-image="activeImage = $event"
        @pick-color="selectedColor = $event"
        @pick-size="selectedSize = $event"
        @change-qty="changeQty"
        @add-cart="addToCart"
        @toggle-wish="addToWishlist"
        @open-3d="show3DModal = true"
        @go-room3d="openRoom3D"
      />
      <ProductDetailTabsSection :product="product" :active-tab="activeTab" @switch-tab="activeTab = $event" />
      <ProductDetail3DModal
        :open="show3DModal"
        :model-url="product.modelUrl"
        :product-name="product.name"
        :supports3d="product.supports3d"
        :room-type-hint="product.roomTypeHint"
        @close="show3DModal = false"
        @go-room3d="openRoom3D"
      />
    </template>
  </div>
</template>
