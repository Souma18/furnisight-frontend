<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  AmbientLight,
  Box,
  Camera,
  DirectionalLight,
  Plane,
  Renderer,
  Scene,
} from 'troisjs'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
  ACESFilmicToneMapping,
  Box3,
  Color,
  GridHelper,
  Plane as MathPlane,
  Raycaster,
  SRGBColorSpace,
  Vector2,
  Vector3,
} from 'three'
import { PRODUCTS_3D } from '../core/mockData'

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
  placedProductIds: {
    type: Array,
    default: () => [],
  },
})

const hasRoom = computed(() => Boolean(props.selectedRoom))
const isRoomAvailable = computed(() => Boolean(props.selectedRoom?.modelUrl))
const emit = defineEmits(['remove-product', 'add-product'])
const shellRef = ref(null)
const rendererRef = ref(null)
const sceneRef = ref(null)
const cameraRef = ref(null)
const roomModelGroup = ref(null)
const furnitureGroups = ref([])
const loadedFurnitureIds = ref([])
const floorGridRef = ref(null)
const roomBoundsRef = ref({ minX: -3.2, maxX: 3.2, minZ: -3.2, maxZ: 3.2, floorY: 0 })
const selectedProductId = ref(null)
const selectedScale = ref({ x: 1, y: 1, z: 1 })
const selectedColor = ref('#ffffff')
const selectedPosition = ref({ x: 0, z: 0 })
const selectedRotationY = ref(0)
const productOverrides = ref({})
let furnitureLoadToken = 0
let orbitControls = null
let controlsRAF = null
const raycaster = new Raycaster()
const pointer = new Vector2()
const dragPlane = new MathPlane(new Vector3(0, 1, 0), 0)
const dragHitPoint = new Vector3()
const dragOffset = new Vector3()
const isDraggingProduct = ref(false)

const productMap = new Map(PRODUCTS_3D.map((item) => [item.id, item]))
const fallbackProductIds = computed(() =>
  props.placedProductIds.filter((id) => !loadedFurnitureIds.value.includes(id)),
)
const shouldRenderRoomFallback = computed(() => hasRoom.value && !roomModelGroup.value)
const viewMode = ref('3d')
const selectedProduct = computed(() =>
  PRODUCTS_3D.find((product) => product.id === selectedProductId.value) ?? null,
)
const isFullscreen = ref(false)
const isModelLoading = ref(false)
const isCanvasBusy = computed(() => props.isAnalyzing || isModelLoading.value)
const busyText = computed(() =>
  props.isAnalyzing ? 'Dang tao mo hinh...' : 'Dang tai mo hinh, vui long cho...',
)
const isSelectedInCart = computed(() =>
  selectedProductId.value ? props.placedProductIds.includes(selectedProductId.value) : false,
)

const loader = new GLTFLoader()

// Lighting preset for "bright interior" rendering.
// You can tweak these values quickly when models look too dark/flat.
const LIGHTING_PRESET = {
  background: 0xe9ecef,
  exposure: 1.45, // Increase if scene is dark (1.0 -> 1.6)
  ambientIntensity: 1.08, // Global base light
  keyLightIntensity: 1.28, // Main light from front/top
  fillLightIntensity: 0.72, // Secondary fill to reduce harsh shadows
}

function focusCameraToRoom() {
  const camera = cameraRef.value?.camera
  if (!camera) return
  camera.position.set(0, 3.4, 8)
  camera.lookAt(0, 1, 0)
  camera.updateProjectionMatrix?.()
  orbitControls?.target?.set(0, 1, 0)
  orbitControls?.update?.()
  viewMode.value = '3d'
}

function setTopView() {
  const camera = cameraRef.value?.camera
  if (!camera) return
  camera.position.set(0, 10, 0.01)
  camera.lookAt(0, 0, 0)
  camera.updateProjectionMatrix?.()
  orbitControls?.target?.set(0, 0, 0)
  orbitControls?.update?.()
  viewMode.value = 'top'
}

function setFrontView() {
  const camera = cameraRef.value?.camera
  if (!camera) return
  camera.position.set(0, 2.6, 9.5)
  camera.lookAt(0, 1, 0)
  camera.updateProjectionMatrix?.()
  orbitControls?.target?.set(0, 1, 0)
  orbitControls?.update?.()
  viewMode.value = 'front'
}

