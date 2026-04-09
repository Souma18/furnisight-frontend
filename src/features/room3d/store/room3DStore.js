import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useRoom3DStore = defineStore('room3d', () => {
  const activeRoomId = ref(null)
  const suggestedRoomType = ref(null)

  function setRoomContext({ roomId, roomType }) {
    activeRoomId.value = roomId ?? null
    suggestedRoomType.value = roomType ?? null
  }

  return { activeRoomId, suggestedRoomType, setRoomContext }
})
