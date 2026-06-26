<script setup>
import { computed, ref, watch } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAdminConversationStore } from '../../store/adminConversationStore'
import { useAdminUiStore } from '../../store/adminUiStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { mediaApi } from '@shared/lib/api/services'

const props = defineProps({
  templateMgr: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['open-templates', 'open-products'])
const store = useAdminConversationStore()
const uiStore = useAdminUiStore()
const authStore = useAuthStore()
const templateMgr = props.templateMgr

const currentAdmin = computed(() => store.currentAdmin)

const messageText = ref('')
const inputWrapClasses = ref('')
const fileInputRef = ref(null)
const imageInputRef = ref(null)
const selectedAttachment = ref(null)
const uploadingAttachment = ref(false)

function updateInputMode() {
  inputWrapClasses.value =
    store.workspace.msgType === 'note' ? 'note-mode' : store.workspace.msgType === 'ai' ? 'ai-mode' : ''
}

watch(() => store.workspace.msgType, updateInputMode)

watch(() => store.workspace.convId, () => {
  messageText.value = ''
  clearAttachment()
})

// EXPOSE method to parent to insert template explicitly without hidden mutation via watch
function insertTemplate(text) {
  messageText.value = text
  store.setMsgType('reply')
}
defineExpose({ insertTemplate })

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''))
}

function formatBytes(bytes = 0) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function chooseFile() {
  fileInputRef.value?.click()
}

function chooseImage() {
  imageInputRef.value?.click()
}

function onAttachmentSelected(event, forceImage = false) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  clearAttachment()
  const isImage = forceImage || file.type.startsWith('image/')
  selectedAttachment.value = {
    file,
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    isImage,
    previewUrl: isImage ? URL.createObjectURL(file) : '',
  }
}

function clearAttachment() {
  if (selectedAttachment.value?.previewUrl) {
    URL.revokeObjectURL(selectedAttachment.value.previewUrl)
  }
  selectedAttachment.value = null
}

async function uploadAttachment() {
  if (!selectedAttachment.value?.file) return null
  const ownerId = authStore.user?.id || authStore.user?.accountId
  if (!isUuid(ownerId)) {
    throw new Error('Không xác định được tài khoản để tải tệp lên.')
  }

  const uploaded = await mediaApi.uploadDirect(selectedAttachment.value.file, {
    ownerType: 'CHAT',
    ownerId,
  })
  return {
    mediaId: uploaded.mediaId || uploaded.id || '',
    url: uploaded.secureUrl || uploaded.secure_url || uploaded.url || '',
    name: selectedAttachment.value.name,
    type: selectedAttachment.value.type,
    size: selectedAttachment.value.size,
    isImage: selectedAttachment.value.isImage,
  }
}

async function sendMsg() {
  if (!messageText.value.trim() && !selectedAttachment.value) return

  const text = messageText.value
  const type = store.workspace.msgType
  uploadingAttachment.value = true
  try {
    const attachment = await uploadAttachment()
    messageText.value = ''
    clearAttachment()

    if (type === 'note') {
      await store.sendInternalNote(text, attachment)
    } else {
      await store.sendCustomerReply(text, attachment)
    }
  } catch (error) {
    uiStore.showToast({ icon: 'alert', title: 'Không thể gửi đính kèm', subtitle: error.message || '' })
    console.error('[WorkspaceInputArea] attachment send failed', error)
  } finally {
    uploadingAttachment.value = false
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMsg()
  }
}
</script>

<template>
  <div v-if="store.currentConv" class="cw-input-area">
    <div class="cw-msg-type-row">
      <button
        class="cw-msg-type-btn"
        :class="{ active: store.workspace.msgType === 'reply' }"
        @click="store.setMsgType('reply')"
      >
        <AppIcon name="messageSquare" /> Trả lời
      </button>
      <button
        class="cw-msg-type-btn note-type"
        :class="{ active: store.workspace.msgType === 'note' }"
        @click="store.setMsgType('note')"
      >
        <AppIcon name="lock" /> Ghi chú nội bộ
      </button>
    </div>

    <div class="cw-toolbar">
      <input ref="fileInputRef" type="file" class="cw-file-input" @change="(e) => onAttachmentSelected(e, false)" />
      <input ref="imageInputRef" type="file" class="cw-file-input" accept="image/*" @change="(e) => onAttachmentSelected(e, true)" />
      <button class="cw-tool-btn" title="Đính kèm file" :disabled="uploadingAttachment" @click="chooseFile"><AppIcon name="paperclip" /></button>
      <button class="cw-tool-btn" title="Gửi ảnh" :disabled="uploadingAttachment" @click="chooseImage"><AppIcon name="image" /></button>
      <div class="cw-tool-sep"></div>
      <button class="cw-tool-btn" title="Gửi sản phẩm (Product Card)" @click="emit('open-products')">
        <AppIcon name="armchair" />
      </button>
      <button class="cw-tool-btn" title="Chọn template (mở danh sách)" @click="emit('open-templates')">
        <AppIcon name="fileText" />
      </button>
      <button class="cw-tool-btn" title="Chèn Emoji"><AppIcon name="smile" /></button>
    </div>

    <div class="cw-input-area-wrap">
      <div v-if="selectedAttachment" class="cw-attachment-preview">
        <img v-if="selectedAttachment.isImage" :src="selectedAttachment.previewUrl" alt="" class="cw-attachment-thumb" />
        <div v-else class="cw-attachment-file"><AppIcon name="paperclip" /></div>
        <div class="cw-attachment-meta">
          <div class="cw-attachment-name">{{ selectedAttachment.name }}</div>
          <div class="cw-attachment-size">{{ formatBytes(selectedAttachment.size) }}</div>
        </div>
        <button type="button" class="cw-attachment-remove" title="Bỏ đính kèm" @click="clearAttachment">
          <AppIcon name="x" />
        </button>
      </div>
      <div class="cw-input-row">
        <div class="cw-input-wrap" :class="inputWrapClasses">
          <textarea
            v-model="messageText"
            :placeholder="
              store.workspace.msgType === 'note'
                ? 'Nhập ghi chú nội bộ (chỉ admin xem được)...'
                : 'Nhập tin nhắn trả lời... (Nhấn / để dùng template nhanh)'
            "
            @keydown="handleKeydown"
            rows="1"
          ></textarea>
          <div class="cw-char-count">{{ messageText.length }}</div>
        </div>
        <button class="cw-send-btn" @click="sendMsg" title="Gửi (Enter)" :disabled="uploadingAttachment">
          <AppIcon :name="uploadingAttachment ? 'loader' : 'send'" />
        </button>
      </div>


    </div>

    <div class="cw-footer-bar">
      <div class="cw-footer-info">
        <AppIcon name="checkCheck" /> Đang trả lời với tư cách: <strong>{{ currentAdmin.name }}</strong>
      </div>
      <div class="cw-footer-hint"><strong>Enter</strong> để gửi, <strong>Shift + Enter</strong> để xuống dòng</div>
    </div>
  </div>
</template>
