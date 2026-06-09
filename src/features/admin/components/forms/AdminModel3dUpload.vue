<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  GridHelper,
  PerspectiveCamera,
  SRGBColorSpace,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  fileName: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  previewUrl: { type: String, default: '' },
  uploading: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  error: { type: String, default: '' },
  retryable: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'retry', 'remove', 'preview-error', 'preview-ready', 'preview-loading'])
const viewportRef = ref(null)
const previewLoading = ref(false)
const previewError = ref('')

const loader = new GLTFLoader()
let scene = null
let camera = null
let renderer = null
let controls = null
let activeModel = null
let animationFrame = null
let resizeObserver = null
let loadSequence = 0

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function onChange(event) {
  const file = event.target.files?.[0]
  if (file) emit('select', file)
  event.target.value = ''
}

function disposeMaterial(material) {
  if (!material) return
  for (const value of Object.values(material)) {
    if (value?.isTexture) value.dispose()
  }
  material.dispose?.()
}

function clearModel() {
  if (!activeModel) return
  activeModel.traverse?.((node) => {
    node.geometry?.dispose?.()
    if (Array.isArray(node.material)) node.material.forEach(disposeMaterial)
    else disposeMaterial(node.material)
  })
  scene?.remove(activeModel)
  activeModel = null
}

