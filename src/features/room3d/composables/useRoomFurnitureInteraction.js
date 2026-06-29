import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  Box3,
  Plane as MathPlane,
  Raycaster,
  Vector2,
  Vector3,
} from 'three'
import { clampToRoomBounds } from '../lib/room3DPlacement'

function findProductCarrier(object3D) {
  let current = object3D
  while (current) {
    if (current.userData?.instanceId) return current
    current = current.parent
  }
  return null
}

function parseDraggedProductId(event) {
  const raw =
    event.dataTransfer?.getData('application/x-room3d-product') ||
    event.dataTransfer?.getData('text/plain')
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (parsed?.productId) return parsed.productId
  } catch {
    // fallthrough
  }

  const trimmed = String(raw).trim()
  return trimmed ? trimmed : null
}

function hasDraggedProductData(event) {
  const types = Array.from(event.dataTransfer?.types ?? [])
  return (
    types.includes('application/x-room3d-product') ||
    types.includes('text/plain') ||
    types.includes('text')
  )
}

export function useRoomFurnitureInteraction({
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
  selectedSceneItem,
  isSelectedInCart,
  applyUserOverrides,
  setOrbitEnabled,
}) {
  const selectedSceneItemId = ref(null)
  const selectedScale = ref({ x: 1, y: 1, z: 1 })
  const selectedColor = ref('#ffffff')
  const selectedPosition = ref({ x: 0, z: 0 })
  const selectedRotationY = ref(0)
  const productOverrides = ref({})
  const isDraggingProduct = ref(false)
  const isDragOverCanvas = ref(false)
  const selectedScreenPos = ref({ left: 0, top: 0, visible: false })

  let rafId = null
  function updateScreenPos() {
    rafId = requestAnimationFrame(updateScreenPos)
    if (!selectedSceneItemId.value || isDraggingProduct.value) {
      if (selectedScreenPos.value.visible) selectedScreenPos.value.visible = false
      return
    }
    const model = findSelectedModel()
    const renderer = rendererRef.value?.renderer
    const camera = cameraRef.value?.camera
    if (!model || !renderer?.domElement || !camera) {
      if (selectedScreenPos.value.visible) selectedScreenPos.value.visible = false
      return
    }

    const box = new Box3().setFromObject(model)
    const center = new Vector3()
    box.getCenter(center)

    // Nâng center lên giữa để dễ nhìn hơn
    center.y = (box.max.y + box.min.y) / 2

    center.project(camera)
    if (center.z > 1) {
      if (selectedScreenPos.value.visible) selectedScreenPos.value.visible = false
      return
    }

    const rect = renderer.domElement.getBoundingClientRect()
    const x = (center.x * 0.5 + 0.5) * rect.width
    const y = (-(center.y * 0.5) + 0.5) * rect.height

    selectedScreenPos.value = {
      left: x,
      top: y,
      visible: true,
    }
  }

  onMounted(() => {
    rafId = requestAnimationFrame(updateScreenPos)
  })

  onBeforeUnmount(() => {
    if (rafId) cancelAnimationFrame(rafId)
  })

  const raycaster = new Raycaster()
  const pointer = new Vector2()
  const dragPlane = new MathPlane(new Vector3(0, 1, 0), 0)
  const dragHitPoint = new Vector3()
  const dragOffset = new Vector3()

  function findSelectedModel() {
    return furnitureGroups.value.find((item) => item.userData?.instanceId === selectedSceneItemId.value)
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
    selectedSceneItemId.value = picked?.userData?.instanceId ?? null

    if (selectedSceneItemId.value) {
      const override = productOverrides.value[selectedSceneItemId.value] ?? {}
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
        setOrbitEnabled(false)
      }
    } else {
      isDraggingProduct.value = false
      setOrbitEnabled(true)
    }
  }

  function onCanvasPointerMove(event) {
    if (!isDraggingProduct.value || !selectedSceneItemId.value) return
    const renderer = rendererRef.value?.renderer
    const camera = cameraRef.value?.camera
    if (!renderer?.domElement || !camera) return

    const rect = renderer.domElement.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)

    if (!raycaster.ray.intersectPlane(dragPlane, dragHitPoint)) return
    const next = clampToRoomBounds(roomBoundsRef.value, dragHitPoint.x + dragOffset.x, dragHitPoint.z + dragOffset.z)
    selectedPosition.value = next

    productOverrides.value = {
      ...productOverrides.value,
      [selectedSceneItemId.value]: {
        ...(productOverrides.value[selectedSceneItemId.value] ?? {}),
        position: next,
      },
    }

    const model = findSelectedModel()
    if (model) applyUserOverrides(model)
  }

  function onCanvasPointerUp() {
    if (!isDraggingProduct.value) return
    isDraggingProduct.value = false
    setOrbitEnabled(true)
  }

  function onCanvasDragEnter(event) {
    if (!hasRoom.value || !isRoomAvailable.value || !hasDraggedProductData(event)) return
    event.preventDefault()
    isDragOverCanvas.value = true
  }

  function onCanvasDragOver(event) {
    if (!hasRoom.value || !isRoomAvailable.value || !hasDraggedProductData(event)) return
    event.preventDefault()
    isDragOverCanvas.value = true
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy'
    }
  }

  function onCanvasDragLeave(event) {
    const nextTarget = event.relatedTarget
    if (nextTarget && shellRef.value?.contains?.(nextTarget)) return
    isDragOverCanvas.value = false
  }

  function onCanvasDrop(event) {
    isDragOverCanvas.value = false
    const productId = parseDraggedProductId(event)
    if (!productId || !hasRoom.value || !isRoomAvailable.value) return
    event.preventDefault()

    const renderer = rendererRef.value?.renderer
    const camera = cameraRef.value?.camera
    if (!renderer?.domElement || !camera) {
      emit('add-scene-product', { productId })
      return
    }

    const rect = renderer.domElement.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)

    const floorY = roomBoundsRef.value.floorY ?? 0
    dragPlane.constant = -floorY

    if (raycaster.ray.intersectPlane(dragPlane, dragHitPoint)) {
      const initialPosition = clampToRoomBounds(roomBoundsRef.value, dragHitPoint.x, dragHitPoint.z)
      emit('add-scene-product', { productId, initialPosition })
      return
    }

    emit('add-scene-product', { productId })
  }

  function updateSelectedScale(axis, value) {
    if (!selectedSceneItemId.value) return
    selectedScale.value = { ...selectedScale.value, [axis]: value }
    productOverrides.value = {
      ...productOverrides.value,
      [selectedSceneItemId.value]: {
        ...(productOverrides.value[selectedSceneItemId.value] ?? {}),
        scale: { ...selectedScale.value, [axis]: value },
      },
    }
    const model = findSelectedModel()
    if (model) applyUserOverrides(model)
  }

  function updateSelectedColor(colorHex) {
    if (!selectedSceneItemId.value) return
    selectedColor.value = colorHex
    productOverrides.value = {
      ...productOverrides.value,
      [selectedSceneItemId.value]: {
        ...(productOverrides.value[selectedSceneItemId.value] ?? {}),
        color: colorHex,
      },
    }
    const model = findSelectedModel()
    if (model) applyUserOverrides(model)
  }

  function removeSelectedProduct() {
    if (!selectedSceneItemId.value) return
    emit('remove-scene-item', selectedSceneItemId.value)
    selectedSceneItemId.value = null
    setOrbitEnabled(true)
    isDraggingProduct.value = false
  }

  function addSelectedProductToCart() {
    if (!selectedProduct.value?.id || isSelectedInCart.value) return
    emit('add-product', {
      ...selectedProduct.value,
      _selectedVariantId: selectedSceneItem?.value?.variantId
    })
  }

  function resetSelectedColor() {
    if (!selectedSceneItemId.value) return
    const current = productOverrides.value[selectedSceneItemId.value]
    if (!current) return
    const { color: _removed, ...rest } = current
    productOverrides.value = {
      ...productOverrides.value,
      [selectedSceneItemId.value]: rest,
    }
    const model = findSelectedModel()
    if (model) applyUserOverrides(model)
  }

  function updateSelectedRotation(value) {
    if (!selectedSceneItemId.value) return
    selectedRotationY.value = value
    productOverrides.value = {
      ...productOverrides.value,
      [selectedSceneItemId.value]: {
        ...(productOverrides.value[selectedSceneItemId.value] ?? {}),
        rotationY: value,
      },
    }
    const model = findSelectedModel()
    if (model) applyUserOverrides(model)
  }

  function rotateSelected(deltaRadians) {
    updateSelectedRotation(selectedRotationY.value + deltaRadians)
  }

  function nudgeSelected(screenDx, screenDy) {
    if (!selectedSceneItemId.value) return
    const camera = cameraRef.value?.camera
    if (!camera) return

    const forward = new Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    if (forward.lengthSq() < 0.001) {
      forward.set(0, 0, -1)
    } else {
      forward.normalize()
    }

    const right = new Vector3()
    right.crossVectors(forward, new Vector3(0, 1, 0)).normalize()

    const moveVector = new Vector3()
    moveVector.addScaledVector(forward, -screenDy)
    moveVector.addScaledVector(right, screenDx)

    const currentPos = productOverrides.value[selectedSceneItemId.value]?.position || { x: selectedPosition.value.x, z: selectedPosition.value.z }
    const nextX = currentPos.x + moveVector.x
    const nextZ = currentPos.z + moveVector.z
    const next = clampToRoomBounds(roomBoundsRef.value, nextX, nextZ)
    selectedPosition.value = next

    productOverrides.value = {
      ...productOverrides.value,
      [selectedSceneItemId.value]: {
        ...(productOverrides.value[selectedSceneItemId.value] ?? {}),
        position: next,
      },
    }

    const model = findSelectedModel()
    if (model) applyUserOverrides(model)
  }

  return {
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
  }
}
