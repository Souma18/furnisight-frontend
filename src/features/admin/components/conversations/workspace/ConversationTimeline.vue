<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { ref, onMounted, nextTick } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { downloadChatAttachment } from '@features/chat/lib/chatAttachmentDownload'

const props = defineProps({
  loading: { type: Boolean, default: false },
  items: { type: Array, required: true },
  conversation: { type: Object, required: true },
  currentAdminName: { type: String, required: true },
  searchResultIds: { type: Array, default: () => [] },
  activeSearchId: { type: String, default: null },
  showScrollBottom: { type: Boolean, default: false },
})

const emit = defineEmits(['scroll', 'scroll-to-bottom'])

const timelineRef = ref(null)

function isSearchHit(id) {
  return props.searchResultIds.includes(id)
}

function isActiveSearchHit(id) {
  return props.activeSearchId === id
}

function handleScroll() {
  emit('scroll', timelineRef.value)
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

defineExpose({
  getScrollContainer: () => timelineRef.value
})
</script>

<template>
  <div class="cw-timeline" ref="timelineRef" @scroll="handleScroll">
    <div v-if="loading" class="tl-date-sep">Đang tải tin nhắn...</div>
    <div v-else class="tl-date-sep">Hôm nay</div>

    <template v-for="msg in items" :key="msg.id">
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
            :class="conversation.avClass"
            :style="{ background: conversation.avColor, color: conversation.textColor }"
          >
            <AppImage v-if="conversation.avatarUrl" :src="conversation.avatarUrl" :alt="conversation.name"  />
            <span v-else>{{ conversation.av }}</span>
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
                  <AppImage v-if="attachment.isImage" :src="attachment.url" :alt="attachment.name"  />
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
                  <AppImage v-if="attachment.isImage" :src="attachment.url" :alt="attachment.name"  />
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
              <AppIcon name="lock" /> Ghi chú nội bộ - {{ msg.senderName || currentAdminName }}
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
                <AppImage v-if="attachment.isImage" :src="attachment.url" :alt="attachment.name"  />
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

  <AppButton
    v-if="showScrollBottom"
    type="button"
    class="cw-scroll-bottom"
    title="Xuống tin mới nhất"
    aria-label="Xuống tin mới nhất"
    @click="emit('scroll-to-bottom')"
  >
    <AppIcon name="chevronDown" :size="18" />
  </AppButton>
</template>
