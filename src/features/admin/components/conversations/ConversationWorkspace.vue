<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  manager: {
    type: Object,
    required: true
  }
})

const mgr = props.manager
const emit = defineEmits(['open-templates', 'open-products'])

const currentAdmin = mgr.currentAdmin

const messageText = ref('')
const timelineRef = ref(null)
const inputWrapClasses = ref('')

const cannedFilter = ref('')
const filteredCanned = ref([])

const messages = ref([
  { id: 1, type: 'customer', text: 'Chào shop, cho mình hỏi về ghế xoay văn phòng có loại nào ngồi đỡ đau lưng không ạ?', time: '14:20' },
  { id: 2, type: 'system', text: 'Khách hàng vừa xem sản phẩm "Ghế Ergonomic ProFlex X1"', time: '14:21', icon: 'info' },
  { id: 3, type: 'admin', text: 'Dạ chào bạn, với nhu cầu ngồi lâu và đỡ đau lưng, mình gợi ý bạn các dòng ghế Công thái học (Ergonomic) bên mình ạ.', time: '14:22', senderName: currentAdmin.value.name, senderRole: currentAdmin.value.av }
])

function updateInputMode() {
  inputWrapClasses.value = mgr.currentMsgType.value === 'note' ? 'note-mode' : (mgr.currentMsgType.value === 'ai' ? 'ai-mode' : '')
}

watch(() => mgr.currentMsgType.value, updateInputMode)

function scrollToBottom() {
  nextTick(() => {
    if (timelineRef.value) {
      timelineRef.value.scrollTop = timelineRef.value.scrollHeight
    }
  })
}

watch(() => mgr.currentConvId.value, () => {
  messageText.value = ''
  scrollToBottom()
})

watch(
  () => mgr.pendingInsertText.value,
  (text) => {
    if (text) {
      messageText.value = text
      mgr.pendingInsertText.value = ''
      mgr.currentMsgType.value = 'reply'
    }
  },
)

function sendMsg() {
  if (!messageText.value.trim()) return

  if (mgr.currentMsgType.value === 'note') {
    messages.value.push({ id: Date.now(), type: 'note', text: messageText.value, time: 'Bây giờ', senderName: currentAdmin.value.name })
  } else {
    messages.value.push({
      id: Date.now(),
      type: 'admin',
      text: messageText.value,
      time: 'Bây giờ',
      senderName: currentAdmin.value.name,
      senderRole: currentAdmin.value.av,
    })
  }

  mgr.sendMessage(messageText.value, mgr.currentMsgType.value)
  messageText.value = ''
  scrollToBottom()
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMsg()
  } else if (e.key === '/' && messageText.value === '') {
    // Open canned picker
    mgr.cannedPickerOpen.value = true
    filterCanned()
  } else if (e.key === 'Escape') {
    mgr.cannedPickerOpen.value = false
  }
}

function useAiSuggestion(text) {
  mgr.insertSuggestion(text, messageText)
  mgr.currentMsgType.value = 'reply'
}

function filterCanned() {
  const q = cannedFilter.value.toLowerCase()
  filteredCanned.value = mgr.templates.value.filter((t) => {
    if (!t.active) return false
    return t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q)
  })
}

function selectCanned(content) {
  messageText.value = content
  mgr.cannedPickerOpen.value = false
  cannedFilter.value = ''
}

function formatTime(d) {
  return 'Bây giờ'
}
</script>

