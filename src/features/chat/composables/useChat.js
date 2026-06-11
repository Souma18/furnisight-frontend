import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '@features/auth/store/authStore'

export function useChat() {
  const chatStore = useChatStore()
  const authStore = useAuthStore()
  const { isOpen, isTyping, unreadCount, messages, draft, hasUnread, loading, error, connectionStatus } =
    storeToRefs(chatStore)

  // Static config — không phải ref nên không dùng storeToRefs
  const agent = chatStore.agent
  const quickChips = chatStore.quickChips

  const messagesRef = ref(null)
  const inputRef = ref(null)
  const showFabTooltip = ref(false)

  let tooltipTimer = null

  function scrollToBottom() {
    nextTick(() => {
      const el = messagesRef.value
      if (!el) return
      el.scrollTop = el.scrollHeight
    })
  }

  function toggleChat() {
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
      chatStore.error = 'Vui lòng đăng nhập để sử dụng chat hỗ trợ.'
      chatStore.open()
      return
    }
    chatStore.sendMessage(draft.value)
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

  const todayLabel = computed(() => 'Hôm nay')

  watch(messages, () => scrollToBottom(), { deep: true })
  watch(isTyping, () => scrollToBottom())
  watch(
    () => [authStore.isAuthenticated, authStore.user?.id ?? null],
    async () => {
      if (authStore.isAuthenticated) {
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
    messagesRef,
    inputRef,
    showFabTooltip,
    todayLabel,
    formatTimeLabel: chatStore.formatTimeLabel,
    toggleChat,
    sendDraft,
    quickSend,
    handleInputKeydown,
    resizeTextarea,
    closeChat: chatStore.close,
  }
}
