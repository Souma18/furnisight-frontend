<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAdminConversationStore } from '../../store/adminConversationStore'
import { useAdminUiStore } from '../../store/adminUiStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { uploadChatAttachment } from '../../lib/chatAttachmentUpload'
import { formatChatError } from '@features/chat/lib/chatErrorMessages'
import { downloadChatAttachment } from '@features/chat/lib/chatAttachmentDownload'
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

const store = useAdminConversationStore()
const uiStore = useAdminUiStore()
const authStore = useAuthStore()
const templateMgr = props.templateMgr
const emit = defineEmits(['open-templates', 'open-products'])

const currentAdmin = computed(() => store.currentAdmin)
const closedLine = computed(() => formatClosedLine(store.currentConv?.closedAt))

const messageText = ref('')
const timelineRef = ref(null)
const inputWrapClasses = ref('')
const fileInputRef = ref(null)
const imageInputRef = ref(null)
const selectedAttachments = ref([])
const uploadingAttachment = ref(false)
const showScrollBottom = ref(false)

const quickReplies = [
  'Xin chào 👋',
  'Cần hỗ trợ thêm?',
  'Kiểm tra đơn hàng',
  'Bảo hành',
]

const messages = computed(() => store.workspace.messages)
const timelineItems = computed(() => insertClosedLine(messages.value, store.currentConv?.closedAt, closedLine.value))
const searchState = computed(() => store.workspace.search || {
  visible: false,
  query: '',
  resultIds: [],
  activeIndex: -1,
})
const activeSearchMessageId = computed(() => {
  const search = searchState.value
  return search.resultIds[search.activeIndex] || null
})

function updateInputMode() {
  inputWrapClasses.value =
    store.workspace.msgType === 'note' ? 'note-mode' : store.workspace.msgType === 'ai' ? 'ai-mode' : ''
}

watch(() => store.workspace.msgType, updateInputMode)

function updateScrollBottomVisibility() {
  const el = timelineRef.value
  if (!el) {
    showScrollBottom.value = false
    return
  }
  showScrollBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight > 120
}

function scrollToBottom() {
  if (activeSearchMessageId.value) return
  nextTick(() => {
    if (timelineRef.value) {
      timelineRef.value.scrollTop = timelineRef.value.scrollHeight
      updateScrollBottomVisibility()
    }
  })
}

function scrollToBottomNow() {
  nextTick(() => {
    const el = timelineRef.value
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    window.setTimeout(updateScrollBottomVisibility, 280)
  })
}

function scrollToSearchResult() {
  const activeId = activeSearchMessageId.value
  if (!activeId) return

  nextTick(() => {
    const node = timelineRef.value?.querySelector(`[data-message-id="${activeId}"]`)
    node?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    window.setTimeout(updateScrollBottomVisibility, 280)
  })
}

function handleTimelineScroll() {
  updateScrollBottomVisibility()
}

function isSearchHit(id) {
  return searchState.value.resultIds.includes(id)
}

function isActiveSearchHit(id) {
  return activeSearchMessageId.value === id
}

watch(() => store.workspace.convId, () => {
  messageText.value = ''
  clearAttachments()
  scrollToBottom()
})

watch(
  messages,
  () => {
    scrollToBottom()
  },
  { deep: true },
)

watch(activeSearchMessageId, () => {
  scrollToSearchResult()
})

watch(
  () => [searchState.value.query, searchState.value.activeIndex, searchState.value.resultIds.join('|')],
  () => {
    scrollToSearchResult()
  },
)

