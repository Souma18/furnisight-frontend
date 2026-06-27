<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { computed, ref, watch } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAdminConversationStore } from '../../store/adminConversationStore'
import { useAdminUiStore } from '../../store/adminUiStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { uploadChatAttachment } from '../../lib/chatAttachmentUpload'
import { formatChatError } from '@features/chat/lib/chatErrorMessages'
import {
  DOCUMENT_FILE_ACCEPT,
  chatAttachmentFormatError,
  chatAttachmentSizeError,
  isAllowedChatDocument,
  isAllowedChatAttachmentSize,
  isAllowedChatImage,
} from '@features/chat/lib/chatAttachmentRules'

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
const selectedAttachments = ref([])
const uploadingAttachment = ref(false)

function updateInputMode() {
  inputWrapClasses.value =
    store.workspace.msgType === 'note' ? 'note-mode' : store.workspace.msgType === 'ai' ? 'ai-mode' : ''
}

watch(() => store.workspace.msgType, updateInputMode)

watch(() => store.workspace.convId, () => {
  messageText.value = ''
  clearAttachments()
})

function insertTemplate(text) {
  messageText.value = text
  store.setMsgType('reply')
}
defineExpose({ insertTemplate })

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
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  if (!files.length) return

  const oversizedFiles = files.filter((file) => !isAllowedChatAttachmentSize(file))
  if (oversizedFiles.length) {
    uiStore.showToast({
      icon: 'alert',
      title: 'Tệp quá lớn',
      subtitle: chatAttachmentSizeError(),
    })
    return
  }

  const acceptedFiles = forceImage
    ? files.filter(isAllowedChatImage)
    : files.filter(isAllowedChatDocument)

  if (!acceptedFiles.length) {
    uiStore.showToast({
      icon: 'alert',
      title: 'File không được hỗ trợ',
      subtitle: chatAttachmentFormatError(forceImage ? 'image' : 'file'),
    })
    return
  }

  const nextAttachments = files
    .filter((file) => acceptedFiles.includes(file))
    .map((file) => {
      const isImage = forceImage || file.type.startsWith('image/')
      return {
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        isImage,
        previewUrl: isImage ? URL.createObjectURL(file) : '',
      }
    })

  selectedAttachments.value = [...selectedAttachments.value, ...nextAttachments]
}

function removeAttachment(id) {
  const removed = selectedAttachments.value.find((item) => item.id === id)
  if (removed?.previewUrl) {
    URL.revokeObjectURL(removed.previewUrl)
  }
  selectedAttachments.value = selectedAttachments.value.filter((item) => item.id !== id)
}

function clearAttachments() {
  selectedAttachments.value.forEach((item) => {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
  })
  selectedAttachments.value = []
}

async function uploadAttachments() {
  if (!selectedAttachments.value.length) return []
  return Promise.all(selectedAttachments.value.map(async (attachment) => {
    const uploaded = await uploadChatAttachment(attachment.file, authStore)
    return {
      mediaId: uploaded.mediaId || uploaded.id || '',
      url: uploaded.secureUrl || uploaded.secure_url || uploaded.url || '',
      name: attachment.name,
      type: attachment.type,
      size: attachment.size,
      isImage: attachment.isImage,
    }
  }))
}

async function sendMsg() {
  if (!messageText.value.trim() && !selectedAttachments.value.length) return

  const text = messageText.value
  const type = store.workspace.msgType
  uploadingAttachment.value = true
  try {
    const attachments = await uploadAttachments()
    messageText.value = ''
    clearAttachments()

    if (type === 'note') {
      await store.sendInternalNote(text, attachments)
    } else {
      await store.sendCustomerReply(text, attachments)
    }
  } catch (error) {
    uiStore.showToast({
      icon: 'alert',
      title: 'Không thể gửi đính kèm',
      subtitle: formatChatError(error, 'Không tải được tệp lên. Vui lòng thử lại.'),
    })
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
      <AppButton
        class="cw-msg-type-btn"
        :class="{ active: store.workspace.msgType === 'reply' }"
        @click="store.setMsgType('reply')"
      >
        <AppIcon name="messageSquare" /> Trả lời
      </AppButton>
      <AppButton
        class="cw-msg-type-btn note-type"
        :class="{ active: store.workspace.msgType === 'note' }"
        @click="store.setMsgType('note')"
      >
        <AppIcon name="lock" /> Ghi chú nội bộ
      </AppButton>
    </div>

    <div class="cw-toolbar">
      <input
        ref="fileInputRef"
        type="file"
        class="cw-file-input"
        :accept="DOCUMENT_FILE_ACCEPT"
        multiple
        @change="(e) => onAttachmentSelected(e, false)"
      />
      <input ref="imageInputRef" type="file" class="cw-file-input" accept="image/*" multiple @change="(e) => onAttachmentSelected(e, true)" />
      <AppButton class="cw-tool-btn" title="Đính kèm file" :disabled="uploadingAttachment" @click="chooseFile"><AppIcon name="paperclip" /></AppButton>
      <AppButton class="cw-tool-btn" title="Gửi ảnh" :disabled="uploadingAttachment" @click="chooseImage"><AppIcon name="image" /></AppButton>
      <div class="cw-tool-sep"></div>
      <AppButton class="cw-tool-btn" title="Gửi sản phẩm (Product Card)" :disabled="uploadingAttachment" @click="emit('open-products')">
        <AppIcon name="armchair" />
      </AppButton>
      <AppButton class="cw-tool-btn" title="Chọn template (mở danh sách)" :disabled="uploadingAttachment" @click="emit('open-templates')">
        <AppIcon name="fileText" />
      </AppButton>
      <AppButton class="cw-tool-btn" title="Chèn Emoji" :disabled="uploadingAttachment"><AppIcon name="smile" /></AppButton>
    </div>

    <div class="cw-input-area-wrap">
      <div v-if="selectedAttachments.length" class="cw-attachment-list" :class="{ uploading: uploadingAttachment }">
        <div
          v-for="attachment in selectedAttachments"
          :key="attachment.id"
          class="cw-attachment-preview"
          :class="{ uploading: uploadingAttachment }"
        >
          <AppImage v-if="attachment.isImage" :src="attachment.previewUrl" alt="" class="cw-attachment-thumb"  />
          <div v-else class="cw-attachment-file"><AppIcon name="paperclip" /></div>
          <div class="cw-attachment-meta">
            <div class="cw-attachment-name">{{ attachment.name }}</div>
            <div class="cw-attachment-size">
              {{ uploadingAttachment ? 'Đang tải lên...' : formatBytes(attachment.size) }}
            </div>
          </div>
          <div v-if="uploadingAttachment" class="cw-upload-spinner" aria-hidden="true"></div>
          <AppButton type="button" class="cw-attachment-remove" title="Bỏ đính kèm" :disabled="uploadingAttachment" @click="removeAttachment(attachment.id)">
            <AppIcon name="x" />
          </AppButton>
          <div v-if="uploadingAttachment" class="cw-upload-bar" aria-hidden="true"></div>
        </div>
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
            :disabled="uploadingAttachment"
          ></textarea>
          <div class="cw-char-count">{{ messageText.length }}</div>
        </div>
        <AppButton class="cw-send-btn" @click="sendMsg" title="Gửi (Enter)" :disabled="uploadingAttachment">
          <span v-if="uploadingAttachment" class="cw-send-spinner" aria-hidden="true"></span>
          <AppIcon v-else name="send" />
        </AppButton>
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
