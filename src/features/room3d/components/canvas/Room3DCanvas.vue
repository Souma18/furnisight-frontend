<script setup>
import {
  AmbientLight,
  Box,
  Camera,
  DirectionalLight,
  Plane,
  Renderer,
  Scene,
} from 'troisjs'
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoom3DCanvas } from '../../composables/useRoom3DCanvas'
import { LIGHTING_PRESET } from '../../lib/room3DSceneVisuals'
import AppIcon from '@shared/ui/AppIcon.vue'
import AppButton from '@shared/ui/AppButton.vue'
import Room3DBadge from './Room3DBadge.vue'
import Room3DBottomControls from './Room3DBottomControls.vue'
import Room3DFurniturePanel from './Room3DFurniturePanel.vue'
import Room3DOverlay from './Room3DOverlay.vue'

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

const emit = defineEmits([
  'remove-scene-item',
  'add-scene-product',
  'add-product',
  'update-variant',
  'room-loading-change',
])

const {
  t,
  hasRoom,
  shellRef,
  rendererRef,
  sceneRef,
  cameraRef,
  shouldRenderRoomFallback,
  selectedSceneItem,
  selectedProduct,
  isSelectedInCart,
  viewMode,
  isFullscreen,
  focusCameraToRoom,
  setTopView,
  setFrontView,
  toggleFullscreen,
  selectedSceneItemId,
  selectedScale,
  selectedColor,
  selectedRotationY,
  isDragOverCanvas,
  onCanvasDragEnter,
  onCanvasDragOver,
  onCanvasDragLeave,
  onCanvasDrop,
  updateSelectedScale,
  updateSelectedColor,
  removeSelectedProduct,
  deselectProduct,
  addSelectedProductToCart,
  resetSelectedColor,
  updateSelectedRotation,
  rotateSelected,
  nudgeSelected,
  selectedScreenPos,
  roomScaleLabel,
  canDecreaseRoomScale,
  canIncreaseRoomScale,
  increaseRoomScale,
  decreaseRoomScale,
  fallbackProductIds,
  isCanvasBusy,
  busyText,
} = useRoom3DCanvas(props, emit)

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
      @close="deselectProduct"
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
