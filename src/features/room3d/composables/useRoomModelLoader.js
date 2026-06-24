import { computed, ref } from 'vue'
import { Box3, Vector3 } from 'three'
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
}) {
  const isModelLoading = ref(false)
  const productMap = computed(() => {
    const map = new Map(PRODUCTS_3D.map((item) => [item.id, item]))
    if (Array.isArray(props.availableProducts)) {
      props.availableProducts.forEach((item) => {
        map.set(item.id, item)
      })
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
    const product = productMap.value.get(sceneItem.productId)
    const fallback = product?.fallback ?? { width: 0.9, height: 0.9, depth: 0.9 }
    const originalBox = new Box3().setFromObject(model)
    const size = originalBox.getSize(new Vector3())
    const sx = fallback.width / Math.max(size.x || 1, 0.001)
    const sy = fallback.height / Math.max(size.y || 1, 0.001)
    const sz = fallback.depth / Math.max(size.z || 1, 0.001)
    const fitScale = Math.min(sx, sy, sz) * 0.98

    model.scale.setScalar(fitScale)
    model.userData.baseScale = model.scale.clone()
    model.userData.productId = product.id
    model.userData.instanceId = sceneItem.instanceId
    captureOriginalMaterialColors(model)
    model.userData.isNeutralGray = modelLooksNeutralGray(model)

    const pos = sceneItem.initialPosition ?? getPlacementPosition(roomBoundsRef.value, index)
    model.position.set(pos.x, 0, pos.z)
    model.rotation.set(0, 0, 0)

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
        ...(productOverrides.value[sceneItem.instanceId] ?? {}),
        position: { x: pos.x, z: pos.z },
        rotationY: 0,
      },
    }
  }

  async function loadRoomModel() {
    if (!sceneRef.value?.scene) return

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
    } catch {
      console.warn('[Room3D] Failed to load room model:', props.selectedRoom.modelUrl)
      roomModelGroup.value = null
    } finally {
      isModelLoading.value = false
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
        const product = productMap.value.get(sceneItem.productId)
        if (!product?.modelUrl) return

        try {
          const loader = await getLoader()
          const gltf = await loader.loadAsync(product.modelUrl)
          if (currentToken !== furnitureLoadToken) return
          const model = gltf.scene
          normalizeFurnitureModel(model, sceneItem, index)
          applyUserOverrides(model)
          sceneRef.value.scene.add(model)
          furnitureGroups.value.push(model)
          loaded.push(sceneItem.instanceId)
        } catch {
          console.warn('[Room3D] Failed to load furniture model:', product.modelUrl)
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

  return {
    isModelLoading,
    fallbackProductIds,
    loadRoomModel,
    loadFurnitureModels,
    cleanupModels,
  }
}
