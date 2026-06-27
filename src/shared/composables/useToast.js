import { ref } from 'vue'

const message = ref('')
const type = ref('info') // 'info', 'success', 'error', 'warning'
const visible = ref(false)

let hideTimer = null

export function useToast() {
  function show(text, toastType = 'info', durationMs = 3000) {
    message.value = text
    type.value = toastType
    visible.value = true
    
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      visible.value = false
    }, durationMs)
  }

  function hide() {
    visible.value = false
    if (hideTimer) clearTimeout(hideTimer)
  }

  return { message, type, visible, show, hide }
}
