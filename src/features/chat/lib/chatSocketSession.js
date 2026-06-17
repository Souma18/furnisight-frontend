import { createMessageServiceSocket } from '../api/messageServiceSocket'

export function createChatSocketSession({
  connectionStatus,
  conversationId,
  onIncomingMessage,
}) {
  let socketClient = null
  let subscribedConvId = null

  function subscribeCurrentConversation() {
    if (!socketClient?.isConnected?.() || !conversationId.value) return

    if (subscribedConvId && subscribedConvId !== conversationId.value) {
      socketClient.unsubscribe(`/topic/conversation/${subscribedConvId}`)
    }

    subscribedConvId = conversationId.value
    socketClient.subscribeConversation(conversationId.value, onIncomingMessage)
  }

  function connectSocket() {
    if (!conversationId.value) return

    socketClient?.disconnect()

    connectionStatus.value = 'connecting'
    socketClient = createMessageServiceSocket({
      onConnect: () => {
        connectionStatus.value = 'open'
        subscribeCurrentConversation()
      },
      onDisconnect: () => {
        connectionStatus.value = 'closed'
      },
      onError: () => {
        connectionStatus.value = 'error'
      },
    })

    socketClient.connect()
  }

  function disconnectSocket() {
    socketClient?.disconnect()
    socketClient = null
    subscribedConvId = null
    connectionStatus.value = 'idle'
  }

  function isConnected() {
    return Boolean(socketClient?.isConnected?.())
  }

  return {
    connectSocket,
    disconnectSocket,
    isConnected,
  }
}
