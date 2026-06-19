<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import AuthModal from '@features/auth/components/AuthModal.vue'
import { useChat } from '../composables/useChat'
import ChatMessageBubble from './ChatMessageBubble.vue'
import '../styles/chatWidget.css'

const {
  isOpen,
  isTyping,
  unreadCount,
  messages,
  draft,
  agent,
  quickChips,
  hasUnread,
  messagesRef,
  inputRef,
  showFabTooltip,
  authModalOpen,
  todayLabel,
  formatTimeLabel,
  toggleChat,
  sendDraft,
  quickSend,
  handleInputKeydown,
  resizeTextarea,
  handleAuthenticated,
  closeAuthModal,
  closeChat,
  loading,
  error,
  connectionStatus,
} = useChat()

const CHAT_POSITION_KEY = 'furnisight:chat-position'
const FAB_SIZE = 56
const EDGE_GAP = 12
const position = reactive({ right: 32, bottom: 32 })
const dragging = ref(false)
let dragStart = null
let suppressNextClick = false

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

function defaultPosition() {
  return window.innerWidth <= 480 ? { right: 16, bottom: 20 } : { right: 32, bottom: 32 }
}

function constrainPosition() {
  position.right = clamp(position.right, EDGE_GAP, window.innerWidth - FAB_SIZE - EDGE_GAP)
  position.bottom = clamp(position.bottom, EDGE_GAP, window.innerHeight - FAB_SIZE - EDGE_GAP)
}

function savePosition() {
  localStorage.setItem(CHAT_POSITION_KEY, JSON.stringify({
    right: Math.round(position.right),
    bottom: Math.round(position.bottom),
  }))
}

function loadPosition() {
  const fallback = defaultPosition()
  try {
    const saved = JSON.parse(localStorage.getItem(CHAT_POSITION_KEY) || 'null')
    position.right = Number.isFinite(saved?.right) ? saved.right : fallback.right
    position.bottom = Number.isFinite(saved?.bottom) ? saved.bottom : fallback.bottom
  } catch {
    position.right = fallback.right
    position.bottom = fallback.bottom
  }
  constrainPosition()
}

const widgetStyle = computed(() => {
  const modalWidth = Math.min(420, window.innerWidth - 24)
  const modalHeight = Math.min(580, window.innerHeight * 0.72)
  const maxModalRight = window.innerWidth - modalWidth - EDGE_GAP
  const maxModalBottom = window.innerHeight - modalHeight - EDGE_GAP
  const modalRight = clamp(position.right, EDGE_GAP, maxModalRight)
  const modalBottom = clamp(position.bottom + FAB_SIZE + 16, EDGE_GAP, maxModalBottom)
  const tooltipRight = clamp(position.right + FAB_SIZE + 12, EDGE_GAP, window.innerWidth - 260)

  return {
    '--chat-right': `${position.right}px`,
    '--chat-bottom': `${position.bottom}px`,
    '--chat-modal-right': `${modalRight}px`,
    '--chat-modal-bottom': `${modalBottom}px`,
    '--chat-tooltip-right': `${tooltipRight}px`,
    '--chat-tooltip-bottom': `${position.bottom + 2}px`,
  }
})

