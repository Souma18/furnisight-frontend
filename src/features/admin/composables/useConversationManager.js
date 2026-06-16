import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import { useAdminUiStore } from '../store/adminUiStore'
import { useAdminLayout } from './useAdminLayout'
import { PRODUCTS_DATA, TEMPLATE_CATEGORIES } from '../config/adminConversationContent'
import {
  getAdminInbox,
  getMessages,
  postMessage,
  postInternalNote,
  patchStatus,
  closeConversation,
} from '@features/chat/api/messageServiceApi'
import { createMessageServiceSocket } from '@features/chat/api/messageServiceSocket'
import { getStaffId } from '@features/chat/lib/chatUserIds'
import {
  mapConversationToAdminList,
  mapMessageToAdminTimeline,
  mapStatusToApi,
  normalizeConversationList,
  normalizeMessagePage,
} from '@features/chat/lib/chatMappers'

const INBOX_CHANNEL = 'SUPPORT'

export function useConversationManager() {
  const uiStore = useAdminUiStore()
  const { currentAdmin } = useAdminLayout()

  const currentConvId = ref(null)
  const detailPanelVisible = ref(true)
  const currentMsgType = ref('reply')
  const searchQuery = ref('')
  const activeFilter = ref('all')
  const activeTab = ref('all')

  const cannedPickerOpen = ref(false)
  const selectedProdId = ref(null)
  const pendingInsertText = ref('')

  const conversations = ref([])
  const inboxLoading = ref(false)
  const timelineMessages = ref([])
  const messagesLoading = ref(false)
  const socketConnected = ref(false)

  const templates = ref([])
  const templatesLoading = ref(false)
  const products = ref([...PRODUCTS_DATA])

  let socketClient = null
  let subscribedConvId = null

  const currentConv = computed(
    () => conversations.value.find((c) => c.id === currentConvId.value) || null,
  )

  const filteredConversations = computed(() => {
    let filtered = conversations.value
    if (activeTab.value === 'new') {
      const today = new Date().toDateString()
      filtered = filtered.filter((c) => c.createdAt && new Date(c.createdAt).toDateString() === today)
    } else if (activeTab.value === 'pending') {
      filtered = filtered.filter((c) => c.statusKey === 'pending')
    } else if (activeTab.value === 'resolved') {
      filtered = filtered.filter((c) => ['resolved', 'closed'].includes(c.statusKey))
    }

    if (activeFilter.value === 'urgent') {
      filtered = filtered.filter((c) => c.priority === 'urgent')
    } else if (activeFilter.value === 'ai') {
      filtered = filtered.filter((c) => c.isAi)
    } else if (activeFilter.value === 'unread') {
      filtered = filtered.filter((c) => c.unread)
    } else if (activeFilter.value === 'waiting') {
      filtered = filtered.filter((c) => c.statusKey === 'waiting')
    }

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (c) => c.name.toLowerCase().includes(q) || (c.email && c.email.toLowerCase().includes(q)),
      )
    }

    return filtered
  })

  function buildInboxParams() {
    const params = { channel: INBOX_CHANNEL }
    if (activeFilter.value === 'unread') params.unreadOnly = true
    if (activeFilter.value === 'urgent') params.priority = 'URGENT'
    if (activeFilter.value === 'waiting') params.status = 'WAITING_CUSTOMER'
    return params
  }

  async function loadInbox() {
    inboxLoading.value = true
    try {
      const data = await getAdminInbox(buildInboxParams())
      conversations.value = normalizeConversationList(data).map(mapConversationToAdminList)

      if (conversations.value.length && !currentConvId.value) {
        currentConvId.value = conversations.value[0].id
        await loadMessages(currentConvId.value)
      } else if (currentConvId.value && !conversations.value.some((c) => c.id === currentConvId.value)) {
        currentConvId.value = conversations.value[0]?.id ?? null
        if (currentConvId.value) await loadMessages(currentConvId.value)
        else timelineMessages.value = []
      }
    } catch (error) {
      uiStore.showToast({
        icon: 'alert',
        title: 'Không tải được inbox',
        subtitle: error.message || '',
      })
    } finally {
      inboxLoading.value = false
    }
  }

  function subscribeAdminTopics(id) {
    if (!socketClient?.isConnected?.() || !id) return

    if (subscribedConvId && subscribedConvId !== id) {
      socketClient.unsubscribe(`/topic/conversation/${subscribedConvId}`)
      socketClient.unsubscribe(`/topic/conversation/${subscribedConvId}/internal`)
    }

    subscribedConvId = id
    const conv = conversations.value.find((c) => c.id === id)

    socketClient.subscribeConversation(id, (payload) => {
      if (!payload || payload.isInternal) return
      const mapped = mapMessageToAdminTimeline(payload, {
        buyerId: conv?.buyerId,
        staffId: getStaffId(),
        staffName: currentAdmin.value.name,
      })
      if (!timelineMessages.value.some((m) => m.id === mapped.id)) {
        timelineMessages.value.push(mapped)
      }
    })

    socketClient.subscribeInternal(id, (payload) => {
      if (!payload) return
      const mapped = mapMessageToAdminTimeline(
        { ...payload, isInternal: true },
        {
          buyerId: conv?.buyerId,
          staffId: getStaffId(),
          staffName: currentAdmin.value.name,
        },
      )
      if (!timelineMessages.value.some((m) => m.id === mapped.id)) {
        timelineMessages.value.push(mapped)
      }
    })
  }

  function connectSocketForConversation(id) {
    if (!id) return

    socketClient?.disconnect()
    socketConnected.value = false

    socketClient = createMessageServiceSocket({
      onConnect: () => {
        socketConnected.value = true
        subscribeAdminTopics(id)
      },
      onDisconnect: () => {
        socketConnected.value = false
      },
      onError: () => {
        socketConnected.value = false
      },
    })

    socketClient.connect()
  }

  async function loadMessages(id = currentConvId.value) {
    if (!id) {
      timelineMessages.value = []
      return
    }

    messagesLoading.value = true
    try {
      const page = await getMessages({ conversationId: id, includeInternal: true, size: 50 })
      const items = normalizeMessagePage(page)
      const conv = conversations.value.find((c) => c.id === id)

      const sorted = [...items].sort(
        (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      )
      timelineMessages.value = sorted.map((m) =>
        mapMessageToAdminTimeline(m, {
          buyerId: conv?.buyerId,
          staffId: getStaffId(),
          staffName: currentAdmin.value.name,
        }),
      )

      connectSocketForConversation(id)
    } catch (error) {
      uiStore.showToast({
        icon: 'alert',
        title: 'Không tải được tin nhắn',
        subtitle: error.message || '',
      })
    } finally {
      messagesLoading.value = false
    }
  }

  async function loadTemplates() {
    templatesLoading.value = true
    try {
      const res = await adminApi.fetchMessageTemplates()
      templates.value = res.data?.items ?? res.data?.content ?? res.data ?? []
    } finally {
      templatesLoading.value = false
    }
  }

  async function loadConversation(id) {
    currentConvId.value = id
    const conv = conversations.value.find((c) => c.id === id)
    if (conv) {
      conv.unread = false
    }
    await loadMessages(id)
  }

  function setMsgType(type) {
    currentMsgType.value = type
  }

  function toggleDetailPanel() {
    detailPanelVisible.value = !detailPanelVisible.value
  }

  async function updateStatus(statusKey) {
    if (!currentConvId.value) return

    try {
      await patchStatus(currentConvId.value, mapStatusToApi(statusKey))
      const conv = conversations.value.find((c) => c.id === currentConvId.value)
      if (conv) {
        conv.statusKey = statusKey
      }
      uiStore.showToast({ icon: 'info', title: 'Cập nhật trạng thái', subtitle: '→ ' + statusKey })
    } catch (error) {
      uiStore.showToast({
        icon: 'alert',
        title: 'Cập nhật trạng thái thất bại',
        subtitle: error.message || '',
      })
    }
  }

  async function resolveConversation() {
    if (!currentConvId.value) return

    try {
      await patchStatus(currentConvId.value, 'RESOLVED')
      await closeConversation(currentConvId.value)
      const conv = conversations.value.find((c) => c.id === currentConvId.value)
      if (conv) {
        conv.statusKey = 'resolved'
      }
      uiStore.showToast({ icon: 'check', title: 'Hội thoại đã giải quyết', subtitle: 'Đã lưu và đóng hội thoại này.' })
    } catch (error) {
      uiStore.showToast({
        icon: 'alert',
        title: 'Không thể đóng hội thoại',
        subtitle: error.message || '',
      })
    }
  }

  async function sendMessage(text, type) {
    const trimmed = String(text ?? '').trim()
    if (!trimmed || !currentConvId.value) return

    const conv = currentConv.value
    const staffId = getStaffId()

    if (type === 'note') {
      try {
        const note = await postInternalNote(currentConvId.value, {
          senderId: staffId,
          content: trimmed,
          messageType: 'TEXT',
        })
        timelineMessages.value.push(
          mapMessageToAdminTimeline(
            { ...note, isInternal: true },
            { buyerId: conv?.buyerId, staffId, staffName: currentAdmin.value.name },
          ),
        )
        uiStore.showToast({
          icon: 'lock',
          title: 'Ghi chú đã lưu',
          subtitle: currentAdmin.value.name,
        })
      } catch (error) {
        uiStore.showToast({
          icon: 'alert',
          title: 'Lưu ghi chú thất bại',
          subtitle: error.message || '',
        })
      }
      return
    }

    const dto = {
      conversationId: currentConvId.value,
      senderId: staffId,
      receiverId: conv?.buyerId ?? null,
      content: trimmed,
      messageType: 'TEXT',
      isInternal: false,
    }

    if (!socketClient?.sendChatMessage(dto)) {
      connectSocketForConversation(currentConvId.value)
      try {
        const saved = await postMessage(dto)
        const mapped = mapMessageToAdminTimeline(saved, {
          buyerId: conv?.buyerId,
          staffId,
          staffName: currentAdmin.value.name,
        })
        if (!timelineMessages.value.some((m) => m.id === mapped.id)) {
          timelineMessages.value.push(mapped)
        }
      } catch (error) {
        uiStore.showToast({
          icon: 'alert',
          title: 'Gửi tin nhắn thất bại',
          subtitle: error.message || '',
        })
      }
    }
  }

  function insertSuggestion(text, msgRef) {
    if (msgRef) {
      msgRef.value = text
    } else if (text) {
      pendingInsertText.value = text
    }
    uiStore.showToast({ icon: 'sparkles', title: 'Gợi ý đã được điền', subtitle: 'Chỉnh sửa nếu cần trước khi gửi.' })
  }

  async function saveTemplate(tpl) {
    try {
      if (tpl.id) {
        const res = await adminApi.updateMessageTemplate(tpl.id, tpl)
        const idx = templates.value.findIndex((t) => t.id === res.data.id)
        if (idx !== -1) templates.value[idx] = res.data
      } else {
        const res = await adminApi.createMessageTemplate(tpl)
        templates.value = [res.data, ...templates.value]
      }
      uiStore.showToast({ icon: 'check', title: 'Template đã lưu', subtitle: 'Sẵn sàng sử dụng trong các hội thoại.' })
      return true
    } catch (error) {
      uiStore.showToast({
        icon: 'alert',
        title: 'Lưu template thất bại',
        subtitle: error.response?.data?.message || error.message || '',
      })
      return false
    }
  }

  async function deleteTemplate(id) {
    try {
      await adminApi.deleteMessageTemplate(id)
      templates.value = templates.value.filter((t) => t.id !== id)
      uiStore.showToast({ icon: 'trash', title: 'Đã xóa template', subtitle: '' })
    } catch (error) {
      uiStore.showToast({
        icon: 'alert',
        title: 'Xóa template thất bại',
        subtitle: error.response?.data?.message || error.message || '',
      })
    }
  }

  function selectProduct(id) {
    selectedProdId.value = id
  }

  function sendProductToChat(product) {
    uiStore.showToast({ icon: 'armchair', title: 'Đã gửi sản phẩm', subtitle: product.name })
    selectedProdId.value = null
  }

  function disconnectSocket() {
    socketClient?.disconnect()
    socketClient = null
    subscribedConvId = null
    socketConnected.value = false
  }

  watch([activeFilter], () => {
    loadInbox()
  })

  onMounted(() => {
    loadTemplates()
    loadInbox()
  })

  onBeforeUnmount(() => {
    disconnectSocket()
  })

  return {
    currentAdmin,
    currentConvId,
    detailPanelVisible,
    currentMsgType,
    searchQuery,
    activeFilter,
    activeTab,
    cannedPickerOpen,
    selectedProdId,
    pendingInsertText,
    conversations,
    filteredConversations,
    currentConv,
    inboxLoading,
    timelineMessages,
    messagesLoading,
    socketConnected,
    templates,
    templatesLoading,
    templateCategories: TEMPLATE_CATEGORIES,
    products,
    loadInbox,
    loadTemplates,
    loadConversation,
    loadMessages,
    setMsgType,
    toggleDetailPanel,
    updateStatus,
    resolveConversation,
    sendMessage,
    insertSuggestion,
    saveTemplate,
    deleteTemplate,
    selectProduct,
    sendProductToChat,
    disconnectSocket,
  }
}
