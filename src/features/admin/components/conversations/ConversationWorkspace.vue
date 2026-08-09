<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useAdminConversationStore } from '../../store/adminConversationStore'
import { useAdminUiStore } from '../../store/adminUiStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { uploadChatAttachment } from '../../lib/chatAttachmentUpload'
import { formatChatError } from '@features/chat/lib/chatErrorMessages'

import ConversationHeader from './workspace/ConversationHeader.vue'
import ConversationTimeline from './workspace/ConversationTimeline.vue'
import ConversationInput from './workspace/ConversationInput.vue'

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
const timelineCmp = ref(null) // ref to ConversationTimeline component
const selectedAttachments = ref([])
const uploadingAttachment = ref(false)
const showScrollBottom = ref(false)

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

function updateScrollBottomVisibility(scrollContainer) {
  if (!scrollContainer) {
    showScrollBottom.value = false
    return
  }
  showScrollBottom.value = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight > 120
}

function scrollToBottom() {
  if (activeSearchMessageId.value) return
  nextTick(() => {
    const el = timelineCmp.value?.getScrollContainer()
    if (el) {
      el.scrollTop = el.scrollHeight
      updateScrollBottomVisibility(el)
    }
  })
}

function scrollToBottomNow() {
  nextTick(() => {
    const el = timelineCmp.value?.getScrollContainer()
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    window.setTimeout(() => updateScrollBottomVisibility(el), 280)
  })
}

function scrollToSearchResult() {
  const activeId = activeSearchMessageId.value
  if (!activeId) return

  nextTick(() => {
    const el = timelineCmp.value?.getScrollContainer()
    const node = el?.querySelector(`[data-message-id="${activeId}"]`)
    node?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    window.setTimeout(() => updateScrollBottomVisibility(el), 280)
  })
}

function handleTimelineScroll(scrollContainer) {
  updateScrollBottomVisibility(scrollContainer)
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
    <ConversationHeader
      v-if="store.currentConv"
      :conversation="store.currentConv"
      :socket-connected="store.socket.connected"
      :detail-visible="store.workspace.detailVisible"
      @update-status="(val) => store.updateStatus(val)"
      @toggle-detail="store.toggleDetailPanel()"
      @resolve="store.resolveConversation()"
    />

    <div v-else-if="store.inbox.loading" class="cw-empty-state">Đang tải hội thoại...</div>
    <div v-else class="cw-empty-state">Chưa có hội thoại nào</div>

    <!-- Timeline -->
    <ConversationTimeline
      v-if="store.currentConv"
      ref="timelineCmp"
      :loading="store.workspace.loading"
      :items="timelineItems"
      :conversation="store.currentConv"
      :current-admin-name="currentAdmin.name"
      :search-result-ids="searchState.resultIds"
      :active-search-id="activeSearchMessageId"
      :show-scroll-bottom="showScrollBottom"
      @scroll="handleTimelineScroll"
      @scroll-to-bottom="scrollToBottomNow"
    />

    <!-- Input Area -->
    <ConversationInput
      v-if="store.currentConv"
      v-model="messageText"
      v-model:attachments="selectedAttachments"
      :msg-type="store.workspace.msgType"
      :uploading="uploadingAttachment"
      :current-admin-name="currentAdmin.name"
      @update:msg-type="(val) => store.setMsgType(val)"
      @send="sendMsg"
      @open-products="emit('open-products')"
      @open-templates="emit('open-templates')"
    />
  </div>
</template>
