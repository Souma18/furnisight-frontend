export function getPlacementPosition(bounds, index) {
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

export function clampToRoomBounds(bounds, x, z) {
  const width = Math.max(1, bounds.maxX - bounds.minX)
  const depth = Math.max(1, bounds.maxZ - bounds.minZ)
  const marginX = width * 0.08
  const marginZ = depth * 0.08
  return {
    x: Math.min(bounds.maxX - marginX, Math.max(bounds.minX + marginX, x)),
    z: Math.min(bounds.maxZ - marginZ, Math.max(bounds.minZ + marginZ, z)),
  }
}
