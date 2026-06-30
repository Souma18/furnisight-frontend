<script setup>
import '../styles/room3d.css'
import AppButton from '@shared/ui/AppButton.vue'
import { computed, defineAsyncComponent, onMounted, ref, unref } from 'vue'
import { NConfigProvider } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useRoom3D } from '../composables/useRoom3D'
import Room3DTopbar from '../components/layout/Room3DTopbar.vue'
import Room3DLeftPanel from '../components/left-panel/Room3DLeftPanel.vue'
import Room3DRightPanel from '../components/right-panel/Room3DRightPanel.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const Room3DCanvas = defineAsyncComponent(() => import('../components/canvas/Room3DCanvas.vue'))

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
const leftPanelWidth = ref(264)
const rightPanelWidth = ref(324)

function startResizeLeftPanel(e) {
  e.preventDefault()
  const startX = e.clientX
  const startWidth = leftPanelWidth.value

  function onMouseMove(moveEvent) {
    const delta = moveEvent.clientX - startX
    let newWidth = startWidth + delta
    if (newWidth < 220) newWidth = 220
    if (newWidth > 500) newWidth = 500
    leftPanelWidth.value = newWidth
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.body.style.cursor = ''
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  document.body.style.cursor = 'ew-resize'
}

function startResizeRightPanel(e) {
  e.preventDefault()
  const startX = e.clientX
  const startWidth = rightPanelWidth.value

  function onMouseMove(moveEvent) {
    const delta = startX - moveEvent.clientX
    let newWidth = startWidth + delta
    if (newWidth < 280) newWidth = 280
    if (newWidth > 600) newWidth = 600
    rightPanelWidth.value = newWidth
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.body.style.cursor = ''
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  document.body.style.cursor = 'ew-resize'
}
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
  <NConfigProvider style="display: contents">
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
        <AppButton
          v-for="view in workspaceViews"
          :key="view.key"
          type="button"
          :class="{ active: mobileView === view.key }"
          @click="mobileView = view.key"
        >
          <AppIcon :name="view.icon" :size="16" />
          <span>{{ view.label }}</span>
        </AppButton>
      </nav>

      <div class="room-body" :data-mobile-view="mobileView" :style="{ '--left-panel-width': leftPanelWidth + 'px', '--right-panel-width': rightPanelWidth + 'px' }">
        <div class="room-pane room-pane--setup" :class="{ active: mobileView === 'setup' }" style="position: relative;">
          <div class="panel-resizer panel-resizer--right" @mousedown="startResizeLeftPanel"></div>
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

        <div class="room-pane room-pane--products" :class="{ active: mobileView === 'products' }" style="position: relative;">
          <div class="panel-resizer panel-resizer--left" @mousedown="startResizeRightPanel"></div>
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
