<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  AmbientLight,
  Box,
  Camera,
  DirectionalLight,
  Plane,
  Renderer,
  Scene,
} from 'troisjs'
import {
  Box3,
} from 'three'
import { PRODUCTS_3D } from '../core/mockData'
import { useRoomCameraControls } from '../composables/useRoomCameraControls'
import { useRoomFurnitureInteraction } from '../composables/useRoomFurnitureInteraction'
import { useRoomModelLoader } from '../composables/useRoomModelLoader'
import {
  room3dApi,
} from '@shared/lib/api/services'
import { ProductResponse } from '@shared/lib/api/services/products/products.model'
import {
  applyColorToModel,
  restoreOriginalModelColors,
} from '../lib/room3DMaterials'
import { LIGHTING_PRESET, setupSceneVisuals } from '../lib/room3DSceneVisuals'
import { clampToRoomBounds } from '../lib/room3DPlacement'
import { centerRoomModelOnXYGrid } from '../lib/room3DObjects'
import { useRoom3dProduct } from '../composables/useRoom3dProduct'
import AppIcon from '@shared/ui/AppIcon.vue'
import Room3DBadge from './Room3DBadge.vue'
import Room3DBottomControls from './Room3DBottomControls.vue'
import Room3DFurniturePanel from './Room3DFurniturePanel.vue'
import Room3DOverlay from './Room3DOverlay.vue'

const { t } = useI18n()
const { fetchProduct } = useRoom3dProduct()

const props = defineProps({
  mode: {
    type: String,
    default: 'upload',
  },
  isAnalyzing: {
    type: Boolean,
    default: false,
  },
  selectedRoom: {
    type: Object,
    default: null,
  },
  sceneItems: {
    type: Array,
    default: () => [],
  },
  cartProductIds: {
    type: Array,
    default: () => [],
  },
  availableProducts: {
    type: Array,
    default: () => [],
  },
})

const hasRoom = computed(() => Boolean(props.selectedRoom))
const isRoomAvailable = computed(() => Boolean(props.selectedRoom?.modelUrl))
const emit = defineEmits([
  'remove-scene-item',
  'add-scene-product',
  'add-product',
  'update-variant',
  'room-loading-change',
])
const shellRef = ref(null)
const rendererRef = ref(null)
const sceneRef = ref(null)
const cameraRef = ref(null)
const roomModelGroup = ref(null)
const furnitureGroups = ref([])
const loadedFurnitureIds = ref([])
const floorGridRef = ref(null)
const roomBoundsRef = ref({ minX: -3.2, maxX: 3.2, minZ: -3.2, maxZ: 3.2, floorY: 0 })

const shouldRenderRoomFallback = computed(
  () => hasRoom.value && isRoomAvailable.value && !roomModelGroup.value,
)
const fullSelectedProduct = ref(null)
const roomScaleStep = ref(0)
const ROOM_SCALE_LEVELS = {
  '-3': 0.7,
  '-2': 0.82,
  '-1': 0.92,
  '0': 1,
  '1': 1.12,
  '2': 1.24,
  '3': 1.36,
}
const ROOM_BASE_SCALE = 0.9

const selectedSceneItem = computed(
  () => props.sceneItems.find((item) => item.instanceId === selectedSceneItemId.value) ?? null,
)

const selectedProduct = computed(() =>
  (fullSelectedProduct.value?.id === selectedSceneItem.value?.productId ? fullSelectedProduct.value : null) ??
  props.availableProducts.find((product) => product.id === selectedSceneItem.value?.productId) ??
  PRODUCTS_3D.find((product) => product.id === selectedSceneItem.value?.productId) ?? null,
)
const isSelectedInCart = computed(() =>
  selectedProduct.value ? props.cartProductIds.includes(selectedProduct.value.id) : false,
)
const roomScaleMultiplier = computed(() => ROOM_SCALE_LEVELS[String(roomScaleStep.value)] ?? 1)
const roomScaleLabel = computed(() => {
  if (roomScaleStep.value > 0) return `+${roomScaleStep.value}`
  return String(roomScaleStep.value)
})
const canDecreaseRoomScale = computed(() => roomScaleStep.value > -3)
const canIncreaseRoomScale = computed(() => roomScaleStep.value < 3)

const {
  viewMode,
  isFullscreen,
  focusCameraToRoom,
  setTopView,
  setFrontView,
  toggleFullscreen,
  resizeRendererToShell,
  syncFullscreenState,
  setupOrbitControls,
  setOrbitEnabled,
  disableAutoRotate,
  cleanupOrbitControls,
} = useRoomCameraControls({
  shellRef,
  rendererRef,
  cameraRef,
  roomModelGroup,
})

