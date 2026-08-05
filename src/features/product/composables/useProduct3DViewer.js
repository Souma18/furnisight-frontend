import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  Box3,
  Vector3,
  GridHelper,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export function useProduct3DViewer(props) {
  const { t } = useI18n()
  const viewportRef = ref(null)
  const isLoading = ref(false)
  const loadError = ref('')
  const viewMode = ref('product')

  const loader = new GLTFLoader()
  let scene = null
  let camera = null
  let renderer = null
  let controls = null
  let rafId = null
  let activeModel = null
  let resizeObserver = null

  function clearModel() {
    if (!activeModel) return
    activeModel.traverse?.((node) => {
      if (node.isMesh) {
        node.geometry?.dispose?.()
        if (Array.isArray(node.material))
          node.material.forEach((m) => m?.dispose?.())
        else node.material?.dispose?.()
      }
    })
    scene?.remove(activeModel)
    activeModel = null
  }

  function setupScene() {
    const el = viewportRef.value
    if (!el || renderer) return
    scene = new Scene()
    camera = new PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 1.8, 4.8)

    renderer = new WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(el.clientWidth, el.clientHeight)
    el.appendChild(renderer.domElement)

    scene.add(new AmbientLight(0xffffff, 1.05))
    const key = new DirectionalLight(0xffffff, 1.2)
    key.position.set(5, 8, 4)
    scene.add(key)
    const fill = new DirectionalLight(0xffffff, 0.7)
    fill.position.set(-4, 5, -5)
    scene.add(fill)
    scene.add(new GridHelper(10, 20, 0xc9922a, 0xc9922a))

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.minDistance = 1.6
    controls.maxDistance = 11
    controls.target.set(0, 0.7, 0)
    controls.update()

    resizeObserver = new ResizeObserver(resizeScene)
    resizeObserver.observe(el)
  }

  function resizeScene() {
    const el = viewportRef.value
    if (!el || !renderer || !camera) return
    const width = Math.max(1, el.clientWidth)
    const height = Math.max(1, el.clientHeight)
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  function animate() {
    if (!renderer || !scene || !camera) return
    controls?.update?.()
    renderer.render(scene, camera)
    rafId = requestAnimationFrame(animate)
  }

  async function loadModel() {
    if (!props.modelUrl || !props.supports3d) return
    isLoading.value = true
    loadError.value = ''
    try {
      const gltf = await loader.loadAsync(props.modelUrl)
      clearModel()
      activeModel = gltf.scene
      scene.add(activeModel)
      const box = new Box3().setFromObject(activeModel)
      const size = box.getSize(new Vector3())
      const center = box.getCenter(new Vector3())
      const fit = 2.2 / Math.max(size.x || 1, size.y || 1, size.z || 1)
      activeModel.scale.setScalar(fit)
      activeModel.position.sub(center.multiplyScalar(fit))
      activeModel.position.y += 0.55
    } catch (err) {
      loadError.value = `${t('productDetail.alerts.loadModelError')} (${err.message || err})`
    } finally {
      isLoading.value = false
    }
  }

  watch(
    () => [props.open, props.modelUrl, props.supports3d],
    async ([open]) => {
      if (!open) return
      await nextTick()
      setupScene()
      resizeScene()
      if (rafId) cancelAnimationFrame(rafId)
      animate()
      await loadModel()
    },
    { deep: true, immediate: true },
  )

  watch(
    () => props.open,
    (open) => {
      if (open) return
      if (rafId) cancelAnimationFrame(rafId)
      rafId = null
      viewMode.value = 'product'
    },
  )

  onBeforeUnmount(() => {
    if (rafId) cancelAnimationFrame(rafId)
    resizeObserver?.disconnect?.()
    clearModel()
    controls?.dispose?.()
    renderer?.dispose?.()
    scene = null
    camera = null
    renderer = null
    controls = null
  })

  return {
    viewportRef,
    isLoading,
    loadError,
    viewMode,
  }
}
