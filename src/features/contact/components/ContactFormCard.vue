<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['submit-success'])

const activeIntentId = ref(props.config.intents[0]?.id ?? 'general')
const selectedBudget = ref(props.config.initialBudget ?? '')
const isDragging = ref(false)
const fileInputRef = ref(null)
const selectedFiles = ref([])
const form = ref({
  fullName: '',
  phone: '',
  email: '',
  roomType: '',
  area: '',
  message: '',
})

const activeIntent = computed(
  () => props.config.intents.find((intent) => intent.id === activeIntentId.value) ?? props.config.intents[0],
)

const showDesignFields = computed(() => Boolean(activeIntent.value?.showDesignFields))
const messagePlaceholder = computed(() => activeIntent.value?.placeholder ?? '')

function revokePreviewUrls() {
  selectedFiles.value.forEach((item) => {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
  })
}

function toPreviewItems(fileList) {
  return Array.from(fileList).map((file, idx) => ({
    id: `${file.name}-${file.lastModified}-${idx}`,
    name: file.name,
    previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
  }))
}

function replaceFiles(fileList) {
  revokePreviewUrls()
  selectedFiles.value = toPreviewItems(fileList)
}

function handleIntent(intentId) {
  activeIntentId.value = intentId
}

function handleFileChange(event) {
  const files = event.target.files
  if (!files?.length) return
  replaceFiles(files)
}

function openFilePicker() {
  fileInputRef.value?.click()
}

function handleDrop(event) {
  isDragging.value = false
  if (!event.dataTransfer?.files?.length) return
  replaceFiles(event.dataTransfer.files)
}

function handleSubmit() {
  emit('submit-success')
}

onBeforeUnmount(() => {
  revokePreviewUrls()
})
</script>

<template>
  <section id="contact-form" class="ct-form-card ct-fade-up">
    <div class="ct-form-header">
      <div class="ct-form-tag">{{ config.tag }}</div>
      <h2 class="ct-form-title">
        {{ config.titleLine1 }}<br>
        {{ config.titleLine2Prefix }}<em>{{ config.titleAccent }}</em>{{ config.titleLine2Suffix }}
      </h2>
    </div>

    <div class="ct-intent-tabs">
      <button
        v-for="intent in config.intents"
        :key="intent.id"
        type="button"
        class="ct-it-tab"
        :class="{ active: activeIntentId === intent.id }"
        @click="handleIntent(intent.id)"
      >
        <AppIcon :name="intent.icon" :size="14" />
        {{ intent.label }}
      </button>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="ct-form-row">
        <div class="ct-form-group">
          <label class="ct-fl">Họ và tên <span>*</span></label>
          <input v-model.trim="form.fullName" class="ct-fi" type="text" placeholder="Nguyễn Văn A" required>
        </div>
        <div class="ct-form-group">
          <label class="ct-fl">Số điện thoại <span>*</span></label>
          <input v-model.trim="form.phone" class="ct-fi" type="tel" placeholder="090 xxx xxxx" required>
        </div>
      </div>

      <div class="ct-form-group">
        <label class="ct-fl">Email</label>
        <input v-model.trim="form.email" class="ct-fi" type="email" placeholder="email@example.com">
      </div>

      <div v-show="showDesignFields">
        <div class="ct-form-row">
          <div class="ct-form-group">
            <label class="ct-fl">Loại phòng</label>
            <select v-model="form.roomType" class="ct-fi">
              <option value="">Chọn loại phòng</option>
              <option v-for="roomType in config.roomTypes" :key="roomType" :value="roomType">
                {{ roomType }}
              </option>
            </select>
          </div>

          <div class="ct-form-group">
            <label class="ct-fl">Diện tích ước tính</label>
            <select v-model="form.area" class="ct-fi">
              <option value="">Chọn diện tích</option>
              <option v-for="area in config.areaOptions" :key="area" :value="area">
                {{ area }}
              </option>
            </select>
          </div>
        </div>

        <div class="ct-form-group">
          <label class="ct-fl">Ngân sách dự kiến</label>
          <div class="ct-budget-pills">
            <button
              v-for="option in config.budgetOptions"
              :key="option"
              type="button"
              class="ct-bp"
              :class="{ active: selectedBudget === option }"
              @click="selectedBudget = option"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <div class="ct-form-group">
          <label class="ct-fl">Tải ảnh phòng (để AI phân tích)</label>

          <div
            class="ct-file-drop"
            :class="{ 'ct-file-drop--dragging': isDragging }"
            @click="openFilePicker"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
          >
            <div class="ct-fd-icon">
              <AppIcon name="camera" :size="28" />
            </div>
            <div class="ct-fd-title">Kéo thả ảnh hoặc nhấn để chọn</div>
            <div class="ct-fd-sub">
              JPG, PNG, WEBP · Tối đa 20MB · <span>AI sẽ phân tích và tư vấn phù hợp hơn</span>
            </div>
            <input
              ref="fileInputRef"
              class="ct-file-input"
              type="file"
              accept="image/*"
              multiple
              @change="handleFileChange"
            >
          </div>

          <div v-if="selectedFiles.length" class="ct-file-preview">
            <div v-for="item in selectedFiles" :key="item.id" class="ct-file-preview-item">
              <img v-if="item.previewUrl" :src="item.previewUrl" :alt="item.name" class="ct-file-preview-image">
              <div v-else class="ct-file-preview-fallback">
                <AppIcon name="image" :size="24" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="ct-form-group">
        <label class="ct-fl">Nội dung <span>*</span></label>
        <textarea
          v-model.trim="form.message"
          class="ct-fi ct-textarea"
          :placeholder="messagePlaceholder"
          required
        ></textarea>
      </div>

      <button class="ct-form-submit" type="submit">
        <AppIcon name="mail" :size="18" />
        Gửi yêu cầu ngay
      </button>
      <div class="ct-form-note">{{ config.note }}</div>
    </form>
  </section>
</template>
