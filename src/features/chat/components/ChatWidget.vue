<script setup>
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

function handleAddToCart(product) {
  // TODO(BE/cart): gắn cartStore.addItem khi có API sản phẩm chat
  console.info('[chat] add to cart', product)
}
</script>

<template>
  <div class="chat-widget">
    <div class="chat-fab-tooltip" :class="{ show: showFabTooltip && !isOpen }">
      💬 LUXNEST Support đang trực tuyến!
    </div>

    <button
      type="button"
      class="chat-fab"
      :class="{ open: isOpen }"
      aria-label="Mở chat hỗ trợ"
      @click="toggleChat"
    >
      <span class="chat-fab-icon chat-fab-icon--bot">
        <AppIcon name="bot" :size="24" />
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
      aria-label="Chat hỗ trợ LUXNEST"
    >
      <header class="chat-header">
        <div class="chat-agent-avatar">
          <AppIcon name="bot" :size="20" />
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
            <AppIcon name="bot" :size="14" />
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
