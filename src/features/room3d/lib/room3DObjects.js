import { Box3, Vector3 } from 'three'

export function removeObject3D(object3D) {
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

export function centerRoomModelOnXYGrid(model, scaleUniform = 0.9) {
  model.position.set(0, 0, 0)
  model.rotation.set(0, 0, 0)
  if (typeof scaleUniform === 'number') {
    model.scale.setScalar(scaleUniform)
  } else if (scaleUniform && typeof scaleUniform === 'object') {
    model.scale.set(scaleUniform.x ?? 1, scaleUniform.y ?? 1, scaleUniform.z ?? 1)
  }
  model.updateMatrixWorld(true)

  const box = new Box3().setFromObject(model)
  if (box.isEmpty()) return

  const center = box.getCenter(new Vector3())

  model.position.x = -center.x
  model.position.z = -center.z
  model.updateMatrixWorld(true)

  const boxAfter = new Box3().setFromObject(model)
  if (!Number.isFinite(boxAfter.min.y)) return

  model.position.y -= boxAfter.min.y
  model.updateMatrixWorld(true)
}
