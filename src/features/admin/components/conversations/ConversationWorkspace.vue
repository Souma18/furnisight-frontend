<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAdminConversationStore } from '../../store/adminConversationStore'

const props = defineProps({
  templateMgr: {
    type: Object,
    required: true,
  },
})

const store = useAdminConversationStore()
const templateMgr = props.templateMgr
const emit = defineEmits(['open-templates', 'open-products'])

const currentAdmin = computed(() => store.currentAdmin)

const messageText = ref('')
const timelineRef = ref(null)
const inputWrapClasses = ref('')

const quickReplies = [
  'Xin chào 👋',
  'Cần hỗ trợ thêm?',
  'Kiểm tra đơn hàng',
  'Bảo hành',
]

const messages = computed(() => store.workspace.messages)

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
  if (!messageText.value.trim()) return

  const text = messageText.value
  const type = store.workspace.msgType
  messageText.value = ''
  
  if (type === 'note') {
    await store.sendInternalNote(text)
  } else {
    await store.sendCustomerReply(text)
  }
  
  scrollToBottom()
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
        {{ store.currentConv.av }}
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

      <div v-for="msg in messages" :key="msg.id" class="tl-msg-row" :class="`msg-${msg.type}`">
        <template v-if="msg.type === 'customer'">
          <div
            class="tl-av"
            :class="store.currentConv.avClass"
            :style="{ background: store.currentConv.avColor, color: store.currentConv.textColor }"
          >
            {{ store.currentConv.av }}
          </div>
          <div class="tl-msg-group">
            <div class="tl-bubble customer">{{ msg.text }}</div>
            <div class="tl-msg-meta">{{ msg.time }}</div>
          </div>
        </template>

        <template v-if="msg.type === 'admin'">
          <div class="tl-msg-group">
            <div class="tl-bubble admin">{{ msg.text }}</div>
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
            {{ msg.text }}
          </div>
        </template>
      </div>
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
        <button class="cw-tool-btn" title="Đính kèm file"><AppIcon name="paperclip" /></button>
        <button class="cw-tool-btn" title="Gửi ảnh"><AppIcon name="image" /></button>
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
          <button class="cw-send-btn" @click="sendMsg" title="Gửi (Enter)">
            <AppIcon name="send" />
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