const {
  selectedSceneItemId,
  selectedScale,
  selectedColor,
  selectedRotationY,
  productOverrides,
  isDragOverCanvas,
  onCanvasPointerDown,
  onCanvasPointerMove,
  onCanvasPointerUp,
  onCanvasDragEnter,
  onCanvasDragOver,
  onCanvasDragLeave,
  onCanvasDrop,
  updateSelectedScale,
  updateSelectedColor,
  removeSelectedProduct,
  addSelectedProductToCart,
  resetSelectedColor,
  updateSelectedRotation,
  rotateSelected,
  nudgeSelected,
  selectedScreenPos,
} = useRoomFurnitureInteraction({
  emit,
  shellRef,
  rendererRef,
  cameraRef,
  sceneRef,
  roomBoundsRef,
  furnitureGroups,
  hasRoom,
  isRoomAvailable,
  selectedProduct,
  isSelectedInCart,
  applyUserOverrides,
  setOrbitEnabled,
})

watch(selectedSceneItemId, async (newId) => {
  if (!newId) {
    fullSelectedProduct.value = null
    return
  }
  const item = props.sceneItems.find((i) => i.instanceId === newId)
  if (!item) return
  
  try {
    fullSelectedProduct.value = await fetchProduct(item.productId)
  } catch (err) {
    console.error('Failed to fetch full product details for variant selection', err)
  }
})

function applyUserOverrides(model) {
  const instanceId = model?.userData?.instanceId
  if (!instanceId) return
  const override = productOverrides.value[instanceId]
  const baseScale = model.userData?.baseScale
  if (baseScale && override?.scale) {
    model.scale.set(
      baseScale.x * override.scale.x,
      baseScale.y * override.scale.y,
      baseScale.z * override.scale.z,
    )
  }
  if (override?.position) {
    model.position.x = override.position.x
    model.position.z = override.position.z
  }
  if (typeof override?.rotationY === 'number') {
    model.rotation.y = override.rotationY
  }
  if (override?.color) {
    applyColorToModel(model, override.color)
  } else {
    restoreOriginalModelColors(model)
  }
  const floorY = roomBoundsRef.value.floorY ?? 0
  const box = new Box3().setFromObject(model)
  model.position.y += floorY - box.min.y + 0.005
}

function syncRoomBoundsFromModel() {
  if (!roomModelGroup.value) {
    roomBoundsRef.value = { minX: -3.2, maxX: 3.2, minZ: -3.2, maxZ: 3.2, floorY: 0 }
    return
  }

  const box = new Box3().setFromObject(roomModelGroup.value)
  const floorY = Number.isFinite(box.min.y) ? box.min.y : 0
  roomBoundsRef.value = {
    minX: Number.isFinite(box.min.x) ? box.min.x : -3.2,
    maxX: Number.isFinite(box.max.x) ? box.max.x : 3.2,
    minZ: Number.isFinite(box.min.z) ? box.min.z : -3.2,
    maxZ: Number.isFinite(box.max.z) ? box.max.z : 3.2,
    floorY,
  }

  if (floorGridRef.value) {
    floorGridRef.value.position.y = floorY - 0.03
  }
}

function clampFurnitureToScaledRoom() {
  if (!furnitureGroups.value.length) return

  furnitureGroups.value.forEach((model) => {
    const instanceId = model.userData?.instanceId
    if (!instanceId) return

    const currentOverride = productOverrides.value[instanceId] ?? {}
    const currentPosition = currentOverride.position ?? {
      x: model.position.x,
      z: model.position.z,
    }
    const nextPosition = clampToRoomBounds(
      roomBoundsRef.value,
      currentPosition.x,
      currentPosition.z,
    )

    productOverrides.value = {
      ...productOverrides.value,
      [instanceId]: {
        ...currentOverride,
        position: nextPosition,
      },
    }

    applyUserOverrides(model)
  })
}

function applyRoomScale() {
  if (!roomModelGroup.value) return

  centerRoomModelOnXYGrid(roomModelGroup.value, ROOM_BASE_SCALE * roomScaleMultiplier.value)
  syncRoomBoundsFromModel()
  clampFurnitureToScaledRoom()

  requestAnimationFrame(() => {
    resizeRendererToShell()
  })
}

