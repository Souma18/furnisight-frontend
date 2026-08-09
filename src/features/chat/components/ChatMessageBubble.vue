<script setup>
import AppImage from '@shared/ui/AppImage.vue'
import { computed } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import ChatProductCard from './ChatProductCard.vue'
import { downloadChatAttachment } from '../lib/chatAttachmentDownload'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  timeLabel: {
    type: String,
    default: '',
  },
  searchHit: {
    type: Boolean,
    default: false,
  },
  searchActive: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['add-to-cart'])

const isUser = computed(() => props.message.role === 'user')

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
</script>

<template>
  <div
    class="chat-msg"
    :class="{ user: isUser, 'chat-msg--search-hit': searchHit, 'chat-msg--search-active': searchActive }"
    :data-message-id="message.id"
  >
    <div class="msg-avatar" :class="{ bot: !isUser, user: isUser }">
      <AppIcon v-if="!isUser" name="headset" :size="14" />
      <span v-else>NA</span>
    </div>

    <div class="chat-msg-body">
      <div class="bubble" :class="isUser ? 'user' : 'bot'">
        <template v-if="isUser">
          <div v-if="message.content">{{ message.content }}</div>
        </template>
        <div v-else-if="message.content" v-html="message.content" />
        <div v-if="message.attachments?.length" class="chat-bubble-attachments">
          <a
            v-for="attachment in message.attachments"
            :key="attachment.mediaId || attachment.url || attachment.name"
            :href="attachment.url || '#'"
            target="_blank"
            rel="noreferrer"
            :download="!attachment.isImage ? attachment.name : undefined"
            :class="attachment.isImage ? 'chat-bubble-image' : 'chat-bubble-file'"
            @click="handleAttachmentClick($event, attachment)"
          >
            <AppImage v-if="attachment.isImage" :src="attachment.url" :alt="attachment.name"  />
            <template v-else>
              <AppIcon name="paperclip" :size="15" />
              <span>{{ attachment.name }}</span>
              <small>{{ formatBytes(attachment.size) }}</small>
            </template>
          </a>
        </div>
        <span class="bubble-time">{{ timeLabel }}</span>
      </div>

      <div v-if="message.products?.length" class="chat-product-row">
        <ChatProductCard
          v-for="product in message.products"
          :key="product.id"
          :product="product"
          @add-to-cart="emit('add-to-cart', $event)"
        />
      </div>
    </div>
  </div>
</template>