async function toggleFullscreen() {
  const el = shellRef.value
  if (!el) return
  if (document.fullscreenElement !== el) {
    await el.requestFullscreen()
  } else {
    await document.exitFullscreen()
  }
}

function resizeRendererToShell() {
  const renderer = rendererRef.value?.renderer
  const camera = cameraRef.value?.camera
  const shell = shellRef.value
  if (!renderer || !camera || !shell) return

  const width = Math.max(1, shell.clientWidth)
  const height = Math.max(1, shell.clientHeight)
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix?.()
}

function syncFullscreenState() {
  isFullscreen.value = document.fullscreenElement === shellRef.value
  // Recalculate renderer size right after entering/exiting fullscreen.
  requestAnimationFrame(() => {
    resizeRendererToShell()
  })
}

function startControlsLoop() {
  if (controlsRAF) cancelAnimationFrame(controlsRAF)
  const loop = () => {
    orbitControls?.update?.()
    controlsRAF = requestAnimationFrame(loop)
  }
  controlsRAF = requestAnimationFrame(loop)
}

function setupOrbitControls() {
  const camera = cameraRef.value?.camera
  const renderer = rendererRef.value?.renderer
  if (!camera || !renderer?.domElement || orbitControls) return

  orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.enableDamping = true
  orbitControls.dampingFactor = 0.08
  orbitControls.minDistance = 1.5
  orbitControls.maxDistance = 28
  orbitControls.autoRotate = false
  orbitControls.autoRotateSpeed = 0.9
  orbitControls.target.set(0, 1, 0)
  orbitControls.update()
  startControlsLoop()
  renderer.domElement.addEventListener('pointerdown', onCanvasPointerDown)
  renderer.domElement.addEventListener('pointermove', onCanvasPointerMove)
  window.addEventListener('pointerup', onCanvasPointerUp)
}

function getPlacementPosition(index) {
  const bounds = roomBoundsRef.value
  const width = Math.max(1, bounds.maxX - bounds.minX)
  const depth = Math.max(1, bounds.maxZ - bounds.minZ)
  const marginX = width * 0.16
  const marginZ = depth * 0.16
  const minX = bounds.minX + marginX
  const maxX = bounds.maxX - marginX
  const minZ = bounds.minZ + marginZ
  const maxZ = bounds.maxZ - marginZ
  const cols = 4
  const col = index % cols
  const row = Math.floor(index / cols)
  const x = minX + ((maxX - minX) * (col + 0.5)) / cols
  const z = minZ + row * 1.25
  return { x, z: Math.min(z, maxZ) }
}

function clampToRoomBounds(x, z) {
  const bounds = roomBoundsRef.value
  const width = Math.max(1, bounds.maxX - bounds.minX)
  const depth = Math.max(1, bounds.maxZ - bounds.minZ)
  const marginX = width * 0.08
  const marginZ = depth * 0.08
  return {
    x: Math.min(bounds.maxX - marginX, Math.max(bounds.minX + marginX, x)),
    z: Math.min(bounds.maxZ - marginZ, Math.max(bounds.minZ + marginZ, z)),
  }
}

function findProductCarrier(object3D) {
  let current = object3D
  while (current) {
    if (current.userData?.productId) return current
    current = current.parent
  }
  return null
}

function applyColorToModel(model, colorHex) {
  if (!model || !colorHex) return
  const color = new Color(colorHex)
  model.traverse((node) => {
    if (!node.isMesh || !node.material) return
    const mats = Array.isArray(node.material) ? node.material : [node.material]
    mats.forEach((mat) => {
      if (mat.color) {
        mat.color.copy(color)
        mat.needsUpdate = true
      }
    })
  })
}

function captureOriginalMaterialColors(model) {
  const snapshot = []
  model.traverse((node) => {
    if (!node.isMesh || !node.material) return
    const mats = Array.isArray(node.material) ? node.material : [node.material]
    mats.forEach((mat) => {
      if (mat?.color) snapshot.push({ material: mat, color: mat.color.clone() })
    })
  })
  model.userData.originalMaterialColors = snapshot
}

