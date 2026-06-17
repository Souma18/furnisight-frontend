import { Color } from 'three'

export function applyColorToModel(model, colorHex) {
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

export function captureOriginalMaterialColors(model) {
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

export function modelLooksNeutralGray(model) {
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

export function boostDarkMaterials(model) {
  model.traverse((node) => {
    if (!node.isMesh || !node.material) return
    const mats = Array.isArray(node.material) ? node.material : [node.material]
    mats.forEach((mat) => {
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

export function restoreOriginalModelColors(model) {
  const snapshot = model?.userData?.originalMaterialColors
  if (!Array.isArray(snapshot)) return
  snapshot.forEach(({ material, color }) => {
    if (!material?.color || !color) return
    material.color.copy(color)
    material.needsUpdate = true
  })
}
