<script setup>
import { NSpin, NTag } from 'naive-ui'
import { computed, ref } from 'vue'

const props = defineProps({
  mode: String,
  roomTemplates: {
    type: Array,
    default: () => [],
  },
  selectedRoomType: {
    type: String,
    default: null,
  },
  selectedRoom: {
    type: Object,
    default: null,
  },
  imageType: String,
  meshQuality: String,
  quality: String,
  isAnalyzing: Boolean,
  isLoadingTemplates: Boolean,
  projectName: String,
  uploadError: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'switch-mode',
  'upload-image',
  'select-room-type',
  'image-type-change',
  'mesh-quality-change',
  'quality-change',
  'project-name-change',
])

function onFileChange(event) {
  const file = event.target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

const roomHasModel = computed(() => Boolean(props.selectedRoom?.modelUrl))
const selectedFile = ref(null)
const selectedFileName = computed(() => selectedFile.value?.name ?? '')

function runAiGenerate() {
  if (!selectedFile.value || props.isAnalyzing) return
  emit('upload-image', selectedFile.value)
}
</script>

<template>
  <aside class="panel">
    <p class="section-kicker">TRUC QUAN</p>

    <div class="mode-tabs">
      <button
        type="button"
        class="mode-tab"
        :class="{ active: mode === 'upload' }"
        @click="emit('switch-mode', 'upload')"
      >
        <span class="tab-icon">🖼️</span>
        <span>Hinh anh</span>
      </button>
      <button
        type="button"
        class="mode-tab"
        :class="{ active: mode === 'room' }"
        @click="emit('switch-mode', 'room')"
      >
        <span class="tab-icon">🏠</span>
        <span>Phong o</span>
      </button>
    </div>

    <div v-if="mode === 'upload'" class="upload-section">
      <p class="label">TAI ANH PHONG LEN</p>
      
      <div class="image-type-section">
        <div class="quality-row" style="grid-template-columns: 1fr 1fr;">
          <button
            type="button"
            class="quality-btn"
            :class="{ active: imageType === 'normal' }"
            @click="emit('image-type-change', 'normal')"
          >
            Anh thuong
          </button>
          <button
            type="button"
            class="quality-btn"
            :class="{ active: imageType === '360' }"
            @click="emit('image-type-change', '360')"
          >
            Anh 360
          </button>
        </div>
      </div>

      <label class="upload-zone">
        <input class="file-input" type="file" accept="image/*" @change="onFileChange" />
        <span class="upload-icon">📤</span>
        <strong>Nhap / Keo Tha / Dan Hinh Anh</strong>
        <small>JPG, PNG, WEBP · Toi da 50MB</small>
        <small>AI se tu nhan dien loai phong</small>
      </label>
      <p v-if="selectedFileName" class="selected-file">
        Da chon: <strong>{{ selectedFileName }}</strong>
      </p>
      <button
        type="button"
        class="run-ai-btn"
        :disabled="!selectedFile || isAnalyzing"
        @click="runAiGenerate"
      >
        {{ isAnalyzing ? 'Dang tao mo hinh...' : 'Su dung AI' }}
      </button>
      <!-- <NSpin v-if="isAnalyzing" size="small">AI dang phan tich...</NSpin> -->
      <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
    </div>

    <div v-else class="room-templates">
      <p class="label">NGUON DU LIEU PHONG</p>
      <NSpin v-if="isLoadingTemplates" size="small">Dang tai phong mau...</NSpin>
      <div v-else class="room-list">
        <button
          v-for="room in roomTemplates"
          :key="room.id"
          type="button"
          class="room-btn"
          :class="{ active: selectedRoomType === room.type }"
          @click="emit('select-room-type', room.type)"
        >
          <span class="room-btn-icon">{{ room.emoji }}</span>
          <span class="room-btn-content">
            <strong>{{ room.name }}</strong>
            <small>{{ room.type === 'bedroom' ? 18 : room.type === 'living' ? 22 : room.type === 'dining' ? 14 : 16 }} san pham phu hop</small>
          </span>
        </button>
      </div>

      <div class="room-mode-note" v-if="selectedRoom">
        <strong>{{ selectedRoom.name }}</strong>
        <p v-if="roomHasModel">
          Truc quan 3D dang san sang. Co the xoay, zoom, va dat san pham.
        </p>
        <p v-else>
          {{ selectedRoom.statusText || 'Phong nay dang duoc bo sung model.' }}
        </p>
      </div>
    </div>

    <div v-if="mode === 'upload'" class="room-info">
      <p class="label">THONG TIN PHONG</p>
      <p v-if="!selectedRoom" class="note">Chua co phong duoc chon.</p>
      <div v-else class="room-meta">
        <NTag type="warning">{{ selectedRoom.name }} ({{ selectedRoom.confidence }}%)</NTag>
        <p>{{ selectedRoom.suggestText }}</p>
      </div>
    </div>

    <div v-if="mode === 'upload'" class="project-name">
      <p class="label">TEN DU AN</p>
      <input
        class="project-input"
        :value="projectName"
        placeholder="Dat ten cho ngoi nha cua ban"
        @input="emit('project-name-change', $event.target.value)"
      />
    </div>

    <div v-if="mode === 'upload'" class="quality">
      <template v-if="imageType === 'normal'">
        <p class="label">CHAT LUONG LUOI</p>
        <div class="quality-row" style="grid-template-columns: 1fr 1fr 1fr;">
          <button
            type="button"
            class="quality-btn"
            :class="{ active: meshQuality === 'low' }"
            @click="emit('mesh-quality-change', 'low')"
          >
            Thap
          </button>
          <button
            type="button"
            class="quality-btn"
            :class="{ active: meshQuality === 'medium' }"
            @click="emit('mesh-quality-change', 'medium')"
          >
            T.Binh
          </button>
          <button
            type="button"
            class="quality-btn"
            :class="{ active: meshQuality === 'high' }"
            @click="emit('mesh-quality-change', 'high')"
          >
            Cao
          </button>
        </div>
        <small class="quality-hint">Chat luong "T.Binh" (Medium) duoc khuyen nghi de co thoi gian phan hoi tot nhat.</small>
      </template>
      <template v-else>
        <p class="label">MESH RESOLUTION</p>
        <div class="quality-row">
          <button
            type="button"
            class="quality-btn"
            :class="{ active: quality === '128' }"
            @click="emit('quality-change', '128')"
          >
            128
          </button>
          <button
            type="button"
            class="quality-btn"
            :class="{ active: quality === '256' }"
            @click="emit('quality-change', '256')"
          >
            256
          </button>
          <button
            type="button"
            class="quality-btn"
            :class="{ active: quality === '512' }"
            @click="emit('quality-change', '512')"
          >
            512
          </button>
          <button
            type="button"
            class="quality-btn"
            :class="{ active: quality === '1024' }"
            @click="emit('quality-change', '1024')"
          >
            1024
          </button>
        </div>
        <small class="quality-hint">Khuyen nghi 256 hoac 512 de can bang toc do va chat luong.</small>
      </template>
    </div>
  </aside>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 0.75rem 0.7rem 1rem;
  border-right: 1px solid #ddd3c6;
  height: 100%;
  overflow: auto;
  background: #efede9;
  /* An thanh scrollbar nhung van giu kha nang scroll */
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.panel::-webkit-scrollbar {
  display: none;
}

.section-kicker {
  margin: 0;
  color: #9f9b95;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  padding: 0.3rem 0.2rem;
}

.mode-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.mode-tab {
  border: 2px solid #d7cfc3;
  background: #f4f1ec;
  color: #5f5d58;
  border-radius: 1rem;
  min-height: 5.4rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  cursor: pointer;
}
.mode-tab.active {
  background: #0f3f5c;
  border-color: #0f3f5c;
  color: #fff;
}

.tab-icon {
  font-size: 1.4rem;
}

.label {
  margin: 0;
  color: #a29d96;
  font-weight: 700;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
}

.upload-section,
.room-templates,
.room-info,
.project-name,
.quality,
.image-type-section {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.upload-zone {
  border: 3px dashed #d6cabe;
  border-radius: 1rem;
  min-height: 12.5rem;
  padding: 1rem 0.7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #8e887f;
  gap: 0.2rem;
  cursor: pointer;
}

.upload-zone strong {
  color: #9a744f;
  font-size: 0.84rem;
}

.upload-zone small {
  font-size: 0.72rem;
}

.file-input {
  display: none;
}

.upload-icon {
  font-size: 1.5rem;
  margin-bottom: 0.1rem;
}

.room-list {
  display: grid;
  gap: 0.55rem;
}

.room-btn {
  width: 100%;
  border: 1px solid #d8cec1;
  border-radius: 0.95rem;
  background: #f3f0eb;
  min-height: 4.1rem;
  display: flex;
  align-items: center;
  gap: 0.72rem;
  padding: 0.65rem 0.85rem;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.room-btn:hover {
  border-color: #d3ab74;
  box-shadow: 0 0 0 2px rgba(211, 171, 116, 0.22);
  transform: translateY(-1px);
}

.room-btn.active {
  border-color: #c89f65;
  box-shadow: inset 0 0 0 1px rgba(200, 159, 101, 0.28);
}

.room-btn-icon {
  font-size: 1.4rem;
}

.room-btn-content {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
}

.room-btn-content strong {
  color: #272522;
  font-size: 0.84rem;
  line-height: 1.2;
}

.room-btn-content small {
  color: #a29d96;
  font-size: 0.78rem;
}

.room-mode-note {
  margin-top: 0.2rem;
  border: 1px solid #d8cec1;
  border-radius: 0.8rem;
  padding: 0.6rem 0.7rem;
  background: #f4f1ec;
}

.room-mode-note strong {
  display: block;
  font-size: 0.88rem;
  color: #4f4b44;
  margin-bottom: 0.25rem;
}

.room-mode-note p {
  margin: 0;
  font-size: 0.8rem;
  color: #6f6a62;
}

.room-meta {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.room-meta p {
  margin: 0;
  font-size: 0.84rem;
  color: #625e57;
}

:deep(.room-meta .n-tag) {
  border-radius: 0.7rem;
  padding: 0.2rem 0.55rem;
}

.note {
  margin: 0;
  font-size: 0.84rem;
  color: #6e6b66;
}

.quality-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.35rem;
}

.quality-btn {
  border: 1px solid #d8cec1;
  border-radius: 0.75rem;
  background: #f3f0eb;
  color: #68655f;
  min-height: 2.25rem;
  font-weight: 700;
  cursor: pointer;
}

.quality-btn.active {
  background: #0f3f5c;
  border-color: #0f3f5c;
  color: #ffba45;
}

.quality-hint {
  color: #8f8a82;
  font-size: 0.72rem;
}

.project-input {
  width: 100%;
  min-height: 2.45rem;
  border: 1px solid #d8cec1;
  border-radius: 0.95rem;
  background: #f3f0eb;
  color: #68655f;
  padding: 0.55rem 0.9rem;
  font: inherit;
  outline: none;
}

.project-input:focus {
  border-color: #c8b69e;
  background: #f7f4ef;
}

.upload-error {
  margin: 0.1rem 0 0;
  color: #c54848;
  font-size: 0.76rem;
}

.selected-file {
  margin: 0;
  color: #6d675f;
  font-size: 0.74rem;
  line-height: 1.3;
}

.selected-file strong {
  color: #3e4952;
}

.run-ai-btn {
  width: 100%;
  border: none;
  border-radius: 0.82rem;
  background: linear-gradient(180deg, #134764 0%, #0d3751 100%);
  color: #f8fafb;
  min-height: 2.45rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
}

.run-ai-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(13, 55, 81, 0.28);
}

.run-ai-btn:disabled {
  cursor: not-allowed;
  opacity: 0.56;
}
</style>
