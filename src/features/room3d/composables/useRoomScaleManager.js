import { computed, ref, watch } from 'vue'
import { Box3 } from 'three'
import { centerRoomModelOnXYGrid } from '../lib/room3DObjects'
import { clampToRoomBounds } from '../lib/room3DPlacement'
import { applyColorToModel, restoreOriginalModelColors } from '../lib/room3DMaterials'

export function useRoomScaleManager({
  roomModelGroup,
  furnitureGroups,
  floorGridRef,
  productOverrides,
  roomBoundsRef,
  resizeRendererToShell,
}) {
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

  const roomScaleMultiplier = computed(() => ROOM_SCALE_LEVELS[String(roomScaleStep.value)] ?? 1)
  const roomScaleLabel = computed(() => {
    if (roomScaleStep.value > 0) return `+${roomScaleStep.value}`
    return String(roomScaleStep.value)
  })
  const canDecreaseRoomScale = computed(() => roomScaleStep.value > -3)
  const canIncreaseRoomScale = computed(() => roomScaleStep.value < 3)

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

  watch(roomScaleStep, () => {
    applyRoomScale()
  })

  return {
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
  }
}
