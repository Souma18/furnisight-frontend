import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  const lines = ref([])

  function setLines(next) {
    lines.value = Array.isArray(next) ? next : []
  }

  return { lines, setLines }
})