function modelLooksNeutralGray(model) {
  let sampleCount = 0
  let neutralCount = 0
  model.traverse((node) => {
    if (!node.isMesh || !node.material) return
    const mats = Array.isArray(node.material) ? node.material : [node.material]
    mats.forEach((mat) => {
      if (!mat?.color) return
      sampleCount += 1
      const { r, g, b } = mat.color
      const delta = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b))
      const hasTexture = Boolean(mat.map)
      if (!hasTexture && delta < 0.035) neutralCount += 1
    })
  })
  if (!sampleCount) return false
  return neutralCount / sampleCount >= 0.7
}

function boostDarkMaterials(model) {
  model.traverse((node) => {
    if (!node.isMesh || !node.material) return
    const mats = Array.isArray(node.material) ? node.material : [node.material]
    mats.forEach((mat) => {
      // For dark/flat models, lift readability in web viewer.
      if (typeof mat.roughness === 'number') mat.roughness = Math.min(mat.roughness, 0.9)
      if (typeof mat.metalness === 'number') mat.metalness = Math.min(mat.metalness, 0.35)
      if (typeof mat.envMapIntensity === 'number') mat.envMapIntensity = Math.max(mat.envMapIntensity, 1.15)
      if (mat.color) {
        mat.color.multiplyScalar(1.06)
      }
      mat.needsUpdate = true
    })
  })
}

function restoreOriginalModelColors(model) {
  const snapshot = model?.userData?.originalMaterialColors
  if (!Array.isArray(snapshot)) return
  snapshot.forEach(({ material, color }) => {
    if (!material?.color || !color) return
    material.color.copy(color)
    material.needsUpdate = true
  })
}

function applyUserOverrides(model) {
  const productId = model?.userData?.productId
  if (!productId) return
  const override = productOverrides.value[productId]
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

function onCanvasPointerDown(event) {
  const renderer = rendererRef.value?.renderer
  const camera = cameraRef.value?.camera
  const scene = sceneRef.value?.scene
  if (!renderer?.domElement || !camera || !scene) return

  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(scene.children, true)
  const picked = hits.map((hit) => findProductCarrier(hit.object)).find(Boolean)
  selectedProductId.value = picked?.userData?.productId ?? null

  if (selectedProductId.value) {
    const override = productOverrides.value[selectedProductId.value] ?? {}
    selectedScale.value = {
      x: override.scale?.x ?? 1,
      y: override.scale?.y ?? 1,
      z: override.scale?.z ?? 1,
    }
    selectedColor.value = override.color ?? '#ffffff'
    selectedPosition.value = {
      x: override.position?.x ?? picked.position.x ?? 0,
      z: override.position?.z ?? picked.position.z ?? 0,
    }
    selectedRotationY.value = override.rotationY ?? picked.rotation.y ?? 0

    const floorY = roomBoundsRef.value.floorY ?? 0
    dragPlane.constant = -floorY
    if (raycaster.ray.intersectPlane(dragPlane, dragHitPoint)) {
      dragOffset.set(picked.position.x - dragHitPoint.x, 0, picked.position.z - dragHitPoint.z)
      isDraggingProduct.value = true
      if (orbitControls) orbitControls.enabled = false
    }
  } else {
    isDraggingProduct.value = false
    if (orbitControls) orbitControls.enabled = true
  }
}

function onCanvasPointerMove(event) {
  if (!isDraggingProduct.value || !selectedProductId.value) return
  const renderer = rendererRef.value?.renderer
  const camera = cameraRef.value?.camera
  if (!renderer?.domElement || !camera) return

  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)

  if (!raycaster.ray.intersectPlane(dragPlane, dragHitPoint)) return
  const next = clampToRoomBounds(dragHitPoint.x + dragOffset.x, dragHitPoint.z + dragOffset.z)
  selectedPosition.value = next

  productOverrides.value = {
    ...productOverrides.value,
    [selectedProductId.value]: {
      ...(productOverrides.value[selectedProductId.value] ?? {}),
      position: next,
    },
  }

  const model = furnitureGroups.value.find((item) => item.userData?.productId === selectedProductId.value)
  if (model) applyUserOverrides(model)
}

function onCanvasPointerUp() {
  if (!isDraggingProduct.value) return
  isDraggingProduct.value = false
  if (orbitControls) orbitControls.enabled = true
}

