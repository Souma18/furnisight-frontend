<script setup>
import { computed, defineAsyncComponent, onMounted, ref, unref } from 'vue'
import { NConfigProvider } from 'naive-ui'
import { useRoom3D } from '../composables/useRoom3D'
import Room3DTopbar from '../components/Room3DTopbar.vue'
import Room3DLeftPanel from '../components/Room3DLeftPanel.vue'
import Room3DRightPanel from '../components/Room3DRightPanel.vue'

const Room3DCanvas = defineAsyncComponent(() => import('../components/Room3DCanvas.vue'))

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
  predictionStatus,
  predictionResponseType,
  aiRecognitionLabel,
  aiRecognitionConfidence,
  isLoadingTemplates,
  projectName,
  selectedCategory,
  searchKeyword,
  filteredProducts,
  cartItems,
  sceneItems,
  placedProductIds,
  cartProductIds,
  cartTotal,
  cartCount,
  productFilters,
  uploadError,
  recommendationError,
} = vm

const canvasRef = ref(null)
const isLoadingTemplatesValue = computed(() => Boolean(unref(isLoadingTemplates)))

function toggleFullscreen() {
  canvasRef.value?.toggleFullscreen?.()
}

onMounted(() => {
  vm.initRoomTemplates()
})
</script>

<template>
  <NConfigProvider>
    <section class="room-page">
      <Room3DTopbar
        :selected-room="selectedRoom"
        :cart-items="cartItems"
        :cart-total="cartTotal"
        :cart-count="cartCount"
        @open-checkout="vm.goCheckout"
        @update-cart-qty="vm.updateCartQty"
        @remove-product="vm.removeProductFromCart"
        @toggle-fullscreen="toggleFullscreen"
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
          :prediction-status="predictionStatus"
          :prediction-response-type="predictionResponseType"
          :prediction-label="aiRecognitionLabel"
          :prediction-confidence="aiRecognitionConfidence"
          :is-loading-templates="isLoadingTemplatesValue"
          :project-name="projectName"
          :upload-error="uploadError"
          @switch-mode="vm.setMode"
          @upload-image="vm.handleUploadImage"
          @select-room-type="vm.selectRoomType"
          @image-type-change="vm.setImageType"
          @mesh-quality-change="vm.setMeshQuality"
          @quality-change="vm.setQuality"
          @project-name-change="projectName = $event"
        />

        <Room3DCanvas
          ref="canvasRef"
          :mode="mode"
          :is-analyzing="isAnalyzing"
          :selected-room="selectedRoom"
          :scene-items="sceneItems"
          :cart-product-ids="placedProductIds"
          @add-product="vm.addProductToCart"
          @add-scene-product="vm.addProductToScene"
          @remove-scene-item="vm.removeProductFromScene"
        />

        <Room3DRightPanel
          :selected-room="selectedRoom"
          :selected-category="selectedCategory"
          :search-keyword="searchKeyword"
          :product-filters="productFilters"
          :filtered-products="filteredProducts"
          :recommendation-error="recommendationError"
          :cart-items="cartItems"
          :placed-product-ids="cartProductIds"
          :cart-total="cartTotal"
          :format-currency="vm.formatCurrency"
          :product-columns="2"
          :product-card-step="1"
          @search-change="vm.setSearchKeyword"
          @category-change="vm.setCategory"
          @add-product="vm.addProductToCart"
          @open-product="vm.openProductDetail"
          @remove-product="vm.removeProductFromCart"
          @open-checkout="vm.goCheckout"
        />
      </div>
    </section>
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
