import { ref } from 'vue'

export function useAppToast() {
  const toastMessage = ref('')
  const showToast = ref(false)
  let timer = null

  function notify(message, duration = 3000) {
    if (timer) clearTimeout(timer)
    toastMessage.value = message
    showToast.value = true
    timer = setTimeout(() => {
      showToast.value = false
    }, duration)
  }

  return {
    toastMessage,
    showToast,
    notify
  }
}
