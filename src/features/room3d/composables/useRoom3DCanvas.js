import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { PRODUCTS_3D } from '../core/mockData'
import { useRoomCameraControls } from './useRoomCameraControls'
import { useRoomFurnitureInteraction } from './useRoomFurnitureInteraction'
import { useRoomModelLoader } from './useRoomModelLoader'
import { setupSceneVisuals } from '../lib/room3DSceneVisuals'
import { useRoom3dProduct } from './useRoom3dProduct'
import { useRoomScaleManager } from './useRoomScaleManager'

export function useRoom3DCanvas(props, emit) {
  const { t } = useI18n()
  const { fetchProduct } = useRoom3dProduct()

  const hasRoom = computed(() => Boolean(props.selectedRoom))
  const isRoomAvailable = computed(() => Boolean(props.selectedRoom?.modelUrl))
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
    applyUserOverrides: (model) => applyUserOverrides(model),
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
      // Silent fail
    }
  })

  const {
    roomScaleLabel,
    canDecreaseRoomScale,
    canIncreaseRoomScale,
    applyUserOverrides,
    syncRoomBoundsFromModel,
    clampFurnitureToScaledRoom,
    applyRoomScale,
    increaseRoomScale,
    decreaseRoomScale,
    resetRoomScale,
  } = useRoomScaleManager({
    roomModelGroup,
    furnitureGroups,
    floorGridRef,
    productOverrides,
    roomBoundsRef,
    resizeRendererToShell,
  })

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
        prevItemsSnapshot.value = props.sceneItems.map(i => `${i.instanceId}:${i.variantId}`).join(',')
      }
    },
  )

  watch(
    () => props.selectedRoom?.modelUrl,
    async (nextModelUrl, previousModelUrl) => {
      if (previousModelUrl && nextModelUrl !== previousModelUrl) {
        resetRoomScale()
      }
      await loadRoomModel()
      applyRoomScale()
    },
  )

  const prevItemsSnapshot = ref('')

  watch(
    () => props.sceneItems,
    (items) => {
      if (!sceneRef.value?.scene) return

      const currentSnapshot = items.map(i => `${i.instanceId}:${i.variantId}`).join(',')
      if (prevItemsSnapshot.value === currentSnapshot) return

      const oldEntries = prevItemsSnapshot.value ? prevItemsSnapshot.value.split(',') : []
      const newEntries = currentSnapshot ? currentSnapshot.split(',') : []
      
      if (oldEntries.length === newEntries.length && oldEntries.length > 0) {
        const changedEntries = newEntries.filter(e => !oldEntries.includes(e))
        const removedEntries = oldEntries.filter(e => !newEntries.includes(e))
        
        if (changedEntries.length === 1 && removedEntries.length === 1) {
          const newId = changedEntries[0].split(':')[0]
          const oldId = removedEntries[0].split(':')[0]
          
          if (newId === oldId) {
            reloadFurnitureModel(newId)
            prevItemsSnapshot.value = currentSnapshot
            return
          }
        }
      }
      
      loadFurnitureModels()
      prevItemsSnapshot.value = currentSnapshot
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

  return {
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
    isRoomAvailable,
    resetRoomScale,
    emit,
  }
}
