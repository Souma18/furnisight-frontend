<script setup>
import AppImage from '@shared/ui/AppImage.vue'
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAdminConversationStore } from '../../store/adminConversationStore'
import { downloadChatAttachment } from '@features/chat/lib/chatAttachmentDownload'

const store = useAdminConversationStore()
const messages = computed(() => store.workspace.messages)
const currentAdmin = computed(() => store.currentAdmin)
const closedLine = computed(() => formatClosedLine(store.currentConv?.closedAt))
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

const timelineRef = ref(null)

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

function scrollToBottom() {
  if (activeSearchMessageId.value) return
  nextTick(() => {
    if (timelineRef.value) {
      timelineRef.value.scrollTop = timelineRef.value.scrollHeight
    }
  })
}

function scrollToSearchResult() {
  const activeId = activeSearchMessageId.value
  if (!activeId) return

  nextTick(() => {
    const node = timelineRef.value?.querySelector(`[data-message-id="${activeId}"]`)
    node?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  })
}

function isSearchHit(id) {
  return searchState.value.resultIds.includes(id)
}

function isActiveSearchHit(id) {
  return activeSearchMessageId.value === id
}

watch(() => store.workspace.convId, () => {
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

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div v-if="store.currentConv" class="cw-timeline" ref="timelineRef">
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
          <AppImage v-if="store.currentConv.avatarUrl" :src="store.currentConv.avatarUrl" :alt="store.currentConv.name"  />
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
</template>
