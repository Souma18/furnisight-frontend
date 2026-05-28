/**
 * WebSocket client cho chat — gắn BE sau bằng cách truyền url + xử lý event.
 *
 * @example
 * const socket = createChatSocket({
 *   url: import.meta.env.VITE_CHAT_WS_URL,
 *   onMessage: (payload) => chatStore.handleSocketMessage(payload),
 * })
 * socket.connect()
 * socket.send({ type: 'message', content: 'Xin chào' })
 */
export function createChatSocket({
  url,
  protocols,
  onOpen,
  onClose,
  onError,
  onMessage,
  autoReconnect = true,
  reconnectDelayMs = 3000,
} = {}) {
  let ws = null
  let reconnectTimer = null
  let manualClose = false

  function connect() {
    if (!url) {
      console.warn('[chatSocket] Missing WebSocket url')
      return
    }

    manualClose = false
    clearTimeout(reconnectTimer)

    ws = new WebSocket(url, protocols)

    ws.addEventListener('open', (event) => {
      onOpen?.(event)
    })

    ws.addEventListener('message', (event) => {
      let payload = event.data
      try {
        payload = JSON.parse(event.data)
      } catch {
        // giữ nguyên chuỗi thô
      }
      onMessage?.(payload, event)
    })

    ws.addEventListener('error', (event) => {
      onError?.(event)
    })

    ws.addEventListener('close', (event) => {
      onClose?.(event)
      ws = null
      if (autoReconnect && !manualClose) {
        reconnectTimer = setTimeout(connect, reconnectDelayMs)
      }
    })
  }

  function disconnect() {
    manualClose = true
    clearTimeout(reconnectTimer)
    ws?.close()
    ws = null
  }

  function send(payload) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('[chatSocket] Socket is not open')
      return false
    }

    const body = typeof payload === 'string' ? payload : JSON.stringify(payload)
    ws.send(body)
    return true
  }

  function getReadyState() {
    return ws?.readyState ?? WebSocket.CLOSED
  }

  return {
    connect,
    disconnect,
    send,
    getReadyState,
  }
}
