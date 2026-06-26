<script setup>
import { computed, ref, watch, nextTick } from 'vue'
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
const selectedAttachment = ref(null)
const uploadingAttachment = ref(false)

const quickReplies = [
  'Xin chào 👋',
  'Cần hỗ trợ thêm?',
  'Kiểm tra đơn hàng',
  'Bảo hành',
]

const messages = computed(() => store.workspace.messages)
const timelineItems = computed(() => insertClosedLine(messages.value, store.currentConv?.closedAt, closedLine.value))

function updateInputMode() {
  inputWrapClasses.value =
    store.workspace.msgType === 'note' ? 'note-mode' : store.workspace.msgType === 'ai' ? 'ai-mode' : ''
}

watch(() => store.workspace.msgType, updateInputMode)

function scrollToBottom() {
  nextTick(() => {
    if (timelineRef.value) {
      timelineRef.value.scrollTop = timelineRef.value.scrollHeight
    }
  })
}

watch(() => store.workspace.convId, () => {
  messageText.value = ''
  clearAttachment()
  scrollToBottom()
})

watch(
  messages,
  () => {
    scrollToBottom()
  },
  { deep: true },
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
    
    scrollToBottom()
  } catch (error) {
    uiStore.showToast({ icon: 'alert', title: 'Không thể gửi đính kèm', subtitle: error.message || '' })
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

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(String(value || ''))
}

function formatBytes(bytes = 0) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
</script>

<template>
  <div class="cm-workspace">
    <!-- Header -->
    <div class="cw-header" v-if="store.currentConv">
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
        <button class="cw-action-btn" title="Tìm kiếm trong cuộc hội thoại"><AppIcon name="search" /></button>
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

    <div v-else-if="store.inbox.loading" class="cw-empty-state">Đang tải hội thoại...</div>
    <div v-else class="cw-empty-state">Chưa có hội thoại nào</div>

    <!-- Timeline -->
    <div v-if="store.currentConv" class="cw-timeline" ref="timelineRef">
      <div v-if="store.workspace.loading" class="tl-date-sep">Đang tải tin nhắn...</div>
      <div v-else class="tl-date-sep">Hôm nay</div>

      <template v-for="msg in timelineItems" :key="msg.id">
      <div v-if="msg.type === 'closed-line'" class="tl-date-sep tl-date-sep--closed">{{ msg.text }}</div>
      <div v-else class="tl-msg-row" :class="`msg-${msg.type}`">
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
              <a v-if="msg.attachment?.isImage && msg.attachment.url" :href="msg.attachment.url" target="_blank" rel="noreferrer" class="tl-attachment-image">
                <img :src="msg.attachment.url" :alt="msg.attachment.name" />
              </a>
              <a v-else-if="msg.attachment" :href="msg.attachment.url || '#'" target="_blank" rel="noreferrer" class="tl-attachment-file">
                <AppIcon name="paperclip" />
                <span>{{ msg.attachment.name }}</span>
                <small>{{ formatBytes(msg.attachment.size) }}</small>
              </a>
            </div>
            <div class="tl-msg-meta">{{ msg.time }}</div>
          </div>
        </template>

        <template v-if="msg.type === 'admin'">
          <div class="tl-msg-group">
            <div class="tl-bubble admin">
              <div v-if="msg.text">{{ msg.text }}</div>
              <a v-if="msg.attachment?.isImage && msg.attachment.url" :href="msg.attachment.url" target="_blank" rel="noreferrer" class="tl-attachment-image">
                <img :src="msg.attachment.url" :alt="msg.attachment.name" />
              </a>
              <a v-else-if="msg.attachment" :href="msg.attachment.url || '#'" target="_blank" rel="noreferrer" class="tl-attachment-file">
                <AppIcon name="paperclip" />
                <span>{{ msg.attachment.name }}</span>
                <small>{{ formatBytes(msg.attachment.size) }}</small>
              </a>
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
            <a v-if="msg.attachment?.isImage && msg.attachment.url" :href="msg.attachment.url" target="_blank" rel="noreferrer" class="tl-attachment-image">
              <img :src="msg.attachment.url" :alt="msg.attachment.name" />
            </a>
            <a v-else-if="msg.attachment" :href="msg.attachment.url || '#'" target="_blank" rel="noreferrer" class="tl-attachment-file">
              <AppIcon name="paperclip" />
              <span>{{ msg.attachment.name }}</span>
              <small>{{ formatBytes(msg.attachment.size) }}</small>
            </a>
          </div>
        </template>
      </div>
      </template>
    </div>

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
  </div>
</template>