function normalizeFurnitureModel(model, product, index) {
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
  captureOriginalMaterialColors(model)
  model.userData.isNeutralGray = modelLooksNeutralGray(model)

  const pos = getPlacementPosition(index)
  model.position.set(pos.x, 0, pos.z)
  model.rotation.set(0, 0, 0)

  const floorY = roomBoundsRef.value.floorY ?? 0
  const fittedBox = new Box3().setFromObject(model)
  model.position.y += floorY - fittedBox.min.y + 0.005

  // If the asset has no real albedo/texture and appears neutral gray,
  // tint it with fallback color so users can distinguish furniture better.
  if (model.userData.isNeutralGray && fallback?.color) {
    applyColorToModel(model, fallback.color)
  }
  boostDarkMaterials(model)

  productOverrides.value = {
    ...productOverrides.value,
    [product.id]: {
      ...(productOverrides.value[product.id] ?? {}),
      position: { x: pos.x, z: pos.z },
      rotationY: 0,
    },
  }
}

function updateSelectedScale(axis, value) {
  if (!selectedProductId.value) return
  selectedScale.value = { ...selectedScale.value, [axis]: value }
  productOverrides.value = {
    ...productOverrides.value,
    [selectedProductId.value]: {
      ...(productOverrides.value[selectedProductId.value] ?? {}),
      scale: { ...selectedScale.value, [axis]: value },
    },
  }
  const model = furnitureGroups.value.find((item) => item.userData?.productId === selectedProductId.value)
  if (model) applyUserOverrides(model)
}

function updateSelectedColor(colorHex) {
  if (!selectedProductId.value) return
  selectedColor.value = colorHex
  productOverrides.value = {
    ...productOverrides.value,
    [selectedProductId.value]: {
      ...(productOverrides.value[selectedProductId.value] ?? {}),
      color: colorHex,
    },
  }
  const model = furnitureGroups.value.find((item) => item.userData?.productId === selectedProductId.value)
  if (model) applyUserOverrides(model)
}

function removeSelectedProduct() {
  if (!selectedProductId.value) return
  emit('remove-product', selectedProductId.value)
  selectedProductId.value = null
  if (orbitControls) orbitControls.enabled = true
  isDraggingProduct.value = false
}

function addSelectedProductToCart() {
  if (!selectedProductId.value || isSelectedInCart.value) return
  emit('add-product', selectedProductId.value)
}

function resetSelectedColor() {
  if (!selectedProductId.value) return
  const current = productOverrides.value[selectedProductId.value]
  if (!current) return
  const { color: _removed, ...rest } = current
  productOverrides.value = {
    ...productOverrides.value,
    [selectedProductId.value]: rest,
  }
  const model = furnitureGroups.value.find((item) => item.userData?.productId === selectedProductId.value)
  if (model) applyUserOverrides(model)
}

function updateSelectedRotation(value) {
  if (!selectedProductId.value) return
  selectedRotationY.value = value
  productOverrides.value = {
    ...productOverrides.value,
    [selectedProductId.value]: {
      ...(productOverrides.value[selectedProductId.value] ?? {}),
      rotationY: value,
    },
  }
  const model = furnitureGroups.value.find((item) => item.userData?.productId === selectedProductId.value)
  if (model) applyUserOverrides(model)
}

function rotateSelected(deltaRadians) {
  updateSelectedRotation(selectedRotationY.value + deltaRadians)
}

function removeObject3D(object3D) {
  if (!object3D) return
  object3D.traverse?.((node) => {
    if (node.isMesh) {
      node.geometry?.dispose?.()
      if (Array.isArray(node.material)) {
        node.material.forEach((mat) => mat?.dispose?.())
      } else {
        node.material?.dispose?.()
      }
    }
  })
  object3D.parent?.remove(object3D)
}