<template>
  <div class="cm-workspace">
    <!-- Header -->
    <div class="cw-header" v-if="mgr.currentConv.value">
      <div class="cw-hdr-av" :class="mgr.currentConv.value.avClass" :style="{ background: mgr.currentConv.value.avColor, color: mgr.currentConv.value.textColor }">
        {{ mgr.currentConv.value.av }}
        <div class="cm-ci-online" :class="mgr.currentConv.value.online"></div>
      </div>
      <div class="cw-hdr-info">
        <div class="cw-hdr-name">{{ mgr.currentConv.value.name }}</div>
        <div class="cw-hdr-meta">
          <span><AppIcon name="clock" :size="12" /> Đang chờ: 5m</span>
          <span class="sep-dot"></span>
          <span><AppIcon name="monitor" :size="12" /> Web (Windows)</span>
        </div>
      </div>
      
      <div class="cw-hdr-actions">
        <select class="cw-status-select" :value="mgr.currentConv.value.statusKey" @change="e => mgr.updateStatus(e.target.value)">
          <option value="new">Mới</option>
          <option value="pending">Đang xử lý</option>
          <option value="waiting">Chờ khách</option>
          <option value="resolved">Đã giải quyết</option>
          <option value="closed">Đã đóng</option>
        </select>
        <button class="cw-action-btn" title="Tìm kiếm trong cuộc hội thoại"><AppIcon name="search" /></button>
        <button
          class="cw-action-btn"
          :class="{ 'active-btn': mgr.detailPanelVisible.value }"
          title="Ẩn/Hiện thông tin khách hàng"
          @click="mgr.toggleDetailPanel()"
        >
          <AppIcon name="panelRight" />
        </button>
        <button class="cw-resolve-btn" title="Đánh dấu đã giải quyết" @click="mgr.resolveConversation()">
          <AppIcon name="check" /> Xong
        </button>
      </div>
    </div>

    <!-- Timeline -->
    <div class="cw-timeline" ref="timelineRef">
      <div class="tl-date-sep">Hôm nay</div>
      
      <div 
        v-for="msg in messages" 
        :key="msg.id"
        class="tl-msg-row"
        :class="`msg-${msg.type}`"
      >
        <template v-if="msg.type === 'customer'">
          <div class="tl-av" :class="mgr.currentConv.value.avClass" :style="{ background: mgr.currentConv.value.avColor, color: mgr.currentConv.value.textColor }">{{ mgr.currentConv.value.av }}</div>
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
          <div class="tl-system-pill">
            <AppIcon name="info" /> {{ msg.text }} · {{ msg.time }}
          </div>
        </template>
        
        <template v-if="msg.type === 'note'">
          <div class="tl-note-wrap">
            <div class="tl-note-header"><AppIcon name="lock" /> Ghi chú nội bộ - {{ msg.senderName || currentAdmin.name }}</div>
            {{ msg.text }}
          </div>
        </template>
      </div>
    </div>

    <!-- Quick replies -->
    <div class="cw-quick-replies">
      <button class="cw-qr-chip">Xin chào 👋</button>
      <button class="cw-qr-chip">Cần hỗ trợ thêm?</button>
      <button class="cw-qr-chip">Kiểm tra đơn hàng</button>
      <button class="cw-qr-chip">Bảo hành</button>
      <button class="cw-qr-chip" title="Gợi ý khác..."><AppIcon name="moreHorizontal" :size="12" /></button>
    </div>

    <!-- Input Area -->
    <div class="cw-input-area">
      <!-- Message Type Switcher -->
      <div class="cw-msg-type-row">
        <button class="cw-msg-type-btn" :class="{ active: mgr.currentMsgType.value === 'reply' }" @click="mgr.setMsgType('reply')">
          <AppIcon name="messageSquare" /> Trả lời
        </button>
        <button class="cw-msg-type-btn note-type" :class="{ active: mgr.currentMsgType.value === 'note' }" @click="mgr.setMsgType('note')">
          <AppIcon name="lock" /> Ghi chú nội bộ
        </button>
      </div>
      
      <!-- Toolbar -->
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
        <button
          class="cw-tool-btn"
          title="Template nhanh (phím /)"
          @click="mgr.cannedPickerOpen.value = !mgr.cannedPickerOpen.value; if (mgr.cannedPickerOpen.value) filterCanned()"
        >
          <AppIcon name="alignLeft" />
          <div class="cw-tool-tag">/</div>
        </button>
        <button class="cw-tool-btn" title="Chèn Emoji"><AppIcon name="smile" /></button>
      </div>
      
      <!-- Text input -->
      <div class="cw-input-area-wrap">
        <div class="cw-input-row">
          <div class="cw-input-wrap" :class="inputWrapClasses">
            <textarea 
              v-model="messageText"
              :placeholder="mgr.currentMsgType.value === 'note' ? 'Nhập ghi chú nội bộ (chỉ admin xem được)...' : 'Nhập tin nhắn trả lời... (Nhấn / để dùng template nhanh)'"
              @keydown="handleKeydown"
              rows="1"
            ></textarea>
            <div class="cw-char-count">{{ messageText.length }}</div>
          </div>
          <button class="cw-send-btn" @click="sendMsg" title="Gửi (Enter)">
            <AppIcon name="send" />
          </button>
        </div>
        
        <!-- Canned Picker Popover -->
        <div class="cw-canned-picker" v-if="mgr.cannedPickerOpen.value">
          <div class="canned-search">
            <AppIcon name="search" />
            <input type="text" v-model="cannedFilter" @input="filterCanned" placeholder="Tìm template (Tên, nội dung...)" />
          </div>
          <div class="canned-list">
            <div v-for="t in filteredCanned" :key="t.id" class="canned-item" @click="selectCanned(t.content)">
              <div class="canned-item-title">{{ t.title }}</div>
              <div class="canned-item-preview">{{ t.content }}</div>
            </div>
            <div v-if="filteredCanned.length === 0" style="padding: 10px; text-align: center; font-size: 11px; color: var(--text4);">Không tìm thấy.</div>
          </div>
        </div>
      </div>
      
      <!-- Footer Info -->
      <div class="cw-footer-bar">
        <div class="cw-footer-info">
          <AppIcon name="checkCheck" /> Đang trả lời với tư cách: <strong>{{ currentAdmin.name }}</strong>
        </div>
        <div class="cw-footer-hint"><strong>Enter</strong> để gửi, <strong>Shift + Enter</strong> để xuống dòng</div>
      </div>
    </div>
  </div>
</template>
