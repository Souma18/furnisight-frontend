<script setup>
import { computed } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import AuthModal from '@features/auth/components/AuthModal.vue'
import { useChat } from '../composables/useChat'
import { useDraggableWidget } from '../composables/useDraggableWidget'
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
  fileInputRef,
  imageInputRef,
  selectedAttachments,
  uploadingAttachment,
  DOCUMENT_FILE_ACCEPT,
  showFabTooltip,
  authModalOpen,
  showScrollBottom,
  todayLabel,
  formatTimeLabel,
  toggleChat,
  sendDraft,
  chooseFile,
  chooseImage,
  handleAttachmentSelected,
  removeAttachment,
  quickSend,
  handleInputKeydown,
  resizeTextarea,
  handleMessagesScroll,
  scrollToBottomNow,
  handleAuthenticated,
  closeAuthModal,
  closeChat,
  loading,
  error,
  connectionStatus,
  search,
  searchCountLabel,
  isSearchHit,
  isActiveSearchHit,
  toggleSearch,
  setSearchQuery,
  closeSearch,
  nextSearchResult,
  prevSearchResult,
} = useChat()

const {
  dragging,
  widgetStyle,
  handleDragStart,
  handleDragMove,
  handleDragEnd,
  shouldSuppressClick
} = useDraggableWidget()

function handleFabClick() {
  if (shouldSuppressClick()) {
    return
  }
  toggleChat()
}

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
          <button
            type="button"
            class="chat-hdr-btn"
            :class="{ active: search.visible }"
            title="Tìm kiếm"
            aria-label="Tìm kiếm"
            @click="toggleSearch"
          >
            <AppIcon name="search" :size="15" />
          </button>
          <button type="button" class="chat-hdr-btn" title="Thu nhỏ" aria-label="Thu nhỏ" @click="closeChat">
            <AppIcon name="minus" :size="15" />
          </button>
        </div>
      </header>

      <div v-if="search.visible" class="chat-search-panel">
        <label class="chat-search-field">
          <AppIcon name="search" :size="15" />
          <input
            :value="search.query"
            type="search"
            placeholder="Tìm tin nhắn..."
            @input="(event) => setSearchQuery(event.target.value)"
            @keydown.enter.prevent="nextSearchResult"
          />
        </label>
        <div v-if="search.query.trim()" class="chat-search-actions">
          <small v-if="search.error">{{ search.error }}</small>
          <span v-else>{{ searchCountLabel }}</span>
          <button type="button" :disabled="!search.resultIds.length" title="Kết quả trước" @click="prevSearchResult">
            <AppIcon name="chevronUp" :size="14" />
          </button>
          <button type="button" :disabled="!search.resultIds.length" title="Kết quả tiếp" @click="nextSearchResult">
            <AppIcon name="chevronDown" :size="14" />
          </button>
          <button type="button" title="Đóng tìm kiếm" @click="closeSearch">
            <AppIcon name="x" :size="14" />
          </button>
        </div>
      </div>

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

      <div ref="messagesRef" class="chat-messages" @scroll="handleMessagesScroll">
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
          :search-hit="isSearchHit(message.id)"
          :search-active="isActiveSearchHit(message.id)"
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

      <button
        v-if="showScrollBottom"
        type="button"
        class="chat-scroll-bottom"
        title="Xuống tin mới nhất"
        aria-label="Xuống tin mới nhất"
        @click="scrollToBottomNow"
      >
        <AppIcon name="chevronDown" :size="18" />
      </button>

      <footer class="chat-input-bar">
        <div v-if="selectedAttachments.length" class="chat-attachment-preview-list">
          <div
            v-for="attachment in selectedAttachments"
            :key="attachment.id"
            class="chat-attachment-preview"
            :class="{ uploading: uploadingAttachment }"
          >
            <img v-if="attachment.isImage" :src="attachment.previewUrl" alt="" />
            <AppIcon v-else name="paperclip" :size="15" />
            <span>{{ attachment.name }}</span>
            <button
              type="button"
              title="Bỏ đính kèm"
              aria-label="Bỏ đính kèm"
              :disabled="uploadingAttachment"
              @click="removeAttachment(attachment.id)"
            >
              <AppIcon name="x" :size="13" />
            </button>
          </div>
        </div>
        <div class="chat-input-row">
          <input
            ref="fileInputRef"
            type="file"
            class="chat-file-input"
            :accept="DOCUMENT_FILE_ACCEPT"
            multiple
            @change="(event) => handleAttachmentSelected(event, 'file')"
          />
          <input
            ref="imageInputRef"
            type="file"
            class="chat-file-input"
            accept="image/*"
            multiple
            @change="(event) => handleAttachmentSelected(event, 'image')"
          />
          <div class="chat-input-wrap">
            <textarea
              ref="inputRef"
              v-model="draft"
              rows="1"
              placeholder="Nhập tin nhắn..."
              @keydown="handleInputKeydown"
              @input="resizeTextarea"
              :disabled="uploadingAttachment"
            />
            <button type="button" class="chat-input-attach" title="Đính kèm file" aria-label="Đính kèm file" :disabled="uploadingAttachment" @click="chooseFile">
              <AppIcon name="paperclip" :size="17" />
            </button>
            <button type="button" class="chat-input-attach" title="Gửi ảnh" aria-label="Gửi ảnh" :disabled="uploadingAttachment" @click="chooseImage">
              <AppIcon name="image" :size="17" />
            </button>
          </div>
          <button type="button" class="chat-send-btn" aria-label="Gửi" :disabled="uploadingAttachment" @click="sendDraft">
            <span v-if="uploadingAttachment" class="chat-send-spinner" aria-hidden="true"></span>
            <AppIcon v-else name="send" :size="18" />
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