watch(
  () => templateMgr.pendingInsertText.value,
  (text) => {
    if (text) {
      messageText.value = text
      templateMgr.pendingInsertText.value = ''
      store.workspace.msgType = 'reply'
    }
  },
)

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
    
    scrollToBottom()
  } catch (error) {
    uiStore.showToast({
      icon: 'alert',
      title: 'Không thể gửi đính kèm',
      subtitle: formatChatError(error, 'Không tải được tệp lên. Vui lòng thử lại.'),
    })
    console.error('[ConversationWorkspace] attachment send failed', error)
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

function insertQuickReply(text) {
  messageText.value = text
  store.setMsgType('reply')
}

function formatBytes(bytes = 0) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function handleAttachmentClick(event, attachment) {
  if (attachment?.isImage) return
  event.preventDefault()
  downloadChatAttachment(attachment)
}

function formatClosedLine(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
  const day = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `Hội thoại đã đóng lúc ${time} ${day}`
}

function insertClosedLine(items, closedAt, label) {
  if (!closedAt || !label) return items

  const closedTime = new Date(closedAt).getTime()
  if (Number.isNaN(closedTime)) return items

  const line = {
    id: `closed-line-${closedAt}`,
    type: 'closed-line',
    text: label,
    createdAt: closedAt,
  }
  const result = []
  let inserted = false

  for (const item of items) {
    const itemTime = new Date(item.createdAt || 0).getTime()
    if (!inserted && !Number.isNaN(itemTime) && itemTime > closedTime) {
      result.push(line)
      inserted = true
    }
    result.push(item)
  }

  if (!inserted) {
    result.push(line)
  }

  return result
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
</script>

<template>
  <div class="cm-workspace">
    <!-- Header -->
    <div v-if="store.currentConv" class="cw-header-shell">
      <div class="cw-header">
        <div
          class="cw-hdr-av"
          :class="store.currentConv.avClass"
          :style="{ background: store.currentConv.avColor, color: store.currentConv.textColor }"
        >
          <img v-if="store.currentConv.avatarUrl" :src="store.currentConv.avatarUrl" :alt="store.currentConv.name" />
          <span v-else>{{ store.currentConv.av }}</span>
          <div class="cm-ci-online" :class="store.currentConv.online"></div>
        </div>
        <div class="cw-hdr-info">
          <div class="cw-hdr-name">{{ store.currentConv.name }}</div>
          <div class="cw-hdr-meta">
            <span><AppIcon name="clock" :size="12" /> Kênh {{ store.currentConv.channel || 'SUPPORT' }}</span>
            <span class="sep-dot"></span>
            <span v-if="store.socket.connected"><AppIcon name="wifi" :size="12" /> Đang kết nối</span>
          </div>
        </div>

        <div class="cw-hdr-actions">
          <select
            class="cw-status-select"
            :value="store.currentConv.statusKey"
            @change="(e) => store.updateStatus(e.target.value)"
          >
            <option value="new">Mới</option>
            <option value="assigned">Đã giao</option>
            <option value="pending">Đang xử lý</option>
            <option value="waiting">Chờ khách</option>
            <option value="resolved">Đã giải quyết</option>
            <option value="closed">Đã đóng</option>
          </select>
          <button
            class="cw-action-btn"
            :class="{ 'active-btn': store.workspace.detailVisible }"
            title="Ẩn/Hiện thông tin khách hàng"
            @click="store.toggleDetailPanel()"
          >
            <AppIcon name="panelRight" />
          </button>
          <button class="cw-resolve-btn" title="Đánh dấu đã giải quyết" @click="store.resolveConversation()">
            <AppIcon name="check" /> Xong
          </button>
        </div>
      </div>

    </div>

    <div v-else-if="store.inbox.loading" class="cw-empty-state">Đang tải hội thoại...</div>
    <div v-else class="cw-empty-state">Chưa có hội thoại nào</div>

    <!-- Timeline -->
    <div v-if="store.currentConv" class="cw-timeline" ref="timelineRef" @scroll="handleTimelineScroll">
      <div v-if="store.workspace.loading" class="tl-date-sep">Đang tải tin nhắn...</div>
      <div v-else class="tl-date-sep">Hôm nay</div>

      <template v-for="msg in timelineItems" :key="msg.id">
      <div v-if="msg.type === 'closed-line'" class="tl-date-sep tl-date-sep--closed">{{ msg.text }}</div>
      <div
        v-else
        class="tl-msg-row"
        :class="[`msg-${msg.type}`, {
          'tl-msg-row--search-hit': isSearchHit(msg.id),
          'tl-msg-row--search-active': isActiveSearchHit(msg.id),
        }]"
        :data-message-id="msg.id"
      >
        <template v-if="msg.type === 'customer'">
          <div
            class="tl-av"
            :class="store.currentConv.avClass"
            :style="{ background: store.currentConv.avColor, color: store.currentConv.textColor }"
          >
            <img v-if="store.currentConv.avatarUrl" :src="store.currentConv.avatarUrl" :alt="store.currentConv.name" />
            <span v-else>{{ store.currentConv.av }}</span>
          </div>
          <div class="tl-msg-group">
            <div class="tl-bubble customer">
              <div v-if="msg.text">{{ msg.text }}</div>
              <div v-if="msg.attachments?.length" class="tl-attachment-list">
                <a
                  v-for="attachment in msg.attachments"
                  :key="attachment.mediaId || attachment.url || attachment.name"
                  :href="attachment.url || '#'"
                  target="_blank"
                  rel="noreferrer"
                  :download="!attachment.isImage ? attachment.name : undefined"
                  :class="attachment.isImage ? 'tl-attachment-image' : 'tl-attachment-file'"
                  @click="handleAttachmentClick($event, attachment)"
                >
                  <img v-if="attachment.isImage" :src="attachment.url" :alt="attachment.name" />
                  <template v-else>
                    <AppIcon name="paperclip" />
                    <span>{{ attachment.name }}</span>
                    <small>{{ formatBytes(attachment.size) }}</small>
                  </template>
                </a>
              </div>
            </div>
            <div class="tl-msg-meta">{{ msg.time }}</div>
          </div>
        </template>

        <template v-if="msg.type === 'admin'">
          <div class="tl-msg-group">
            <div class="tl-bubble admin">
              <div v-if="msg.text">{{ msg.text }}</div>
              <div v-if="msg.attachments?.length" class="tl-attachment-list">
                <a
                  v-for="attachment in msg.attachments"
                  :key="attachment.mediaId || attachment.url || attachment.name"
                  :href="attachment.url || '#'"
                  target="_blank"
                  rel="noreferrer"
                  :download="!attachment.isImage ? attachment.name : undefined"
                  :class="attachment.isImage ? 'tl-attachment-image' : 'tl-attachment-file'"
                  @click="handleAttachmentClick($event, attachment)"
                >
                  <img v-if="attachment.isImage" :src="attachment.url" :alt="attachment.name" />
                  <template v-else>
                    <AppIcon name="paperclip" />
                    <span>{{ attachment.name }}</span>
                    <small>{{ formatBytes(attachment.size) }}</small>
                  </template>
                </a>
              </div>
            </div>
            <div class="tl-msg-meta">
              <span>{{ msg.time }}</span> <AppIcon name="checkCheck" :size="11" class="read" />
            </div>
          </div>
          <div class="tl-av" style="background: var(--navy); color: var(--gold3)">{{ msg.senderRole }}</div>
        </template>

        <template v-if="msg.type === 'system'">
          <div class="tl-system-pill"><AppIcon name="info" /> {{ msg.text }} · {{ msg.time }}</div>
        </template>

        <template v-if="msg.type === 'note'">
          <div class="tl-note-wrap">
          <div class="tl-note-header">
            <AppIcon name="lock" /> Ghi chú nội bộ - {{ msg.senderName || currentAdmin.name }}
          </div>
          <div v-if="msg.text">{{ msg.text }}</div>
          <div v-if="msg.attachments?.length" class="tl-attachment-list">
            <a
              v-for="attachment in msg.attachments"
              :key="attachment.mediaId || attachment.url || attachment.name"
              :href="attachment.url || '#'"
              target="_blank"
              rel="noreferrer"
              :download="!attachment.isImage ? attachment.name : undefined"
              :class="attachment.isImage ? 'tl-attachment-image' : 'tl-attachment-file'"
              @click="handleAttachmentClick($event, attachment)"
            >
              <img v-if="attachment.isImage" :src="attachment.url" :alt="attachment.name" />
              <template v-else>
                <AppIcon name="paperclip" />
                <span>{{ attachment.name }}</span>
                <small>{{ formatBytes(attachment.size) }}</small>
              </template>
            </a>
          </div>
        </div>
        </template>
      </div>
      </template>
    </div>

    <button
      v-if="store.currentConv && showScrollBottom"
      type="button"
      class="cw-scroll-bottom"
      title="Xuống tin mới nhất"
      aria-label="Xuống tin mới nhất"
      @click="scrollToBottomNow"
    >
      <AppIcon name="chevronDown" :size="18" />
    </button>

    <!-- Quick replies -->
    <div v-if="store.currentConv" class="cw-quick-replies">
      <button
        v-for="reply in quickReplies"
        :key="reply"
        type="button"
        class="cw-qr-chip"
        @click="insertQuickReply(reply)"
      >
        {{ reply }}
      </button>
      <button type="button" class="cw-qr-chip" title="Gợi ý khác..." @click="emit('open-templates')">
        <AppIcon name="moreHorizontal" :size="12" />
      </button>
    </div>

    <!-- Input Area -->
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
        <input
          ref="fileInputRef"
          type="file"
          class="cw-file-input"
          :accept="DOCUMENT_FILE_ACCEPT"
          multiple
          @change="(e) => onAttachmentSelected(e, false)"
        />
        <input ref="imageInputRef" type="file" class="cw-file-input" accept="image/*" multiple @change="(e) => onAttachmentSelected(e, true)" />
        <button class="cw-tool-btn" title="Đính kèm file" :disabled="uploadingAttachment" @click="chooseFile"><AppIcon name="paperclip" /></button>
        <button class="cw-tool-btn" title="Gửi ảnh" :disabled="uploadingAttachment" @click="chooseImage"><AppIcon name="image" /></button>
        <div class="cw-tool-sep"></div>
        <button class="cw-tool-btn" title="Gửi sản phẩm (Product Card)" :disabled="uploadingAttachment" @click="emit('open-products')">
          <AppIcon name="armchair" />
        </button>
        <button class="cw-tool-btn" title="Chọn template (mở danh sách)" :disabled="uploadingAttachment" @click="emit('open-templates')">
          <AppIcon name="fileText" />
        </button>
        <button class="cw-tool-btn" title="Chèn Emoji" :disabled="uploadingAttachment"><AppIcon name="smile" /></button>
      </div>

      <div class="cw-input-area-wrap">
        <div v-if="selectedAttachments.length" class="cw-attachment-list" :class="{ uploading: uploadingAttachment }">
          <div
            v-for="attachment in selectedAttachments"
            :key="attachment.id"
            class="cw-attachment-preview"
            :class="{ uploading: uploadingAttachment }"
          >
            <img v-if="attachment.isImage" :src="attachment.previewUrl" alt="" class="cw-attachment-thumb" />
            <div v-else class="cw-attachment-file"><AppIcon name="paperclip" /></div>
            <div class="cw-attachment-meta">
              <div class="cw-attachment-name">{{ attachment.name }}</div>
              <div class="cw-attachment-size">
                {{ uploadingAttachment ? 'Đang tải lên...' : formatBytes(attachment.size) }}
              </div>
            </div>
            <div v-if="uploadingAttachment" class="cw-upload-spinner" aria-hidden="true"></div>
            <button type="button" class="cw-attachment-remove" title="Bỏ đính kèm" :disabled="uploadingAttachment" @click="removeAttachment(attachment.id)">
              <AppIcon name="x" />
            </button>
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
          <button class="cw-send-btn" @click="sendMsg" title="Gửi (Enter)" :disabled="uploadingAttachment">
            <span v-if="uploadingAttachment" class="cw-send-spinner" aria-hidden="true"></span>
            <AppIcon v-else name="send" />
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
  </div>
</template>
