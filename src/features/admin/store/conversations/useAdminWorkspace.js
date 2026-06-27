import { reactive, computed } from 'vue'
import {
  getMessages,
  searchMessages,
  postMessage,
  postInternalNote,
  patchStatus,
  patchPriority,
} from '@features/chat/api/messageServiceApi'
import { getStaffId } from '@features/chat/lib/chatUserIds'
import {
  mapMessageToAdminTimeline,
  normalizeMessagePage,
  mapStatusToApi,
  mapPriorityToApi,
} from '@features/chat/lib/chatMappers'
import { formatChatError } from '@features/chat/lib/chatErrorMessages'

export function useAdminWorkspace(ctx) {
  const workspace = reactive({
    convId: null,
    messages: [],
    loading: false,
    detailVisible: true,
    msgType: 'reply',
    search: null,
  })

  let conversationSearchTimer = null
  let conversationSearchRequestSeq = 0

  function ensureConversationSearchState() {
    if (!workspace.search) {
      workspace.search = {
        visible: false,
        query: '',
        resultIds: [],
        activeIndex: -1,
        total: 0,
        loading: false,
        error: '',
      }
    }
    return workspace.search
  }

  const currentConv = computed(() => {
    return ctx.inboxModule?.inbox.items.find((c) => c.id === workspace.convId) || null
  })

  async function loadMessages(id = workspace.convId) {
    if (!id) {
      workspace.messages = []
      resetConversationSearch(false)
      return
    }

    workspace.loading = true
    try {
      const page = await getMessages({ conversationId: id, includeInternal: true, size: 50 })
      const items = normalizeMessagePage(page)
      const conv = ctx.inboxModule?.inbox.items.find((c) => c.id === id)

      const sorted = [...items].sort(
        (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      )
      workspace.messages = sorted.map((m) =>
        mapMessageToAdminTimeline(m, {
          buyerId: conv?.buyerId,
          staffId: getStaffId(),
          staffName: ctx.currentAdmin.value.name,
        }),
      )
      if (ensureConversationSearchState().query.trim()) performConversationSearch()

      ctx.socketModule?.connectSocketForConversation(id)
    } catch (error) {
      ctx.uiStore.showToast({
        icon: 'alert',
        title: 'Không tải được tin nhắn',
        subtitle: error.message || '',
      })
    } finally {
      workspace.loading = false
    }
  }

  async function loadConversation(id) {
    workspace.convId = id
    resetConversationSearch(ensureConversationSearchState().visible)
    const conv = ctx.inboxModule?.inbox.items.find((c) => c.id === id)
    if (conv) {
      ctx.inboxModule?.clearRealtimeUnread(id)
    }
    await loadMessages(id)
  }

  function toggleDetailPanel() {
    workspace.detailVisible = !workspace.detailVisible
  }

  function setMsgType(type) {
    workspace.msgType = type
  }

  function mergeSearchMessages(items = []) {
    if (!items.length || !workspace.convId) return
    const conv = ctx.inboxModule?.inbox.items.find((c) => c.id === workspace.convId)
    const existingIds = new Set(workspace.messages.map((message) => message.id))
    const mappedItems = items
      .map((message) => mapMessageToAdminTimeline(message, {
        buyerId: conv?.buyerId,
        staffId: getStaffId(),
        staffName: ctx.currentAdmin.value.name,
      }))
      .filter((message) => !existingIds.has(message.id))

    if (!mappedItems.length) return

    workspace.messages = [...workspace.messages, ...mappedItems].sort(
      (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
    )
  }

  async function performConversationSearch() {
    const search = ensureConversationSearchState()
    const query = String(search.query || '').trim()
    if (!query) {
      search.resultIds = []
      search.activeIndex = -1
      search.total = 0
      search.loading = false
      search.error = ''
      return
    }

    const requestSeq = ++conversationSearchRequestSeq
    const previousActiveId = search.resultIds[search.activeIndex]
    search.loading = true
    search.error = ''

    try {
      const page = await searchMessages({
        conversationId: workspace.convId,
        query,
        page: 0,
        size: 30,
        includeInternal: true,
      })
      if (requestSeq !== conversationSearchRequestSeq) return

      const items = normalizeMessagePage(page)
      mergeSearchMessages(items)

      const resultIds = items.map((message) => message.id ?? message.messageId).filter(Boolean)
      search.resultIds = resultIds
      search.total = Number(page?.totalElements ?? page?.total ?? resultIds.length) || 0

      if (!resultIds.length) {
        search.activeIndex = -1
        return
      }

      const previousIndex = resultIds.indexOf(previousActiveId)
      search.activeIndex = previousIndex >= 0 ? previousIndex : 0
    } catch (error) {
      if (requestSeq !== conversationSearchRequestSeq) return
      search.resultIds = []
      search.activeIndex = -1
      search.total = 0
      search.error = error.message || 'Không tìm được tin nhắn'
    } finally {
      if (requestSeq === conversationSearchRequestSeq) {
        search.loading = false
      }
    }
  }

  function resetConversationSearch(keepVisible = false) {
    const search = ensureConversationSearchState()
    search.visible = Boolean(keepVisible)
    search.query = ''
    search.resultIds = []
    search.activeIndex = -1
    search.total = 0
    search.loading = false
    search.error = ''
  }

  function toggleConversationSearch() {
    const search = ensureConversationSearchState()
    search.visible = !search.visible
    if (!search.visible) {
      resetConversationSearch(false)
    }
  }

  function closeConversationSearch() {
    resetConversationSearch(false)
  }

  function setConversationSearchQuery(query) {
    const search = ensureConversationSearchState()
    search.query = query
    search.visible = Boolean(String(query || '').trim())
    if (conversationSearchTimer) {
      clearTimeout(conversationSearchTimer)
      conversationSearchTimer = null
    }
    if (!search.visible) {
      conversationSearchRequestSeq += 1
      search.resultIds = []
      search.activeIndex = -1
      search.total = 0
      search.loading = false
      search.error = ''
      return
    }
    search.loading = true
    conversationSearchTimer = setTimeout(() => {
      performConversationSearch()
    }, 250)
  }

  function goToNextConversationSearchResult() {
    const search = ensureConversationSearchState()
    const total = search.resultIds.length
    if (!total) return
    search.activeIndex = (search.activeIndex + 1 + total) % total
  }

  function goToPrevConversationSearchResult() {
    const search = ensureConversationSearchState()
    const total = search.resultIds.length
    if (!total) return
    search.activeIndex = (search.activeIndex - 1 + total) % total
  }

  function _appendMessageToTimeline(payload, isInternal) {
    const conv = currentConv.value
    const mapped = mapMessageToAdminTimeline(
      { ...payload, isInternal },
      { buyerId: conv?.buyerId, staffId: getStaffId(), staffName: ctx.currentAdmin.value.name },
    )
    if (!workspace.messages.some((m) => m.id === mapped.id)) {
      workspace.messages.push(mapped)
      if (ensureConversationSearchState().query.trim()) performConversationSearch()
      
      if (conv) {
        conv.preview = isInternal ? `[Ghi chú] ${mapped.text}` : `Bạn: ${mapped.text}`
        conv.updatedAt = new Date().toISOString()
        ctx.inboxModule.inbox.items = [conv, ...ctx.inboxModule.inbox.items.filter(c => c.id !== conv.id)]
      }
    }
  }

  function normalizeOutgoingAttachments(attachments = []) {
    if (!attachments) return []
    return Array.isArray(attachments) ? attachments.filter(Boolean) : [attachments].filter(Boolean)
  }

  function buildAttachmentPayload(attachments = []) {
    const list = normalizeOutgoingAttachments(attachments)
    const first = list[0] || null
    const allImages = list.length > 0 && list.every((item) => item.isImage)
    const allFiles = list.length > 0 && list.every((item) => !item.isImage)
    const contentFallback = first
      ? list.length > 1
        ? allImages ? `${list.length} ảnh` : allFiles ? `${list.length} tệp` : `${list.length} đính kèm`
        : first.name || 'Đính kèm'
      : ''

    return {
      list,
      first,
      messageType: list.length ? (allImages ? 'IMAGE' : 'FILE') : 'TEXT',
      contentFallback,
      dtoFields: first ? {
        mediaId: first.mediaId || undefined,
        attachmentUrl: first.url || undefined,
        attachmentName: first.name || undefined,
        attachmentType: first.type || undefined,
        attachmentSize: first.size || undefined,
        attachments: list.map((item) => ({
          mediaId: item.mediaId || '',
          url: item.url || '',
          name: item.name || '',
          type: item.type || '',
          size: item.size || 0,
          isImage: Boolean(item.isImage),
        })),
      } : {},
    }
  }

  async function sendInternalNote(text, attachments = []) {
    const trimmed = String(text ?? '').trim()
    const attachmentPayload = buildAttachmentPayload(attachments)
    if ((!trimmed && !attachmentPayload.list.length) || !workspace.convId) return

    try {
      const content = trimmed || attachmentPayload.contentFallback || 'Đính kèm'
      const note = await postInternalNote(workspace.convId, {
        senderId: getStaffId(),
        content,
        messageType: attachmentPayload.messageType,
        ...attachmentPayload.dtoFields,
      })
      _appendMessageToTimeline({
        ...note,
        attachments: note?.attachments?.length ? note.attachments : attachmentPayload.dtoFields.attachments,
        attachmentUrl: note?.attachmentUrl || attachmentPayload.first?.url,
        attachmentName: note?.attachmentName || attachmentPayload.first?.name,
        attachmentType: note?.attachmentType || attachmentPayload.first?.type,
        attachmentSize: note?.attachmentSize || attachmentPayload.first?.size,
        mediaId: note?.mediaId || attachmentPayload.first?.mediaId,
      }, true)
      ctx.uiStore.showToast({
        icon: 'lock',
        title: 'Ghi chú đã lưu',
        subtitle: ctx.currentAdmin.value.name,
      })
    } catch (error) {
      ctx.uiStore.showToast({
        icon: 'alert',
        title: 'Lưu ghi chú thất bại',
        subtitle: error.message || '',
      })
    }
  }

  async function sendCustomerReply(text, attachments = []) {
    const trimmed = String(text ?? '').trim()
    const attachmentPayload = buildAttachmentPayload(attachments)
    if ((!trimmed && !attachmentPayload.list.length) || !workspace.convId) return

    const conv = currentConv.value
    const content = trimmed || attachmentPayload.contentFallback || 'Đính kèm'
    const dto = {
      conversationId: workspace.convId,
      senderId: getStaffId(),
      receiverId: conv?.buyerId ?? null,
      content,
      messageType: attachmentPayload.messageType,
      ...attachmentPayload.dtoFields,
      isInternal: false,
    }

    if (!ctx.socketModule?.socket.client?.isConnected?.()) {
      ctx.socketModule?.connectSocketForConversation(workspace.convId)
    }

    try {
      const saved = await postMessage(dto)
      _appendMessageToTimeline({
        ...dto,
        ...saved,
        attachments: saved?.attachments?.length ? saved.attachments : dto.attachments,
        attachmentUrl: saved?.attachmentUrl || dto.attachmentUrl,
        attachmentName: saved?.attachmentName || dto.attachmentName,
        attachmentType: saved?.attachmentType || dto.attachmentType,
        attachmentSize: saved?.attachmentSize || dto.attachmentSize,
        mediaId: saved?.mediaId || dto.mediaId,
      }, false)
      
      if (conv && conv.statusKey !== 'closed') {
        conv.status = 'WAITING_CUSTOMER'
        conv.statusKey = 'waiting'
      }
    } catch (error) {
      ctx.uiStore.showToast({
        icon: 'alert',
        title: 'Gửi tin nhắn thất bại',
        subtitle: formatChatError(error, 'Không gửi được tin nhắn. Vui lòng kiểm tra kết nối hoặc thử lại.'),
      })
    }
  }

  async function updateStatus(statusKey) {
    if (!workspace.convId) return

    try {
      const updated = await patchStatus(workspace.convId, mapStatusToApi(statusKey))
      const conv = ctx.inboxModule?.inbox.items.find((c) => c.id === workspace.convId)
      if (conv) {
        conv.status = updated?.status || mapStatusToApi(statusKey)
        conv.statusKey = statusKey
        conv.closedAt = updated?.closedAt || (statusKey === 'closed' ? new Date().toISOString() : conv.closedAt)
      }
      ctx.uiStore.showToast({ icon: 'info', title: 'Cập nhật trạng thái', subtitle: '→ ' + statusKey })
    } catch (error) {
      ctx.uiStore.showToast({
        icon: 'alert',
        title: 'Cập nhật trạng thái thất bại',
        subtitle: error.message || '',
      })
    }
  }

  async function updatePriority(priorityKey) {
    if (!workspace.convId) return

    const conv = ctx.inboxModule?.inbox.items.find((c) => c.id === workspace.convId)
    const previousPriority = conv?.priority

    if (conv) {
      conv.priority = priorityKey
    }

    try {
      await patchPriority(workspace.convId, mapPriorityToApi(priorityKey))
      ctx.uiStore.showToast({ icon: 'flag', title: 'Cập nhật độ ưu tiên', subtitle: '→ ' + priorityKey })
    } catch (error) {
      if (conv) {
        conv.priority = previousPriority
      }
      ctx.uiStore.showToast({
        icon: 'alert',
        title: 'Cập nhật độ ưu tiên thất bại',
        subtitle: error.message || '',
      })
    }
  }

  async function resolveConversation() {
    if (!workspace.convId) return

    try {
      const updated = await patchStatus(workspace.convId, 'RESOLVED')
      const conv = ctx.inboxModule?.inbox.items.find((c) => c.id === workspace.convId)
      if (conv) {
        conv.status = updated?.status || 'RESOLVED'
        conv.statusKey = 'resolved'
        conv.closedAt = updated?.closedAt || conv.closedAt
      }
      ctx.uiStore.showToast({ icon: 'check', title: 'Hội thoại đã giải quyết', subtitle: 'Có thể đóng hẳn bằng trạng thái Đã đóng.' })
    } catch (error) {
      ctx.uiStore.showToast({
        icon: 'alert',
        title: 'Không thể đóng hội thoại',
        subtitle: error.message || '',
      })
    }
  }

  return {
    workspace,
    currentConv,
    ensureConversationSearchState,
    loadMessages,
    loadConversation,
    toggleDetailPanel,
    setMsgType,
    toggleConversationSearch,
    closeConversationSearch,
    setConversationSearchQuery,
    goToNextConversationSearchResult,
    goToPrevConversationSearchResult,
    sendCustomerReply,
    sendInternalNote,
    updateStatus,
    updatePriority,
    resolveConversation,
    performConversationSearch
  }
}