function setupSceneVisuals() {
  const scene = sceneRef.value?.scene
  const renderer = rendererRef.value?.renderer
  if (!renderer || !scene) return

  // Color management + tone mapping: helps imported models look less dark.
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = LIGHTING_PRESET.exposure
  renderer.setClearColor(LIGHTING_PRESET.background, 1)

  if (!floorGridRef.value) {
    const floorGrid = new GridHelper(8, 16, 0xb7bdc4, 0xd0d5db)
    floorGrid.position.set(0, 0.02, 0)
    floorGrid.renderOrder = -1

    const materials = Array.isArray(floorGrid.material)
      ? floorGrid.material
      : [floorGrid.material]
    materials.forEach((material) => {
      material.depthTest = true
      material.depthWrite = false
      material.polygonOffset = true
      material.polygonOffsetFactor = 1
      material.polygonOffsetUnits = 1
    })

    scene.add(floorGrid)
    floorGridRef.value = floorGrid
  }
}

async function loadRoomModel() {
  if (!sceneRef.value?.scene) return

  isModelLoading.value = true
  removeObject3D(roomModelGroup.value)
  roomModelGroup.value = null

  if (!props.selectedRoom?.modelUrl) {
    roomBoundsRef.value = { minX: -3.2, maxX: 3.2, minZ: -3.2, maxZ: 3.2, floorY: 0 }
    isModelLoading.value = false
    return
  }

  try {
    const gltf = await loader.loadAsync(props.selectedRoom.modelUrl)
    const model = gltf.scene
    model.position.set(0, 0, 0)
    model.scale.set(0.9, 0.9, 0.9)
    sceneRef.value.scene.add(model)
    roomModelGroup.value = model

    // Snap grid to actual room floor so it never cuts through the model center.
    const box = new Box3().setFromObject(model)
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
    props.placedProductIds.map(async (id, index) => {
      const product = productMap.get(id)
      if (!product?.modelUrl) return

      try {
        const gltf = await loader.loadAsync(product.modelUrl)
        if (currentToken !== furnitureLoadToken) return
        const model = gltf.scene
        normalizeFurnitureModel(model, product, index)
        applyUserOverrides(model)
        sceneRef.value.scene.add(model)
        furnitureGroups.value.push(model)
        loaded.push(id)
      } catch {
        console.warn('[Room3D] Failed to load furniture model:', product.modelUrl)
        // fallback box will render for this item
      }
    }),
  )

  if (currentToken === furnitureLoadToken) {
    loadedFurnitureIds.value = loaded
  }
}

watch(
  () => sceneRef.value?.scene,
  (scene) => {
    if (scene) {
      setupSceneVisuals()
      setupOrbitControls()
      loadRoomModel()
      loadFurnitureModels()
    }
  },
)

watch(
  () => props.selectedRoom?.modelUrl,
  () => {
    loadRoomModel()
  },
)

watch(
  () => props.placedProductIds,
  () => {
    loadFurnitureModels()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (controlsRAF) cancelAnimationFrame(controlsRAF)
  controlsRAF = null
  const renderer = rendererRef.value?.renderer
  renderer?.domElement?.removeEventListener('pointerdown', onCanvasPointerDown)
  renderer?.domElement?.removeEventListener('pointermove', onCanvasPointerMove)
  window.removeEventListener('pointerup', onCanvasPointerUp)
  window.removeEventListener('resize', resizeRendererToShell)
  document.removeEventListener('fullscreenchange', syncFullscreenState)
  orbitControls?.dispose?.()
  orbitControls = null
  removeObject3D(floorGridRef.value)
  floorGridRef.value = null
  removeObject3D(roomModelGroup.value)
  furnitureGroups.value.forEach(removeObject3D)
  furnitureGroups.value = []
  loadedFurnitureIds.value = []
})

onMounted(async () => {
  await nextTick()
  setupSceneVisuals()
  setupOrbitControls()
  focusCameraToRoom()
  syncFullscreenState()
  window.addEventListener('resize', resizeRendererToShell)
  document.addEventListener('fullscreenchange', syncFullscreenState)
})

watch(
  () => props.selectedRoom?.type,
  async () => {
    await nextTick()
    focusCameraToRoom()
  },
)

watch(
  () => props.mode,
  () => {
    if (orbitControls) {
      orbitControls.autoRotate = false
      orbitControls.update()
    }
  },
)