function increaseRoomScale() {
  if (!canIncreaseRoomScale.value) return
  roomScaleStep.value += 1
}

function decreaseRoomScale() {
  if (!canDecreaseRoomScale.value) return
  roomScaleStep.value -= 1
}

function resetRoomScale() {
  roomScaleStep.value = 0
}

const {
  isModelLoading,
  fallbackProductIds,
  loadRoomModel,
  loadFurnitureModels,
  cleanupModels,
  reloadFurnitureModel,
} = useRoomModelLoader({
  props,
  sceneRef,
  roomModelGroup,
  furnitureGroups,
  loadedFurnitureIds,
  floorGridRef,
  roomBoundsRef,
  productOverrides,
  applyUserOverrides,
  focusCameraToRoom,
  resizeRendererToShell,
  fullSelectedProduct,
})

const isCanvasBusy = computed(() => props.isAnalyzing || isModelLoading.value)
const busyText = computed(() =>
  props.isAnalyzing ? t('room3d.canvas.processing') : t('room3d.canvas.loadingModel'),
)

watch(
  isModelLoading,
  (value) => {
    emit('room-loading-change', value)
  },
  { immediate: true },
)

watch(
  () => sceneRef.value?.scene,
  async (scene) => {
    if (scene) {
      setupSceneVisuals({ sceneRef, rendererRef, floorGridRef })
      setupOrbitControls({
        onPointerDown: onCanvasPointerDown,
        onPointerMove: onCanvasPointerMove,
        onPointerUp: onCanvasPointerUp,
      })
      await loadRoomModel()
      applyRoomScale()
      loadFurnitureModels()
    }
  },
)

watch(
  () => props.selectedRoom?.modelUrl,
  async (nextModelUrl, previousModelUrl) => {
    if (previousModelUrl && nextModelUrl !== previousModelUrl) {
      roomScaleStep.value = 0
    }
    await loadRoomModel()
    applyRoomScale()
  },
)

watch(
  () => props.sceneItems,
  () => {
    loadFurnitureModels()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  cleanupOrbitControls()
  window.removeEventListener('resize', resizeRendererToShell)
  document.removeEventListener('fullscreenchange', syncFullscreenState)
  cleanupModels()
})

onMounted(async () => {
  await nextTick()
  setupSceneVisuals({ sceneRef, rendererRef, floorGridRef })
  setupOrbitControls({
    onPointerDown: onCanvasPointerDown,
    onPointerMove: onCanvasPointerMove,
    onPointerUp: onCanvasPointerUp,
  })
  focusCameraToRoom()
  syncFullscreenState()
  window.addEventListener('resize', resizeRendererToShell)
  document.addEventListener('fullscreenchange', syncFullscreenState)
})

watch(
  () => props.selectedRoom?.modelUrl,
  async () => {
    await nextTick()
    requestAnimationFrame(() => {
      focusCameraToRoom()
      resizeRendererToShell()
    })
  },
)

watch(
  () => props.selectedRoom?.type,
  async () => {
    await nextTick()
    requestAnimationFrame(() => {
      focusCameraToRoom()
      resizeRendererToShell()
    })
  },
)

watch(roomScaleStep, () => {
  applyRoomScale()
})

watch(
  () => props.mode,
  () => {
    disableAutoRotate()
  },
)

watch(
  () => props.sceneItems,
  (ids) => {
    if (selectedSceneItemId.value && !ids.some((item) => item.instanceId === selectedSceneItemId.value)) {
      selectedSceneItemId.value = null
    }
  },
  { deep: true },
)

defineExpose({
  resetView: focusCameraToRoom,
  topView: setTopView,
  frontView: setFrontView,
  toggleFullscreen,
})
</script>

