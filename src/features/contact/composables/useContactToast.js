import { onBeforeUnmount, ref } from 'vue'

export function useContactToast(defaultToast) {
  const toast = ref({
    show: false,
    title: defaultToast.title,
    subtitle: defaultToast.subtitle,
  })

  let toastTimer = null

  function showToast(payload = defaultToast) {
    toast.value = {
      show: true,
      title: payload.title,
      subtitle: payload.subtitle,
    }

    window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => {
      toast.value = { ...toast.value, show: false }
    }, 4000)
  }

  onBeforeUnmount(() => {
    window.clearTimeout(toastTimer)
    toastTimer = null
  })

  return {
    toast,
    showToast,
  }
}
