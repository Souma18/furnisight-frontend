import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '@features/auth/store/authStore'
import {
  DOCUMENT_FILE_ACCEPT,
  chatAttachmentFormatError,
  chatAttachmentSizeError,
  isAllowedChatDocument,
  isAllowedChatAttachmentSize,
  isAllowedChatImage,
} from '../lib/chatAttachmentRules'

export function useChat() {
  const chatStore = useChatStore()
  const authStore = useAuthStore()
  const isOpen = computed(() => chatStore.session.isOpen)
  const isTyping = computed(() => chatStore.workspace.isTyping)
  const unreadCount = computed(() => chatStore.socket.unreadCount)
  const messages = computed(() => chatStore.workspace.messages)
  const draft = computed({
    get: () => chatStore.workspace.draft,
    set: (val) => { chatStore.workspace.draft = val },
  })
  const hasUnread = computed(() => chatStore.hasUnread)
  const loading = computed(() => chatStore.session.loading)
  const error = computed(() => chatStore.session.error)
  const connectionStatus = computed(() => chatStore.socket.connectionStatus)
  const search = computed(() => chatStore.workspace.search)
  const activeSearchMessageId = computed(() => {
    const state = chatStore.workspace.search
    return state.resultIds[state.activeIndex] || null
  })
  const searchCountLabel = computed(() => {
    const state = chatStore.workspace.search
    const query = String(state.query || '').trim()
    const total = state.total || state.resultIds.length
    if (!query) return ''
    if (state.loading) return '...'
    if (!total) return '0/0'
    return `${state.activeIndex + 1}/${total}`
  })

  // Static config — không phải ref nên không dùng storeToRefs
  const agent = chatStore.agent
  const quickChips = chatStore.quickChips

  const messagesRef = ref(null)
  const inputRef = ref(null)
  const fileInputRef = ref(null)
  const imageInputRef = ref(null)
  const selectedAttachments = ref([])
  const uploadingAttachment = ref(false)
  const showFabTooltip = ref(false)
  const authModalOpen = ref(false)
  const showScrollBottom = ref(false)

  let tooltipTimer = null

  function updateScrollBottomVisibility() {
    const el = messagesRef.value
    if (!el) {
      showScrollBottom.value = false
      return
    }
    showScrollBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight > 96
  }

  function scrollToBottom() {
    if (activeSearchMessageId.value) return
    nextTick(() => {
      const el = messagesRef.value
      if (!el) return
      el.scrollTop = el.scrollHeight
      updateScrollBottomVisibility()
    })
  }

  function scrollToBottomNow() {
    nextTick(() => {
      const el = messagesRef.value
      if (!el) return
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      window.setTimeout(updateScrollBottomVisibility, 260)
    })
  }

  function scrollToSearchResult() {
    const activeId = activeSearchMessageId.value
    if (!activeId) return
    nextTick(() => {
      const node = messagesRef.value?.querySelector(`[data-message-id="${activeId}"]`)
      node?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      window.setTimeout(updateScrollBottomVisibility, 260)
    })
  }

  function isSearchHit(messageId) {
    return chatStore.workspace.search.resultIds.includes(messageId)
  }

  function isActiveSearchHit(messageId) {
    return activeSearchMessageId.value === messageId
  }

  function showLogin() {
    chatStore.resetSession()
    authModalOpen.value = true
  }

  function createAttachment(file, isImage) {
    return {
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      isImage,
      previewUrl: isImage ? URL.createObjectURL(file) : '',
    }
  }

  function setAttachmentError(kind) {
    chatStore.setError(chatAttachmentFormatError(kind))
  }

  function clearAttachments() {
    selectedAttachments.value.forEach((attachment) => {
      if (attachment.previewUrl) URL.revokeObjectURL(attachment.previewUrl)
    })
    selectedAttachments.value = []
  }

  function removeAttachment(id) {
    const removed = selectedAttachments.value.find((attachment) => attachment.id === id)
    if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl)
    selectedAttachments.value = selectedAttachments.value.filter((attachment) => attachment.id !== id)
  }

  function chooseFile() {
    if (!authStore.isAuthenticated) {
      showLogin()
      return
    }
    fileInputRef.value?.click()
  }

  function chooseImage() {
    if (!authStore.isAuthenticated) {
      showLogin()
      return
    }
    imageInputRef.value?.click()
  }

  function handleAttachmentSelected(event, kind) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return

    if (files.some((file) => !isAllowedChatAttachmentSize(file))) {
      chatStore.setError(chatAttachmentSizeError())
      return
    }

    if (kind === 'image') {
      const accepted = files.filter(isAllowedChatImage)
      if (!accepted.length) {
        setAttachmentError('image')
        return
      }
      selectedAttachments.value = [
        ...selectedAttachments.value,
        ...accepted.map((file) => createAttachment(file, true)),
      ]
      return
    }

    const accepted = files.filter(isAllowedChatDocument)
    if (!accepted.length) {
      setAttachmentError('file')
      return
    }
    selectedAttachments.value = [
      ...selectedAttachments.value,
      ...accepted.map((file) => createAttachment(file, false)),
    ]
  }

  async function handleAuthenticated() {
    authModalOpen.value = false
    await chatStore.hydrateSession(true)
    chatStore.open()
    nextTick(() => {
      inputRef.value?.focus()
      scrollToBottom()
    })
  }

  function toggleChat() {
    if (!authStore.isAuthenticated) {
      showLogin()
      return
    }

    chatStore.toggleOpen()
    if (isOpen.value) {
      nextTick(() => {
        inputRef.value?.focus()
        scrollToBottom()
      })
    }
  }

  function sendDraft() {
    if (!authStore.isAuthenticated) {
      showLogin()
      return
    }
    if (!draft.value.trim() && !selectedAttachments.value.length) return
    const attachments = selectedAttachments.value
    uploadingAttachment.value = true
    chatStore.sendMessage(draft.value, attachments)
      .then((sent) => {
        if (sent) clearAttachments()
      })
      .finally(() => {
        uploadingAttachment.value = false
      })
    scrollToBottom()
  }

  function quickSend(text) {
    draft.value = text
    sendDraft()
  }

  function handleInputKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendDraft()
    }
  }

  function resizeTextarea(event) {
    const el = event.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 80)}px`
  }

  function handleMessagesScroll() {
    updateScrollBottomVisibility()
  }

  const todayLabel = computed(() => 'Hôm nay')

  watch(() => messages.value.length, () => scrollToBottom())
  watch(isTyping, () => scrollToBottom())
  watch(activeSearchMessageId, () => scrollToSearchResult())
  watch(
    () => [
      chatStore.workspace.search.query,
      chatStore.workspace.search.activeIndex,
      chatStore.workspace.search.resultIds.join('|'),
    ],
    () => scrollToSearchResult(),
  )
  watch(
    () => [
      authStore.isAuthenticated,
      authStore.user?.id ?? null,
      authStore.user?.accountId ?? null,
      authStore.user?.email ?? null,
    ],
    async () => {
      if (authStore.isAuthenticated) {
        authModalOpen.value = false
        await chatStore.hydrateSession(true)
      } else {
        chatStore.resetSession()
      }
    },
  )

  onMounted(async () => {
    if (authStore.isAuthenticated) {
      await chatStore.hydrateSession()
    }
    scrollToBottom()

    tooltipTimer = setTimeout(() => {
      showFabTooltip.value = true
      tooltipTimer = setTimeout(() => {
        showFabTooltip.value = false
      }, 4000)
    }, 2000)
  })

  onBeforeUnmount(() => {
    clearTimeout(tooltipTimer)
    clearAttachments()
    chatStore.disconnectSocket()
  })

  return {
    isOpen,
    isTyping,
    unreadCount,
    messages,
    draft,
    agent,
    quickChips,
    hasUnread,
    loading,
    error,
    connectionStatus,
    search,
    activeSearchMessageId,
    searchCountLabel,
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
    formatTimeLabel: chatStore.formatTimeLabel,
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
    isSearchHit,
    isActiveSearchHit,
    toggleSearch: chatStore.toggleSearch,
    setSearchQuery: chatStore.setSearchQuery,
    closeSearch: chatStore.closeSearch,
    nextSearchResult: chatStore.nextSearchResult,
    prevSearchResult: chatStore.prevSearchResult,
    handleAuthenticated,
    closeAuthModal: () => {
      authModalOpen.value = false
    },
    closeChat: chatStore.close,
  }
}