watch(
  () => props.placedProductIds,
  (ids) => {
    if (selectedProductId.value && !ids.includes(selectedProductId.value)) {
      selectedProductId.value = null
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
  <section ref="shellRef" class="canvas-shell">
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
          v-for="(id, index) in fallbackProductIds"
          :key="id"
          :width="0.8"
          :height="0.8"
          :depth="0.8"
          :position="{ x: (index % 4 - 1.5) * 1.3, y: 0.4, z: Math.floor(index / 4) * 1.3 - 1.3 }"
        />
      </Scene>
    </Renderer>

    <div v-if="hasRoom" class="room-badge">
      <span class="room-icon">{{ selectedRoom?.emoji || '🏠' }}</span>
      <span class="room-name">{{ selectedRoom?.name || 'Phong' }}</span>
      <span class="room-ai">AI</span>
    </div>

    <div v-if="hasRoom" class="bottom-controls">
      <div class="view-tabs">
        <button type="button" :class="{ active: viewMode === '3d' }" @click="focusCameraToRoom">3D</button>
        <button type="button" :class="{ active: viewMode === 'top' }" @click="setTopView">Mat bang</button>
        <button type="button" :class="{ active: viewMode === 'front' }" @click="setFrontView">
          Mat dung
        </button>
      </div>
      <button type="button" class="fullscreen-btn" @click="toggleFullscreen">⛶ Xem toan canh 3D</button>
    </div>

    <div v-if="selectedProduct" class="item-quick-panel">
      <div class="panel-head">
        <strong>{{ selectedProduct.name }}</strong>
        <button type="button" class="close-btn" @click="selectedProductId = null">✕</button>
      </div>

      <div class="panel-row">
        <label>Rong</label>
        <input
          type="range"
          min="0.5"
          max="1.8"
          step="0.05"
          :value="selectedScale.x"
          @input="updateSelectedScale('x', Number($event.target.value))"
        />
      </div>
      <div class="panel-row">
        <label>Cao</label>
        <input
          type="range"
          min="0.5"
          max="1.8"
          step="0.05"
          :value="selectedScale.y"
          @input="updateSelectedScale('y', Number($event.target.value))"
        />
      </div>
      <div class="panel-row">
        <label>Sau</label>
        <input
          type="range"
          min="0.5"
          max="1.8"
          step="0.05"
          :value="selectedScale.z"
          @input="updateSelectedScale('z', Number($event.target.value))"
        />
      </div>
      <div class="panel-row">
        <label>Mau</label>
        <input type="color" :value="selectedColor" @input="updateSelectedColor($event.target.value)" />
      </div>
      <div class="panel-row">
        <label>Xoay</label>
        <input
          type="range"
          min="-3.1416"
          max="3.1416"
          step="0.02"
          :value="selectedRotationY"
          @input="updateSelectedRotation(Number($event.target.value))"
        />
      </div>
      <div class="rotate-actions">
        <button type="button" class="action-btn ghost" @click="rotateSelected(-0.2618)">↺ -15°</button>
        <button type="button" class="action-btn ghost" @click="rotateSelected(0.2618)">↻ +15°</button>
      </div>
      <p class="drag-hint">Keo tha truc tiep tren san de dat vat the vao bat ky vi tri nao.</p>

      <div class="panel-actions">
        <button type="button" class="action-btn ghost" @click="resetSelectedColor">Mau mac dinh</button>
        <button
          type="button"
          class="action-btn primary"
          :disabled="isSelectedInCart"
          @click="addSelectedProductToCart"
        >
          {{ isSelectedInCart ? 'Da co trong gio' : 'Them vao gio' }}
        </button>
        <button type="button" class="action-btn danger" @click="removeSelectedProduct">Xoa khoi phong</button>
      </div>
    </div>

    <div v-if="!hasRoom" class="empty">
      <div class="empty-icon">🧊</div>
      <h2>Truc quan can nha cua ban</h2>
      <p>Tai anh phong hoac chon phong co san de bat dau.</p>
    </div>

    <div v-else-if="!isRoomAvailable" class="empty">
      <div class="empty-icon">🏗️</div>
      <h2>Phong dang bo sung model</h2>
      <p>Vui long chon phong co san khac de truc quan 3D.</p>
    </div>

    <div v-if="isCanvasBusy" class="busy-overlay">
      <div class="busy-spinner"></div>
      <p>{{ busyText }}</p>
    </div>

    <button v-if="isFullscreen" type="button" class="exit-fullscreen-btn" @click="toggleFullscreen">
      ✕ Thoat toan canh
    </button>
  </section>
</template>

<style scoped>
.canvas-shell {
  position: relative;
  height: 100%;
  width: 100%;
  background: #e9ecef;
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
.empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
  color: #6b7280;
  pointer-events: none;
}
.empty-icon {
  font-size: 3rem;
}
.empty h2 {
  margin: 0;
}
.empty p {
  margin: 0;
}

.busy-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  z-index: 12;
}

.busy-spinner {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  border: 3px solid rgba(255, 255, 255, 0.55);
  border-top-color: #0f3f5c;
  animation: spin 0.8s linear infinite;
}

.busy-overlay p {
  margin: 0;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
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
}

.exit-fullscreen-btn:hover {
  background: #0f3f5c;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.room-badge {
  position: absolute;
  top: 0.9rem;
  left: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.62rem;
  border: 1px solid #e5dfd4;
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.92);
  color: #163f5b;
  font-size: 0.85rem;
  z-index: 8;
}

.room-icon {
  font-size: 0.9rem;
}

.room-name {
  font-weight: 600;
}

.room-ai {
  background: #f6b22f;
  color: #0f3f5c;
  border-radius: 999px;
  padding: 0.08rem 0.38rem;
  font-size: 0.66rem;
  font-weight: 700;
}

.bottom-controls {
  position: absolute;
  left: 50%;
  bottom: 1rem;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  z-index: 8;
}

.view-tabs {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.24rem;
  border: 1px solid #e5dfd4;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
}

.view-tabs button {
  border: 1px solid rgba(16, 49, 70, 0.15);
  background: transparent;
  color: #0f3954;
  padding: 0.35rem 0.72rem;
  border-radius: 999px;
  font-size: 0.78rem;
  cursor: pointer;
}

.view-tabs button:hover {
  border-color: #d4c3aa;
}

.view-tabs button.active {
  background: #103952;
  color: #f7b340;
  border-color: #103952;
}

.fullscreen-btn {
  border: none;
  background: #103952;
  color: #f7f9fb;
  padding: 0.52rem 0.95rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.fullscreen-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(16, 57, 82, 0.25);
}

.item-quick-panel {
  position: absolute;
  right: 1rem;
  top: 1rem;
  width: 16.4rem;
  border: 1px solid #e4dccf;
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(6px);
  box-shadow: 0 10px 24px rgba(16, 57, 82, 0.14);
  padding: 0.62rem;
  z-index: 9;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.panel-head strong {
  font-size: 0.84rem;
  color: #1e3342;
}

.close-btn {
  border: none;
  background: #f3efe8;
  color: #5a6772;
  border-radius: 0.4rem;
  width: 1.4rem;
  height: 1.4rem;
  cursor: pointer;
}

.panel-row {
  display: grid;
  grid-template-columns: 2.1rem minmax(0, 1fr);
  gap: 0.45rem;
  align-items: center;
  margin-bottom: 0.35rem;
}

.panel-row label {
  font-size: 0.74rem;
  color: #596572;
}

.panel-row input[type='range'] {
  width: 100%;
}

.panel-row input[type='color'] {
  width: 100%;
  height: 1.5rem;
  border: 1px solid #d8cec1;
  border-radius: 0.35rem;
  background: #fff;
  padding: 0.1rem;
  cursor: pointer;
}

.rotate-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
  margin-top: 0.2rem;
}

.drag-hint {
  margin: 0.35rem 0 0;
  color: #65727e;
  font-size: 0.72rem;
  line-height: 1.3;
}

.panel-actions {
  margin-top: 0.45rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.35rem;
}

.action-btn {
  width: 100%;
  border: none;
  border-radius: 0.5rem;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.42rem 0.6rem;
  cursor: pointer;
  transition: filter 0.16s ease, opacity 0.16s ease;
}

.action-btn:hover:not(:disabled) {
  filter: brightness(0.96);
}

.action-btn:disabled {
  cursor: default;
  opacity: 0.6;
}

.action-btn.ghost {
  background: #f0ece4;
  color: #3f515f;
}

.action-btn.primary {
  background: #104261;
}

.action-btn.danger {
  background: #e85f5f;
}

.action-btn.danger:hover:not(:disabled) {
  background: #dd4d4d;
}
</style>
