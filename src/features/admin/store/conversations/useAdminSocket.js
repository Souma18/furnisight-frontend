import { reactive } from 'vue'
import { createMessageServiceSocket } from '@features/chat/api/messageServiceSocket'
import { mapMessageToAdminTimeline } from '@features/chat/lib/chatMappers'
import { getStaffId } from '@features/chat/lib/chatUserIds'

/**
 * Quản lý kết nối WebSocket cho Admin:
 * - Nhận thông báo tin nhắn mới (Admin Inbox).
 * - Nghe Real-time tin nhắn công khai và ghi chú nội bộ.
 * - Tự động xử lý kết nối/ngắt kết nối khi admin mở/đóng cửa sổ chat.
 */
export function useAdminSocket(ctx) {
  const socket = reactive({
    connected: false,
    client: null,
    subscribedId: null
  })

  function subscribeAdminTopics(id) {
    if (!socket.client?.isConnected?.()) return
    // Đăng ký lắng nghe hộp thư đến chung của Admin
    socket.client.subscribeAdminInbox(ctx.inboxModule?.handleAdminInboxEvent)

    if (!id) return
    
    if (socket.subscribedId && socket.subscribedId !== id) {
      socket.client.unsubscribe(`/topic/conversation/${socket.subscribedId}`)
      socket.client.unsubscribe(`/topic/conversation/${socket.subscribedId}/internal`)
    }

    socket.subscribedId = id
    const conv = ctx.inboxModule?.inbox.items.find((c) => c.id === id)

    socket.client.subscribeConversation(id, (payload) => {
      if (!payload || payload.isInternal) return
      const mapped = mapMessageToAdminTimeline(payload, {
        buyerId: conv?.buyerId,
        staffId: getStaffId(),
        staffName: ctx.currentAdmin.value.name,
      })
      if (!ctx.workspaceModule?.workspace.messages.some((m) => m.id === mapped.id)) {
        ctx.workspaceModule?.workspace.messages.push(mapped)
        if (ctx.workspaceModule?.ensureConversationSearchState().query.trim()) {
          ctx.workspaceModule?.performConversationSearch()
        }
        
        if (conv) {
          conv.preview = mapped.text
          conv.updatedAt = new Date().toISOString()
          ctx.inboxModule?.clearRealtimeUnread(id)
          ctx.inboxModule.inbox.items = [conv, ...ctx.inboxModule.inbox.items.filter(c => c.id !== id)]
        }
      }
    })

    socket.client.subscribeInternal(id, (payload) => {
      if (!payload) return
      const mapped = mapMessageToAdminTimeline(
        { ...payload, isInternal: true },
        {
          buyerId: conv?.buyerId,
          staffId: getStaffId(),
          staffName: ctx.currentAdmin.value.name,
        },
      )
      if (!ctx.workspaceModule?.workspace.messages.some((m) => m.id === mapped.id)) {
        ctx.workspaceModule?.workspace.messages.push(mapped)
        if (ctx.workspaceModule?.ensureConversationSearchState().query.trim()) {
          ctx.workspaceModule?.performConversationSearch()
        }
        
        if (conv) {
          conv.preview = `[Ghi chú] ${mapped.text}`
          conv.updatedAt = new Date().toISOString()
          ctx.inboxModule.inbox.items = [conv, ...ctx.inboxModule.inbox.items.filter(c => c.id !== id)]
        }
      }
    })
  }

  function connectSocketForConversation(id) {
    if (socket.connected && socket.client) {
      subscribeAdminTopics(id)
      return
    }

    socket.client?.disconnect()
    socket.connected = false

    socket.client = createMessageServiceSocket({
      onConnect: () => {
        socket.connected = true
        subscribeAdminTopics(id)
      },
      onDisconnect: () => {
        socket.connected = false
      },
      onError: () => {
        socket.connected = false
      },
    })

    socket.client.connect()
  }

  function disconnectSocket() {
    socket.client?.disconnect()
    socket.client = null
    socket.subscribedId = null
    socket.connected = false
  }

  return {
    socket,
    connectSocketForConversation,
    disconnectSocket
  }
}
