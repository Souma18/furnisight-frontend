import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

const CHAT_POSITION_KEY = 'furnisight:chat-position'
const FAB_SIZE = 56
const EDGE_GAP = 12

export function useDraggableWidget() {
  const position = reactive({ right: 32, bottom: 32 })
  const dragging = ref(false)
  let dragStart = null
  let suppressNextClick = false

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), Math.max(min, max))
  }

  function defaultPosition() {
    return window.innerWidth <= 480 ? { right: 16, bottom: 20 } : { right: 32, bottom: 32 }
  }

  function constrainPosition() {
    position.right = clamp(position.right, EDGE_GAP, window.innerWidth - FAB_SIZE - EDGE_GAP)
    position.bottom = clamp(position.bottom, EDGE_GAP, window.innerHeight - FAB_SIZE - EDGE_GAP)
  }

  function savePosition() {
    localStorage.setItem(CHAT_POSITION_KEY, JSON.stringify({
      right: Math.round(position.right),
      bottom: Math.round(position.bottom),
    }))
  }

  function loadPosition() {
    const fallback = defaultPosition()
    try {
      const saved = JSON.parse(localStorage.getItem(CHAT_POSITION_KEY) || 'null')
      position.right = Number.isFinite(saved?.right) ? saved.right : fallback.right
      position.bottom = Number.isFinite(saved?.bottom) ? saved.bottom : fallback.bottom
    } catch {
      position.right = fallback.right
      position.bottom = fallback.bottom
    }
    constrainPosition()
  }

  const widgetStyle = computed(() => {
    const modalWidth = Math.min(420, window.innerWidth - 24)
    const modalHeight = Math.min(580, window.innerHeight * 0.72)
    const maxModalRight = window.innerWidth - modalWidth - EDGE_GAP
    const maxModalBottom = window.innerHeight - modalHeight - EDGE_GAP
    const modalRight = clamp(position.right, EDGE_GAP, maxModalRight)
    const modalBottom = clamp(position.bottom + FAB_SIZE + 16, EDGE_GAP, maxModalBottom)
    const tooltipRight = clamp(position.right + FAB_SIZE + 12, EDGE_GAP, window.innerWidth - 260)

    return {
      '--chat-right': `${position.right}px`,
      '--chat-bottom': `${position.bottom}px`,
      '--chat-modal-right': `${modalRight}px`,
      '--chat-modal-bottom': `${modalBottom}px`,
      '--chat-tooltip-right': `${tooltipRight}px`,
      '--chat-tooltip-bottom': `${position.bottom + 2}px`,
    }
  })

  function handleDragStart(event) {
    if (event.button !== 0 && event.pointerType === 'mouse') return
    dragStart = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      right: position.right,
      bottom: position.bottom,
      moved: false,
    }
    dragging.value = true
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function handleDragMove(event) {
    if (!dragStart) return
    const deltaX = event.clientX - dragStart.pointerX
    const deltaY = event.clientY - dragStart.pointerY
    if (Math.hypot(deltaX, deltaY) > 5) dragStart.moved = true
    if (!dragStart.moved) return

    event.preventDefault()
    position.right = dragStart.right - deltaX
    position.bottom = dragStart.bottom - deltaY
    constrainPosition()
  }

  function handleDragEnd(event) {
    if (!dragStart) return
    suppressNextClick = dragStart.moved
    dragging.value = false
    dragStart = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    savePosition()
  }

  function shouldSuppressClick() {
    if (suppressNextClick) {
      suppressNextClick = false
      return true
    }
    return false
  }

  function handleViewportResize() {
    constrainPosition()
  }

  onMounted(() => {
    loadPosition()
    window.addEventListener('resize', handleViewportResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleViewportResize)
  })

  return {
    dragging,
    widgetStyle,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    shouldSuppressClick
  }
}
