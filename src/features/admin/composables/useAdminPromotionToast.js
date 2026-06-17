import { onBeforeUnmount, ref } from 'vue'

export function useAdminPromotionToast() {
  const toast = ref({ message: '', type: 'info' })
  let toastTimer = null

  function notify(message, type = 'info') {
    window.clearTimeout(toastTimer)
    toast.value = { message, type }
    toastTimer = window.setTimeout(() => {
      toast.value = { message: '', type: 'info' }
    }, 2600)
  }

  onBeforeUnmount(() => {
    window.clearTimeout(toastTimer)
  })

  return {
    toast,
    notify,
  }
}
