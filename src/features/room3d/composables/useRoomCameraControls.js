import { ref } from 'vue'
import { Box3, Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function useRoomCameraControls({
  shellRef,
  rendererRef,
  cameraRef,
  roomModelGroup,
}) {
  const viewMode = ref('3d')
  const isFullscreen = ref(false)
  let orbitControls = null
  let controlsRAF = null
  let pointerHandlers = null

  function getOrbitControls() {
    return orbitControls
  }

  function focusCameraToRoom() {
    const camera = cameraRef.value?.camera
    if (!camera) return

    const roomObject = roomModelGroup.value
    if (roomObject) {
      const box = new Box3().setFromObject(roomObject)
      if (!box.isEmpty()) {
        const center = box.getCenter(new Vector3())
        const size = box.getSize(new Vector3())
        const dominantSize = Math.max(size.x, size.z, size.y * 1.2, 4)
        const targetY = box.min.y + size.y * 0.42

        camera.position.set(
          center.x,
          targetY + Math.max(1.9, size.y * 0.42),
          center.z + dominantSize * 1.15,
        )
        camera.lookAt(center.x, targetY, center.z)
        camera.updateProjectionMatrix?.()
        orbitControls?.target?.set(center.x, targetY, center.z)
        orbitControls?.update?.()
        viewMode.value = '3d'
        return
      }
    }

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

    const roomObject = roomModelGroup.value
    if (roomObject) {
      const box = new Box3().setFromObject(roomObject)
      if (!box.isEmpty()) {
        const center = box.getCenter(new Vector3())
        const size = box.getSize(new Vector3())
        camera.position.set(center.x, Math.max(8, size.y + Math.max(size.x, size.z) * 1.2), center.z + 0.01)
        camera.lookAt(center.x, box.min.y, center.z)
        camera.updateProjectionMatrix?.()
        orbitControls?.target?.set(center.x, box.min.y, center.z)
        orbitControls?.update?.()
        viewMode.value = 'top'
        return
      }
    }

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

    const roomObject = roomModelGroup.value
    if (roomObject) {
      const box = new Box3().setFromObject(roomObject)
      if (!box.isEmpty()) {
        const center = box.getCenter(new Vector3())
        const size = box.getSize(new Vector3())
        const targetY = box.min.y + size.y * 0.42
        camera.position.set(center.x, targetY + Math.max(0.8, size.y * 0.18), box.max.z + Math.max(3.8, size.z * 0.9))
        camera.lookAt(center.x, targetY, center.z)
        camera.updateProjectionMatrix?.()
        orbitControls?.target?.set(center.x, targetY, center.z)
        orbitControls?.update?.()
        viewMode.value = 'front'
        return
      }
    }

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

  function setupOrbitControls(handlers = {}) {
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

    pointerHandlers = handlers
    if (handlers.onPointerDown) renderer.domElement.addEventListener('pointerdown', handlers.onPointerDown)
    if (handlers.onPointerMove) renderer.domElement.addEventListener('pointermove', handlers.onPointerMove)
    if (handlers.onPointerUp) window.addEventListener('pointerup', handlers.onPointerUp)
  }

  function setOrbitEnabled(enabled) {
    if (orbitControls) orbitControls.enabled = enabled
  }

  function disableAutoRotate() {
    if (!orbitControls) return
    orbitControls.autoRotate = false
    orbitControls.update()
  }

  function cleanupOrbitControls() {
    if (controlsRAF) cancelAnimationFrame(controlsRAF)
    controlsRAF = null
    const renderer = rendererRef.value?.renderer
    if (renderer?.domElement && pointerHandlers?.onPointerDown) {
      renderer.domElement.removeEventListener('pointerdown', pointerHandlers.onPointerDown)
    }
    if (renderer?.domElement && pointerHandlers?.onPointerMove) {
      renderer.domElement.removeEventListener('pointermove', pointerHandlers.onPointerMove)
    }
    if (pointerHandlers?.onPointerUp) {
      window.removeEventListener('pointerup', pointerHandlers.onPointerUp)
    }
    pointerHandlers = null
    orbitControls?.dispose?.()
    orbitControls = null
  }

  return {
    viewMode,
    isFullscreen,
    getOrbitControls,
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
  }
}
