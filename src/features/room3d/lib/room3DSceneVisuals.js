import {
  ACESFilmicToneMapping,
  GridHelper,
  SRGBColorSpace,
} from 'three'

export const LIGHTING_PRESET = {
  background: 0xe9ecef,
  exposure: 1.45,
  ambientIntensity: 1.08,
  keyLightIntensity: 1.28,
  fillLightIntensity: 0.72,
}

export function setupSceneVisuals({
  sceneRef,
  rendererRef,
  floorGridRef,
}) {
  const scene = sceneRef.value?.scene
  const renderer = rendererRef.value?.renderer
  if (!renderer || !scene) return

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
