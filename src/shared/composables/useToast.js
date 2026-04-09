import { ref } from 'vue'

const message = ref('')
const visible = ref(false)

let hideTimer

export function useToast() {
  function show(text, durationMs = 3000) {
    message.value = text
    visible.value = true
    clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      visible.value = false
    }, durationMs)
  }

  return { message, visible, show }
}
