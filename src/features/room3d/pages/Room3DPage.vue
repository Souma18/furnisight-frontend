<script setup>
import { computed, defineAsyncComponent, onMounted, ref, unref } from 'vue'
import { NConfigProvider } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useRoom3D } from '../composables/useRoom3D'
import Room3DTopbar from '../components/Room3DTopbar.vue'
import Room3DLeftPanel from '../components/Room3DLeftPanel.vue'
import Room3DRightPanel from '../components/Room3DRightPanel.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const Room3DCanvas = defineAsyncComponent(() => import('../components/Room3DCanvas.vue'))

const { t } = useI18n()
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
const mobileView = ref('canvas')
const isRoomModelLoading = ref(false)
const isLoadingTemplatesValue = computed(() => Boolean(unref(isLoadingTemplates)))
const isRoomSelectionLocked = computed(
  () => Boolean(unref(isLoadingTemplates)) || Boolean(unref(isAnalyzing)) || isRoomModelLoading.value,
)

const workspaceViews = computed(() => [
  { key: 'setup', label: t('room3d.workspace.setup'), icon: 'settings' },
  { key: 'canvas', label: t('room3d.workspace.canvas'), icon: 'cube' },
  { key: 'products', label: t('room3d.workspace.products'), icon: 'armchair' },
])

function toggleFullscreen() {
  canvasRef.value?.toggleFullscreen?.()
}

function handleSelectRoomType(roomType) {
  if (isRoomSelectionLocked.value) return
  vm.selectRoomType(roomType)
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

      <nav class="workspace-nav" :aria-label="t('room3d.workspace.aria')">
        <button
          v-for="view in workspaceViews"
          :key="view.key"
          type="button"
          :class="{ active: mobileView === view.key }"
          @click="mobileView = view.key"
        >
          <AppIcon :name="view.icon" :size="16" />
          <span>{{ view.label }}</span>
        </button>
      </nav>

      <div class="room-body" :data-mobile-view="mobileView">
        <div class="room-pane room-pane--setup" :class="{ active: mobileView === 'setup' }">
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
          :is-room-model-loading="isRoomModelLoading"
          :project-name="projectName"
          :upload-error="uploadError"
          @switch-mode="vm.setMode"
          @upload-image="vm.handleUploadImage"
          @select-room-type="handleSelectRoomType"
          @image-type-change="vm.setImageType"
          @mesh-quality-change="vm.setMeshQuality"
          @quality-change="vm.setQuality"
          @project-name-change="projectName = $event"
          />
        </div>

        <div class="room-pane room-pane--canvas" :class="{ active: mobileView === 'canvas' }">
          <Room3DCanvas
            ref="canvasRef"
            :mode="mode"
            :is-analyzing="isAnalyzing"
            :selected-room="selectedRoom"
            :scene-items="sceneItems"
            :cart-product-ids="placedProductIds"
            :available-products="filteredProducts"
            @add-product="vm.addProductToCart"
            @add-scene-product="vm.addProductToScene"
            @remove-scene-item="vm.removeProductFromScene"
            @update-variant="vm.handleUpdateVariant"
            @room-loading-change="isRoomModelLoading = $event"
          />
        </div>

        <div class="room-pane room-pane--products" :class="{ active: mobileView === 'products' }">
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
      </div>
    </section>
  </NConfigProvider>
</template>

<style scoped>
.room-page {
  display: flex;
  flex-direction: column;
  height: 100svh;
  overflow: hidden;
  background: var(--app-bg);
  color: var(--app-text);
}
.room-body {
  flex: 1;
  display: grid;
  grid-template-columns: 264px minmax(0, 1fr) 324px;
  min-height: 0;
}

.room-pane {
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.room-pane > * {
  height: 100%;
}

.workspace-nav {
  display: none;
}

@media (max-width: 1240px) {
  .room-body {
    grid-template-columns: 240px minmax(0, 1fr) 290px;
  }
}

@media (max-width: 980px) {
  .workspace-nav {
    background: var(--app-surface);
    border-bottom: 1px solid var(--app-border);
    display: grid;
    flex: 0 0 auto;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    padding: 6px 10px;
  }

  .workspace-nav button {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: 6px;
    color: var(--app-text-muted);
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 0.78rem;
    font-weight: 650;
    gap: 6px;
    justify-content: center;
    min-height: 38px;
  }

  .workspace-nav button.active {
    background: var(--app-navy);
    color: var(--app-gold);
  }

  .workspace-nav button:focus-visible {
    outline: 2px solid #c9922a;
    outline-offset: 1px;
  }

  .room-body {
    display: block;
    position: relative;
  }

  .room-pane {
    inset: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    visibility: hidden;
  }

  .room-pane.active {
    opacity: 1;
    pointer-events: auto;
    visibility: visible;
    z-index: 1;
  }
}
</style>
