import { onMounted, onBeforeUnmount } from 'vue'

export function useDragScroll(containerRef) {
  let isDown = false
  let isDragging = false
  let startX
  let scrollLeft

  const handleMouseDown = (e) => {
    if (!containerRef.value) return
    isDown = true
    isDragging = false
    containerRef.value.style.cursor = 'grabbing'
    containerRef.value.style.userSelect = 'none'
    startX = e.pageX - containerRef.value.offsetLeft
    scrollLeft = containerRef.value.scrollLeft
  }

  const handleMouseLeave = () => {
    isDown = false
    if (containerRef.value) {
      containerRef.value.style.cursor = 'grab'
      containerRef.value.style.userSelect = ''
    }
  }

  const handleMouseUp = () => {
    isDown = false
    if (containerRef.value) {
      containerRef.value.style.cursor = 'grab'
      containerRef.value.style.userSelect = ''
    }
  }

  const handleMouseMove = (e) => {
    if (!isDown || !containerRef.value) return
    e.preventDefault()
    const x = e.pageX - containerRef.value.offsetLeft
    const walk = (x - startX) * 2 // Scroll speed multiplier
    
    // If moved more than 5px, mark as dragging
    if (Math.abs(x - startX) > 5) {
      isDragging = true
    }
    
    containerRef.value.scrollLeft = scrollLeft - walk
  }
  
  const handleClick = (e) => {
    if (isDragging) {
      e.preventDefault()
      e.stopPropagation()
      isDragging = false
    }
  }

  onMounted(() => {
    const el = containerRef.value
    if (el) {
      el.style.cursor = 'grab'
      el.addEventListener('mousedown', handleMouseDown)
      el.addEventListener('mouseleave', handleMouseLeave)
      el.addEventListener('mouseup', handleMouseUp)
      el.addEventListener('mousemove', handleMouseMove)
      // Capture phase to intercept clicks before child elements
      el.addEventListener('click', handleClick, true)
    }
  })

  onBeforeUnmount(() => {
    const el = containerRef.value
    if (el) {
      el.style.cursor = ''
      el.removeEventListener('mousedown', handleMouseDown)
      el.removeEventListener('mouseleave', handleMouseLeave)
      el.removeEventListener('mouseup', handleMouseUp)
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('click', handleClick, true)
    }
  })
}
