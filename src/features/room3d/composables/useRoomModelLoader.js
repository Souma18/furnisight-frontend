import { computed, ref } from 'vue'
import { Box3, Vector3, Cache } from 'three'

Cache.enabled = true
import { PRODUCTS_3D } from '../core/mockData'
import {
  applyColorToModel,
  boostDarkMaterials,
  captureOriginalMaterialColors,
  modelLooksNeutralGray,
} from '../lib/room3DMaterials'
import { centerRoomModelOnXYGrid, removeObject3D } from '../lib/room3DObjects'
import { getPlacementPosition } from '../lib/room3DPlacement'

const DEFAULT_ROOM_BOUNDS = { minX: -3.2, maxX: 3.2, minZ: -3.2, maxZ: 3.2, floorY: 0 }

export function useRoomModelLoader({
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
  useRealDimensions,
}) {
  const isModelLoading = ref(false)
  let roomLoadToken = 0
  const productMap = computed(() => {
    const map = new Map(PRODUCTS_3D.map((item) => [String(item.id), item]))
    if (Array.isArray(props.availableProducts)) {
      props.availableProducts.forEach((item) => {
        map.set(String(item.id), item)
      })
    }
    if (fullSelectedProduct?.value?.id) {
      map.set(String(fullSelectedProduct.value.id), fullSelectedProduct.value)
    }
    return map
  })
  let loaderInstance = null
  let furnitureLoadToken = 0

  async function getLoader() {
    if (!loaderInstance) {
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      loaderInstance = new GLTFLoader()
    }
    return loaderInstance
  }

  const fallbackProductIds = computed(() =>
    props.selectedRoom?.modelUrl
      ? props.sceneItems.filter((item) => !loadedFurnitureIds.value.includes(item.instanceId))
      : [],
  )

  function normalizeFurnitureModel(model, sceneItem, index) {
    const product = productMap.value.get(String(sceneItem.productId))
    const fallback = product?.fallback ?? { width: 0.9, height: 0.9, depth: 0.9 }
    const existingOverride = productOverrides.value[sceneItem.instanceId] ?? {}
    const originalBox = new Box3().setFromObject(model)
    const size = originalBox.getSize(new Vector3())

    let fitScale

    const variant = product?.variants?.find(v => v.id === sceneItem.variantId)
      || product?.variants?.find(v => v.modelUrl || v.supports3d)
    
    // 1st priority: variant-level dimensions
    const rLength = variant?.length ?? variant?.dimensions?.length
    const rWidth = variant?.width ?? variant?.dimensions?.width
    const rHeight = variant?.height ?? variant?.dimensions?.height

    // 2nd priority: product-level dimensions (fallback when variant has no dims)
    const pLength = product?.length ?? product?.dimensions?.length
    const pWidth = product?.width ?? product?.dimensions?.width
    const pHeight = product?.height ?? product?.dimensions?.height

    const finalLength = (rLength > 0 ? rLength : null) ?? (pLength > 0 ? pLength : null)
    const finalWidth  = (rWidth  > 0 ? rWidth  : null) ?? (pWidth  > 0 ? pWidth  : null)
    const finalHeight = (rHeight > 0 ? rHeight : null) ?? (pHeight > 0 ? pHeight : null)

    if (finalLength > 0 && finalWidth > 0 && finalHeight > 0) {
      // Convert cm → scene units (1 unit = 1 m)
      const targetW = finalWidth * 0.01
      const targetH = finalHeight * 0.01
      const targetD = finalLength * 0.01
      const sx = size.x > 0.001 ? targetW / size.x : 1
      const sy = size.y > 0.001 ? targetH / size.y : 1
      const sz = size.z > 0.001 ? targetD / size.z : 1
      fitScale = Math.cbrt(sx * sy * sz) // geometric mean preserves proportions
    } else {
      // 3rd priority: fallback box when no dimensions available at all
      const sx = fallback.width / Math.max(size.x || 1, 0.001)
      const sy = fallback.height / Math.max(size.y || 1, 0.001)
      const sz = fallback.depth / Math.max(size.z || 1, 0.001)
      fitScale = Math.min(sx, sy, sz) * 0.98
    }

    model.scale.setScalar(fitScale)
    model.userData.baseScale = model.scale.clone()
    model.userData.productId = product.id
    model.userData.instanceId = sceneItem.instanceId
    captureOriginalMaterialColors(model)
    model.userData.isNeutralGray = modelLooksNeutralGray(model)

    const placementIndex = sceneItem.placementIndex ?? index
    const pos =
      existingOverride.position ??
      sceneItem.initialPosition ??
      getPlacementPosition(roomBoundsRef.value, placementIndex)
    model.position.set(pos.x, 0, pos.z)
    model.rotation.set(0, existingOverride.rotationY ?? 0, 0)

    const floorY = roomBoundsRef.value.floorY ?? 0
    const fittedBox = new Box3().setFromObject(model)
    model.position.y += floorY - fittedBox.min.y + 0.005

    if (model.userData.isNeutralGray && fallback?.color) {
      applyColorToModel(model, fallback.color)
    }
    boostDarkMaterials(model)

    productOverrides.value = {
      ...productOverrides.value,
      [sceneItem.instanceId]: {
        ...existingOverride,
        position: { x: pos.x, z: pos.z },
        rotationY: existingOverride.rotationY ?? 0,
      },
    }
  }

  async function loadRoomModel() {
    if (!sceneRef.value?.scene) return

    const currentToken = ++roomLoadToken
    isModelLoading.value = true
    removeObject3D(roomModelGroup.value)
    roomModelGroup.value = null

    if (!props.selectedRoom?.modelUrl) {
      roomBoundsRef.value = { ...DEFAULT_ROOM_BOUNDS }
      isModelLoading.value = false
      return
    }

    try {
      const loader = await getLoader()
      const gltf = await loader.loadAsync(props.selectedRoom.modelUrl)
      if (currentToken !== roomLoadToken) {
        removeObject3D(gltf.scene)
        return
      }
      const model = gltf.scene
      centerRoomModelOnXYGrid(model, 0.9)
      sceneRef.value.scene.add(model)
      roomModelGroup.value = model

      const box = new Box3().setFromObject(model)
      const floorY = Number.isFinite(box.min.y) ? box.min.y : 0
      roomBoundsRef.value = {
        minX: Number.isFinite(box.min.x) ? box.min.x : DEFAULT_ROOM_BOUNDS.minX,
        maxX: Number.isFinite(box.max.x) ? box.max.x : DEFAULT_ROOM_BOUNDS.maxX,
        minZ: Number.isFinite(box.min.z) ? box.min.z : DEFAULT_ROOM_BOUNDS.minZ,
        maxZ: Number.isFinite(box.max.z) ? box.max.z : DEFAULT_ROOM_BOUNDS.maxZ,
        floorY,
      }
      if (floorGridRef.value) {
        floorGridRef.value.position.y = floorY - 0.03
      }

      requestAnimationFrame(() => {
        focusCameraToRoom()
        resizeRendererToShell()
      })
    } catch (err) {
      // Silent fail
    } finally {
      if (currentToken === roomLoadToken) {
        isModelLoading.value = false
      }
    }
  }

  async function loadFurnitureModels() {
    if (!sceneRef.value?.scene) return

    const currentToken = ++furnitureLoadToken
    furnitureGroups.value.forEach(removeObject3D)
    furnitureGroups.value = []
    loadedFurnitureIds.value = []

    const loaded = []

    await Promise.all(
      props.sceneItems.map(async (sceneItem, index) => {
        const product = productMap.value.get(String(sceneItem.productId))
        const variant = product?.variants?.find(v => v.id === sceneItem.variantId) || product?.variants?.find(v => v.modelUrl || v.supports3d)
        const modelUrl = variant?.modelUrl
        if (!modelUrl) return

        try {
          const loader = await getLoader()
          const gltf = await loader.loadAsync(modelUrl)
          if (currentToken !== furnitureLoadToken) return
          const model = gltf.scene
          normalizeFurnitureModel(model, sceneItem, index)
          applyUserOverrides(model)
          sceneRef.value.scene.add(model)
          furnitureGroups.value.push(model)
          loaded.push(sceneItem.instanceId)
        } catch (err) {
          // Silent fail
        }
      }),
    )

    if (currentToken === furnitureLoadToken) {
      loadedFurnitureIds.value = loaded
    }
  }

  function cleanupModels() {
    removeObject3D(floorGridRef.value)
    floorGridRef.value = null
    removeObject3D(roomModelGroup.value)
    furnitureGroups.value.forEach(removeObject3D)
    furnitureGroups.value = []
    loadedFurnitureIds.value = []
  }

  async function reloadFurnitureModel(instanceId, overrideModelUrl = null) {
    if (!sceneRef.value?.scene) return

    const sceneItem = props.sceneItems.find((i) => i.instanceId === instanceId)
    if (!sceneItem) return
    const index = props.sceneItems.findIndex((i) => i.instanceId === instanceId)

    let modelUrl = overrideModelUrl
    if (!modelUrl) {
      const product = productMap.value.get(String(sceneItem.productId))
      const variant = product?.variants?.find(v => v.id === sceneItem.variantId) || product?.variants?.find(v => v.modelUrl || v.supports3d)
      modelUrl = variant?.modelUrl
    }
    
    if (!modelUrl) return

    const oldModelIndex = furnitureGroups.value.findIndex(m => m.userData.instanceId === instanceId)
    
    let oldPosition, oldRotation
    if (oldModelIndex !== -1) {
      const oldModel = furnitureGroups.value[oldModelIndex]
      oldPosition = oldModel.position.clone()
      oldRotation = oldModel.rotation.clone()
      removeObject3D(oldModel)
      furnitureGroups.value.splice(oldModelIndex, 1)
    }

    try {
      const loader = await getLoader()
      const gltf = await loader.loadAsync(modelUrl)
      const model = gltf.scene
      
      normalizeFurnitureModel(model, sceneItem, index)
      applyUserOverrides(model)
      
      if (oldPosition) {
        model.position.copy(oldPosition)
        model.rotation.copy(oldRotation)
      }
      
      sceneRef.value.scene.add(model)
      furnitureGroups.value.push(model)
    } catch (err) {
      // Silent fail
    } finally { }
  }

  return {
    isModelLoading,
    fallbackProductIds,
    loadRoomModel,
    loadFurnitureModels,
    cleanupModels,
    reloadFurnitureModel,
  }
}
