<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { ref, computed } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAdminUiStore } from '../../../store/adminUiStore'
import {
  DOCUMENT_FILE_ACCEPT,
  chatAttachmentFormatError,
  chatAttachmentSizeError,
  isAllowedChatDocument,
  isAllowedChatAttachmentSize,
  isAllowedChatImage,
} from '@features/chat/lib/chatAttachmentRules'

const props = defineProps({
  modelValue: { type: String, default: '' },
  msgType: { type: String, default: 'reply' },
  attachments: { type: Array, default: () => [] },
  uploading: { type: Boolean, default: false },
  currentAdminName: { type: String, required: true },
})

const emit = defineEmits([
  'update:modelValue',
  'update:msgType',
  'update:attachments',
  'send',
  'open-products',
  'open-templates'
])

const uiStore = useAdminUiStore()

const fileInputRef = ref(null)
const imageInputRef = ref(null)

const quickReplies = [
  'Xin chào 👋',
  'Cần hỗ trợ thêm?',
  'Kiểm tra đơn hàng',
  'Bảo hành',
]

const inputWrapClasses = computed(() => {
  return props.msgType === 'note' ? 'note-mode' : props.msgType === 'ai' ? 'ai-mode' : ''
})

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    emit('send')
  }
}

function insertQuickReply(text) {
  emit('update:modelValue', text)
  emit('update:msgType', 'reply')
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

  emit('update:attachments', [...props.attachments, ...nextAttachments])
}

function removeAttachment(id) {
  const removed = props.attachments.find((item) => item.id === id)
  if (removed?.previewUrl) {
    URL.revokeObjectURL(removed.previewUrl)
  }
  emit('update:attachments', props.attachments.filter((item) => item.id !== id))
}
</script>

<template>
  <div class="cw-input-area">
    <!-- Quick replies -->
    <div class="cw-quick-replies">
      <AppButton
        v-for="reply in quickReplies"
        :key="reply"
        type="button"
        class="cw-qr-chip"
        @click="insertQuickReply(reply)"
      >
        {{ reply }}
      </AppButton>
      <AppButton type="button" class="cw-qr-chip" title="Gợi ý khác..." @click="emit('open-templates')">
        <AppIcon name="moreHorizontal" :size="12" />
      </AppButton>
    </div>

    <div class="cw-msg-type-row">
      <AppButton
        class="cw-msg-type-btn"
        :class="{ active: msgType === 'reply' }"
        @click="emit('update:msgType', 'reply')"
      >
        <AppIcon name="messageSquare" /> Trả lời
      </AppButton>
      <AppButton
        class="cw-msg-type-btn note-type"
        :class="{ active: msgType === 'note' }"
        @click="emit('update:msgType', 'note')"
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
      <input
        ref="imageInputRef"
        type="file"
        class="cw-file-input"
        accept="image/*"
        multiple
        @change="(e) => onAttachmentSelected(e, true)"
      />
      <AppButton class="cw-tool-btn" title="Đính kèm file" :disabled="uploading" @click="chooseFile">
        <AppIcon name="paperclip" />
      </AppButton>
      <AppButton class="cw-tool-btn" title="Gửi ảnh" :disabled="uploading" @click="chooseImage">
        <AppIcon name="image" />
      </AppButton>
      <div class="cw-tool-sep"></div>
      <AppButton class="cw-tool-btn" title="Gửi sản phẩm (Product Card)" :disabled="uploading" @click="emit('open-products')">
        <AppIcon name="armchair" />
      </AppButton>
      <AppButton class="cw-tool-btn" title="Chọn template (mở danh sách)" :disabled="uploading" @click="emit('open-templates')">
        <AppIcon name="fileText" />
      </AppButton>
      <AppButton class="cw-tool-btn" title="Chèn Emoji" :disabled="uploading">
        <AppIcon name="smile" />
      </AppButton>
    </div>

    <div class="cw-input-area-wrap">
      <div v-if="attachments.length" class="cw-attachment-list" :class="{ uploading: uploading }">
        <div
          v-for="attachment in attachments"
          :key="attachment.id"
          class="cw-attachment-preview"
          :class="{ uploading: uploading }"
        >
          <AppImage v-if="attachment.isImage" :src="attachment.previewUrl" alt="" class="cw-attachment-thumb"  />
          <div v-else class="cw-attachment-file"><AppIcon name="paperclip" /></div>
          <div class="cw-attachment-meta">
            <div class="cw-attachment-name">{{ attachment.name }}</div>
            <div class="cw-attachment-size">
              {{ uploading ? 'Đang tải lên...' : formatBytes(attachment.size) }}
            </div>
          </div>
          <div v-if="uploading" class="cw-upload-spinner" aria-hidden="true"></div>
          <AppButton
            type="button"
            class="cw-attachment-remove"
            title="Bỏ đính kèm"
            :disabled="uploading"
            @click="removeAttachment(attachment.id)"
          >
            <AppIcon name="x" />
          </AppButton>
          <div v-if="uploading" class="cw-upload-bar" aria-hidden="true"></div>
        </div>
      </div>
      <div class="cw-input-row">
        <div class="cw-input-wrap" :class="inputWrapClasses">
          <textarea
            :value="modelValue"
            @input="emit('update:modelValue', $event.target.value)"
            :placeholder="
              msgType === 'note'
                ? 'Nhập ghi chú nội bộ (chỉ admin xem được)...'
                : 'Nhập tin nhắn trả lời... (Nhấn / để dùng template nhanh)'
            "
            @keydown="handleKeydown"
            rows="1"
            :disabled="uploading"
          ></textarea>
          <div class="cw-char-count">{{ modelValue.length }}</div>
        </div>
        <AppButton class="cw-send-btn" @click="emit('send')" title="Gửi (Enter)" :disabled="uploading">
          <span v-if="uploading" class="cw-send-spinner" aria-hidden="true"></span>
          <AppIcon v-else name="send" />
        </AppButton>
      </div>
    </div>

    <div class="cw-footer-bar">
      <div class="cw-footer-info">
        <AppIcon name="checkCheck" /> Đang trả lời với tư cách: <strong>{{ currentAdminName }}</strong>
      </div>
      <div class="cw-footer-hint"><strong>Enter</strong> để gửi, <strong>Shift + Enter</strong> để xuống dòng</div>
    </div>
  </div>
</template>
