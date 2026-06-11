import { pinia } from '@app/plugins/pinia'
import { useAuthStore } from '@features/auth/store/authStore'

/**
 * ID người dùng cho MessageService (buyer / staff).
 * Buyer chỉ lấy từ VITE_CHAT_BUYER_ID hoặc profile.id để tránh gọi nhầm user mock.
 * Staff vẫn fallback 5001 cho admin/dev mode khi profile chưa có id số.
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

  const authStore = useAuthStore(pinia)
  const fromProfile = parseNumericId(authStore.user?.id)
  if (fromProfile != null) return fromProfile

  return null
}

export function getStaffId() {
  const fromEnv = envStaffId()
  if (fromEnv != null) return fromEnv

  const authStore = useAuthStore(pinia)
  const fromProfile = parseNumericId(authStore.user?.id)
  if (fromProfile != null) return fromProfile

  return 5001
}
