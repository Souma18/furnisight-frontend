<script setup>
import { computed, onMounted, unref } from 'vue'
import { NConfigProvider } from 'naive-ui'
import { useRoom3D } from '../composables/useRoom3D'
import Room3DTopbar from '../components/Room3DTopbar.vue'
import Room3DLeftPanel from '../components/Room3DLeftPanel.vue'
import Room3DCanvas from '../components/Room3DCanvas.vue'
import Room3DRightPanel from '../components/Room3DRightPanel.vue'
import CheckoutModal from '../components/CheckoutModal.vue'
import SuccessModal from '../components/SuccessModal.vue'

const vm = useRoom3D()
const {
  mode,
  roomTemplates,
  selectedRoomType,
  selectedRoom,
  imageType,
  meshQuality,
  quality,
  isAnalyzing,
  isLoadingTemplates,
  projectName,
  selectedCategory,
  searchKeyword,
  filteredProducts,
  cartItems,
  placedProductIds,
  cartTotal,
  cartCount,
  isCheckoutOpen,
  isSuccessOpen,
  orderCode,
} = vm

const isLoadingTemplatesValue = computed(() => Boolean(unref(isLoadingTemplates)))
const orderCodeValue = computed(() => String(unref(orderCode) ?? ''))

onMounted(() => {
  vm.initRoomTemplates()
})
</script>

<template>
  <NConfigProvider>
    <section class="room-page">
      <Room3DTopbar
        :selected-room="selectedRoom"
        :cart-count="cartCount"
        @open-checkout="vm.openCheckout"
      />

      <div class="room-body">
        <Room3DLeftPanel
          :mode="mode"
          :room-templates="roomTemplates"
          :selected-room-type="selectedRoomType"
          :selected-room="selectedRoom"
          :image-type="imageType"
          :mesh-quality="meshQuality"
          :quality="quality"
          :is-analyzing="isAnalyzing"
          :is-loading-templates="isLoadingTemplatesValue"
          :project-name="projectName"
          :upload-error="vm.uploadError"
          @switch-mode="vm.setMode"
          @upload-image="vm.handleUploadImage"
          @select-room-type="vm.selectRoomType"
          @image-type-change="vm.setImageType"
          @mesh-quality-change="vm.setMeshQuality"
          @quality-change="vm.setQuality"
          @project-name-change="projectName = $event"
        />

        <Room3DCanvas
          :mode="mode"
          :is-analyzing="isAnalyzing"
          :selected-room="selectedRoom"
          :placed-product-ids="placedProductIds"
          @add-product="vm.addProductToCart"
          @remove-product="vm.removeProductFromCart"
        />

        <Room3DRightPanel
          :selected-room="selectedRoom"
          :selected-category="selectedCategory"
          :search-keyword="searchKeyword"
          :product-filters="vm.productFilters"
          :filtered-products="filteredProducts"
          :cart-items="cartItems"
          :placed-product-ids="placedProductIds"
          :cart-total="cartTotal"
          :format-currency="vm.formatCurrency"
          :product-columns="2"
          :product-card-step="1"
          @search-change="vm.setSearchKeyword"
          @category-change="vm.setCategory"
          @add-product="vm.addProductToCart"
          @remove-product="vm.removeProductFromCart"
          @open-checkout="vm.openCheckout"
        />
      </div>
    </section>

    <CheckoutModal
      :show="isCheckoutOpen"
      :cart-items="cartItems"
      :cart-total="cartTotal"
      :format-currency="vm.formatCurrency"
      @update:show="(show) => (show ? vm.openCheckout() : vm.closeCheckout())"
      @submit="vm.submitCheckoutMock"
    />

    <SuccessModal
      :show="isSuccessOpen"
      :order-code="orderCodeValue"
      @update:show="(show) => (!show ? vm.closeSuccess() : null)"
    />
  </NConfigProvider>
</template>

<style scoped>
.room-page {
  height: 100svh;
  overflow: hidden;
  background: #f4f1eb;
}
.room-body {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr) 300px;
  height: calc(100% - 56px);
  min-height: 0;
}

@media (max-width: 1240px) {
  .room-body {
    grid-template-columns: 230px minmax(0, 1fr) 280px;
  }
}

@media (max-width: 980px) {
  .room-page {
    height: auto;
    min-height: 100svh;
  }
  .room-body {
    grid-template-columns: 1fr;
    height: auto;
  }
}
</style>