function handleDragStart(event) {
  if (event.button !== 0 && event.pointerType === 'mouse') return
  dragStart = {
    pointerX: event.clientX,
    pointerY: event.clientY,
    right: position.right,
    bottom: position.bottom,
    moved: false,
  }
  dragging.value = true
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

function handleDragMove(event) {
  if (!dragStart) return
  const deltaX = event.clientX - dragStart.pointerX
  const deltaY = event.clientY - dragStart.pointerY
  if (Math.hypot(deltaX, deltaY) > 5) dragStart.moved = true
  if (!dragStart.moved) return

  event.preventDefault()
  position.right = dragStart.right - deltaX
  position.bottom = dragStart.bottom - deltaY
  constrainPosition()
}

function handleDragEnd(event) {
  if (!dragStart) return
  suppressNextClick = dragStart.moved
  dragging.value = false
  dragStart = null
  event.currentTarget.releasePointerCapture?.(event.pointerId)
  savePosition()
}

function handleFabClick() {
  if (suppressNextClick) {
    suppressNextClick = false
    return
  }
  toggleChat()
}

function handleViewportResize() {
  constrainPosition()
}

onMounted(() => {
  loadPosition()
  window.addEventListener('resize', handleViewportResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleViewportResize)
})

function handleAddToCart(product) {
  // TODO(BE/cart): gắn cartStore.addItem khi có API sản phẩm chat
  console.info('[chat] add to cart', product)
}
</script>

<template>
  <div class="chat-widget" :style="widgetStyle">
    <div class="chat-fab-tooltip" :class="{ show: showFabTooltip && !isOpen }">
      FurniSight Support đang trực tuyến!
    </div>

    <button
      type="button"
      class="chat-fab"
      :class="{ open: isOpen, dragging }"
      aria-label="Mở hỗ trợ trực tuyến"
      title="Bấm để mở, kéo để di chuyển"
      @click="handleFabClick"
      @pointerdown="handleDragStart"
      @pointermove="handleDragMove"
      @pointerup="handleDragEnd"
      @pointercancel="handleDragEnd"
    >
      <span class="chat-fab-icon chat-fab-icon--bot">
        <AppIcon name="headset" :size="24" />
      </span>
      <span class="chat-fab-icon chat-fab-icon--close">
        <AppIcon name="close" :size="22" />
      </span>
      <span v-if="hasUnread && !isOpen" class="chat-fab-badge">{{ unreadCount }}</span>
    </button>

    <div
      class="chat-modal"
      :class="{ open: isOpen }"
      role="dialog"
      aria-label="Hỗ trợ trực tuyến FurniSight"
    >
      <header class="chat-header">
        <div class="chat-agent-avatar">
          <AppIcon name="headset" :size="20" />
          <span class="chat-agent-online" aria-hidden="true" />
        </div>

        <div class="chat-agent-info">
          <div class="chat-agent-name">
            {{ agent.name }}
            <span class="chat-agent-badge">{{ agent.badge }}</span>
          </div>
          <div class="chat-agent-status">
            <span class="chat-agent-status-dot" aria-hidden="true" />
            {{ agent.status }}
          </div>
        </div>

        <div class="chat-header-actions">
          <button type="button" class="chat-hdr-btn" title="Tìm kiếm" aria-label="Tìm kiếm">
            <AppIcon name="search" :size="15" />
          </button>
          <button type="button" class="chat-hdr-btn" title="Thu nhỏ" aria-label="Thu nhỏ" @click="closeChat">
            <AppIcon name="minus" :size="15" />
          </button>
        </div>
      </header>

      <div class="chat-chips">
        <button
          v-for="chip in quickChips"
          :key="chip.id"
          type="button"
          class="chat-chip"
          @click="quickSend(chip.text)"
        >
          {{ chip.label }}
        </button>
      </div>

      <div ref="messagesRef" class="chat-messages">
        <div v-if="error" class="chat-date-sep chat-error-banner">{{ error }}</div>
        <div v-else-if="connectionStatus === 'error'" class="chat-date-sep chat-error-banner">
          Mất kết nối realtime. Tin nhắn có thể trễ.
        </div>
        <div v-if="loading && !messages.length" class="chat-date-sep">Đang tải hội thoại...</div>
        <div class="chat-date-sep">{{ todayLabel }}</div>

        <ChatMessageBubble
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :time-label="formatTimeLabel(message.createdAt)"
          @add-to-cart="handleAddToCart"
        />

        <div v-if="isTyping" class="chat-msg">
          <div class="msg-avatar bot">
            <AppIcon name="headset" :size="14" />
          </div>
          <div class="bubble bot">
            <div class="typing-bubble">
              <span class="typing-dot" />
              <span class="typing-dot" />
              <span class="typing-dot" />
            </div>
          </div>
        </div>
      </div>

      <footer class="chat-input-bar">
        <div class="chat-input-row">
          <div class="chat-input-wrap">
            <textarea
              ref="inputRef"
              v-model="draft"
              rows="1"
              placeholder="Nhập tin nhắn..."
              @keydown="handleInputKeydown"
              @input="resizeTextarea"
            />
            <button type="button" class="chat-input-attach" title="Đính kèm ảnh" aria-label="Đính kèm">
              <AppIcon name="image" :size="17" />
            </button>
          </div>
          <button type="button" class="chat-send-btn" aria-label="Gửi" @click="sendDraft">
            <AppIcon name="send" :size="18" />
          </button>
        </div>
        <div class="chat-input-hint">
          <span>
            <AppIcon name="shield" :size="12" class="chat-input-hint-gold" />
            Hỗ trợ 24/7 · Phản hồi &lt; 1 phút
          </span>
          <span>Enter để gửi · Shift+Enter xuống dòng</span>
        </div>
      </footer>
    </div>
  </div>
  <AuthModal
    :open="authModalOpen"
    initial-view="login"
    @close="closeAuthModal"
    @authenticated="handleAuthenticated"
  />
</template>
