import { useAuthStore } from '@features/auth/store/authStore'

/**
 * ID người dùng tạm cho MessageService (buyer / staff).
 * TODO(BE/gateway): sau khi gateway giải JWT, lấy userId từ token claim thay vì env/mock.
 * Ưu tiên: VITE_CHAT_BUYER_ID / VITE_CHAT_STAFF_ID → profile.id → mặc định 1001 / 5001.
 */

function parseNumericId(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function envBuyerId() {
  return parseNumericId(import.meta.env.VITE_CHAT_BUYER_ID)
}

function envStaffId() {
  return parseNumericId(import.meta.env.VITE_CHAT_STAFF_ID)
}

export function getBuyerId() {
  const fromEnv = envBuyerId()
  if (fromEnv != null) return fromEnv

  const authStore = useAuthStore()
  const fromProfile = parseNumericId(authStore.user?.id)
  if (fromProfile != null) return fromProfile

  return 1001
}

export function getStaffId() {
  const fromEnv = envStaffId()
  if (fromEnv != null) return fromEnv

  const authStore = useAuthStore()
  const fromProfile = parseNumericId(authStore.user?.id)
  if (fromProfile != null) return fromProfile

  return 5001
}
