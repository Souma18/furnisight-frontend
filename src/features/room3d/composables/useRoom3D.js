import { storeToRefs } from 'pinia'
import { useRoom3DStore } from '../store/room3DStore'

export function useRoom3D() {
  const store = useRoom3DStore()
  const { activeRoomId, suggestedRoomType } = storeToRefs(store)
  return { activeRoomId, suggestedRoomType, setRoomContext: store.setRoomContext }
}
