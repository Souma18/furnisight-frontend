import { onBeforeUnmount, ref } from 'vue'

export function usePromotionToast() {
  const toast = ref({ show: false, title: '', subtitle: '', icon: 'check' })
  let toastTimer = null

  function showToast(title, subtitle, icon = 'check') {
    window.clearTimeout(toastTimer)
    toast.value = { show: true, title, subtitle, icon }
    toastTimer = window.setTimeout(() => {
      toast.value = { ...toast.value, show: false }
    }, 2600)
  }

  onBeforeUnmount(() => {
    window.clearTimeout(toastTimer)
  })

  return {
    toast,
    showToast,
  }
}