function resizeScene() {
  const element = viewportRef.value
  if (!element || !renderer || !camera) return
  const width = Math.max(1, element.clientWidth)
  const height = Math.max(1, element.clientHeight)
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

function animate() {
  if (!renderer || !scene || !camera) return
  controls?.update()
  renderer.render(scene, camera)
  animationFrame = requestAnimationFrame(animate)
}

function setupScene() {
  const element = viewportRef.value
  if (!element || renderer) return

  scene = new Scene()
  scene.background = new Color(0xfaf6f0)
  camera = new PerspectiveCamera(42, 1, 0.01, 1000)

  renderer = new WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = SRGBColorSpace
  element.appendChild(renderer.domElement)

  scene.add(new AmbientLight(0xffffff, 1.5))
  const keyLight = new DirectionalLight(0xffffff, 2)
  keyLight.position.set(4, 7, 5)
  scene.add(keyLight)
  const fillLight = new DirectionalLight(0xffffff, 1.2)
  fillLight.position.set(-4, 3, -5)
  scene.add(fillLight)
  scene.add(new GridHelper(8, 16, 0xd4a030, 0xe8e0d4))

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.07
  controls.minDistance = 0.2
  controls.maxDistance = 20

  resizeObserver = new ResizeObserver(resizeScene)
  resizeObserver.observe(element)
  resizeScene()
  animate()
}

function frameModel(model) {
  const initialBox = new Box3().setFromObject(model)
  const initialSize = initialBox.getSize(new Vector3())
  const maxDimension = Math.max(initialSize.x, initialSize.y, initialSize.z)
  if (!Number.isFinite(maxDimension) || maxDimension <= 0) {
    throw new Error('Model GLB không có kích thước hiển thị hợp lệ.')
  }

  const scale = 2.4 / maxDimension
  model.scale.setScalar(scale)
  const box = new Box3().setFromObject(model)
  const center = box.getCenter(new Vector3())
  model.position.x -= center.x
  model.position.y -= box.min.y
  model.position.z -= center.z

  const framedBox = new Box3().setFromObject(model)
  const size = framedBox.getSize(new Vector3())
  const target = new Vector3(0, size.y * 0.45, 0)
  const radius = Math.max(size.x, size.y, size.z, 1)
  const distance = radius / (2 * Math.tan((camera.fov * Math.PI) / 360))

  camera.near = Math.max(0.01, distance / 100)
  camera.far = distance * 100
  camera.position.set(distance * 0.85, distance * 0.65, distance * 1.25)
  camera.updateProjectionMatrix()
  controls.target.copy(target)
  controls.minDistance = distance * 0.35
  controls.maxDistance = distance * 5
  controls.update()
}

async function loadPreview(url) {
  const sequence = ++loadSequence
  previewError.value = ''
  clearModel()
  if (!url) {
    emit('preview-loading', false)
    return
  }

  await nextTick()
  setupScene()
  previewLoading.value = true
  emit('preview-loading', true)
  try {
    const gltf = await loader.loadAsync(url)
    if (sequence !== loadSequence) {
      gltf.scene?.traverse?.((node) => {
        node.geometry?.dispose?.()
        if (Array.isArray(node.material)) node.material.forEach(disposeMaterial)
        else disposeMaterial(node.material)
      })
      return
    }
    activeModel = gltf.scene
    frameModel(activeModel)
    scene.add(activeModel)
    emit('preview-ready')
  } catch (error) {
    if (sequence === loadSequence) {
      previewError.value = error.message || 'Không thể hiển thị preview model GLB.'
      emit('preview-error', previewError.value)
    }
  } finally {
    if (sequence === loadSequence) {
      previewLoading.value = false
      emit('preview-loading', false)
    }
  }
}

watch(() => props.previewUrl, loadPreview, { immediate: true })

onBeforeUnmount(() => {
  loadSequence += 1
  if (animationFrame) cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  clearModel()
  controls?.dispose()
  renderer?.dispose()
  renderer?.domElement?.remove()
  scene = null
  camera = null
  renderer = null
  controls = null
})
</script>

<template>
  <div class="mform-group admin-model-upload">
    <div class="admin-model-upload__head">
      <label class="mfl">Model 3D (GLB, tối đa 100 MB)</label>
      <button
        v-if="fileName || previewUrl"
        type="button"
        class="admin-model-upload__remove"
        :disabled="uploading"
        @click="emit('remove')"
      >
        <AppIcon name="trash" :size="13" />
        Gỡ model
      </button>
    </div>

    <label
      class="model-upload-box"
      :class="{ 'has-file': fileName || previewUrl, 'is-uploading': uploading }"
    >
      <input type="file" accept=".glb,model/gltf-binary,application/octet-stream" hidden :disabled="uploading" @change="onChange" />
      <AppIcon name="box" :size="28" class="admin-model-upload__icon" />
      <strong v-if="fileName">{{ fileName }}</strong>
      <span v-else>{{ uploading ? 'Đang tải model lên...' : 'Nhấn để chọn file GLB' }}</span>
      <small v-if="fileSize">{{ formatSize(fileSize) }}</small>
      <small v-else>Model sẽ được kiểm tra và xem trước trước khi lưu sản phẩm</small>
    </label>

    <div v-if="uploading || progress" class="admin-model-upload__progress" aria-live="polite">
      <div class="admin-model-upload__progress-track">
        <span :style="{ width: `${Math.max(0, Math.min(100, progress))}%` }" />
      </div>
      <small>{{ uploading ? `Đang tải ${progress}%` : 'Đã tải lên, chờ lưu sản phẩm' }}</small>
    </div>

    <div v-if="error" class="admin-model-upload__error" role="alert">
      <span><AppIcon name="alert" :size="14" />{{ error }}</span>
      <button v-if="retryable" type="button" :disabled="uploading" @click="emit('retry')">
        <AppIcon name="refresh" :size="13" />
        Thử lại
      </button>
    </div>

    <div v-show="previewUrl" class="admin-model-preview">
      <div ref="viewportRef" class="admin-model-preview__viewport" />
      <div v-if="previewLoading" class="admin-model-preview__status">Đang dựng preview...</div>
      <div v-if="previewError" class="admin-model-preview__status admin-model-preview__status--error">
        {{ previewError }}
      </div>
      <span class="admin-model-preview__hint">Kéo để xoay, cuộn để thu phóng</span>
    </div>
  </div>
</template>