<template>
  <section
    ref="shellRef"
    class="canvas-shell"
    :class="{ 'canvas-shell--drag-over': isDragOverCanvas }"
    @dragenter="onCanvasDragEnter"
    @dragover="onCanvasDragOver"
    @dragleave="onCanvasDragLeave"
    @drop="onCanvasDrop"
  >
    <Renderer ref="rendererRef" antialias resize>
      <Camera ref="cameraRef" :position="{ x: 0, y: 3.4, z: 8 }" />
      <Scene ref="sceneRef">
        <!-- Ambient: brighten overall dark materials -->
        <AmbientLight :intensity="LIGHTING_PRESET.ambientIntensity" />
        <!-- Key light: main light source -->
        <DirectionalLight :position="{ x: 6, y: 9, z: 5 }" :intensity="LIGHTING_PRESET.keyLightIntensity" />
        <!-- Fill light: soften shadows from opposite side -->
        <DirectionalLight
          :position="{ x: -5, y: 6, z: -4 }"
          :intensity="LIGHTING_PRESET.fillLightIntensity"
        />
        <Plane
          v-if="shouldRenderRoomFallback"
          :width="8"
          :height="8"
          :rotation="{ x: -Math.PI / 2, y: 0, z: 0 }"
          :position="{ x: 0, y: 0, z: 0 }"
        />
        <Plane
          v-if="shouldRenderRoomFallback"
          :width="8"
          :height="3.5"
          :position="{ x: 0, y: 1.75, z: -4 }"
        />
        <Box
          v-if="shouldRenderRoomFallback"
          :width="0.35"
          :height="0.35"
          :depth="0.35"
          :position="{ x: 0, y: 0.18, z: 0 }"
        />

        <Box
          v-for="(sceneItem, index) in fallbackProductIds"
          :key="sceneItem.instanceId"
          :width="0.8"
          :height="0.8"
          :depth="0.8"
          :position="{
            x: sceneItem.initialPosition?.x ?? ((sceneItem.placementIndex ?? index) % 4 - 1.5) * 1.3,
            y: 0.4,
            z: sceneItem.initialPosition?.z ?? Math.floor((sceneItem.placementIndex ?? index) / 4) * 1.3 - 1.3,
          }"
        />
      </Scene>
    </Renderer>

    <Room3DBadge
      :has-room="hasRoom"
      :selected-room="selectedRoom"
    />

    <Room3DBottomControls
      :has-room="hasRoom"
      :view-mode="viewMode"
      :is-fullscreen="isFullscreen"
      :room-scale-label="roomScaleLabel"
      :can-decrease-room-scale="canDecreaseRoomScale"
      :can-increase-room-scale="canIncreaseRoomScale"
      @focus-camera="focusCameraToRoom"
      @set-top-view="setTopView"
      @set-front-view="setFrontView"
      @decrease-room-scale="decreaseRoomScale"
      @increase-room-scale="increaseRoomScale"
      @reset-room-scale="resetRoomScale"
      @toggle-fullscreen="toggleFullscreen"
    />

    <Room3DFurniturePanel
      :selected-product="selectedProduct"
      :selected-scene-item="selectedSceneItem"
      :selected-scale="selectedScale"
      :selected-color="selectedColor"
      :selected-rotation-y="selectedRotationY"
      :is-selected-in-cart="isSelectedInCart"
      :screen-pos="selectedScreenPos"
      @close="selectedSceneItemId = null"
      @update-variant="(instanceId, variantId) => { 
        $emit('update-variant', instanceId, variantId);
      }"
      @update-scale="updateSelectedScale"
      @update-color="updateSelectedColor"
      @update-rotation="updateSelectedRotation"
      @rotate-selected="rotateSelected"
      @nudge-selected="nudgeSelected"
      @reset-color="resetSelectedColor"
      @add-to-cart="addSelectedProductToCart"
      @remove-product="removeSelectedProduct"
    />

    <Room3DOverlay
      :has-room="hasRoom"
      :is-room-available="isRoomAvailable"
      :is-canvas-busy="isCanvasBusy"
      :busy-text="busyText"
      :is-drag-over-canvas="isDragOverCanvas"
    />

    <AppButton v-if="isFullscreen" type="button" class="exit-fullscreen-btn" @click="toggleFullscreen">
      <AppIcon name="close" :size="14" />
      <span>Thoát toàn cảnh</span>
    </AppButton>
  </section>
</template>

<style scoped>
.canvas-shell {
  position: relative;
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  background: #e9ecef;
}

.canvas-shell--drag-over {
  box-shadow: inset 0 0 0 3px rgba(15, 63, 92, 0.34);
}

.canvas-shell:fullscreen {
  width: 100vw;
  height: 100vh;
  background: #e9ecef;
}
:deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.exit-fullscreen-btn {
  position: absolute;
  top: 0.9rem;
  right: 1rem;
  z-index: 20;
  border: none;
  border-radius: 999px;
  background: rgba(16, 57, 82, 0.92);
  color: #f7f9fb;
  padding: 0.45rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.exit-fullscreen-btn:hover {
  background: #0f3f5c;
}
.action-btn.danger {
  background: #e85f5f;
}

.action-btn.danger:hover:not(:disabled) {
  background: #dd4d4d;
}
</style>
