import { pinia } from '@app/plugins/pinia'
import { useAuthStore } from '@features/auth/store/authStore'

/**
 * ID người dùng cho MessageService (buyer / staff).
 * MessageService hiện lưu buyer/staff id dạng Integer, trong khi user-service dùng UUID.
 * Vì vậy ưu tiên env/id số nếu có, nếu không thì tạo id số ổn định từ authStore.user.
 */

function parseNumericId(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

function hashStableNumericId(value, offset = 100_000, span = 1_400_000_000) {
  const text = String(value ?? '').trim()
  if (!text) return null

  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0
  }

  return Math.abs(hash) % span + offset
}

export function profileNumericId(profile, offset, span) {
  if (!profile) return null

  const direct = parseNumericId(profile.accountId)
    ?? parseNumericId(profile.id)
    ?? parseNumericId(profile.userId)
  if (direct != null) return direct

  return hashStableNumericId(
    profile.accountId
      ?? profile.id
      ?? profile.email
      ?? profile.displayName,
    offset,
    span,
  )
}

function envBuyerId() {
  return parseNumericId(import.meta.env.VITE_CHAT_BUYER_ID)
}

function envStaffId() {
  return parseNumericId(import.meta.env.VITE_CHAT_STAFF_ID)
}

export function getBuyerId() {
  const authStore = useAuthStore(pinia)
  if (!authStore.isAuthenticated) return null

  const fromEnv = envBuyerId()
  if (fromEnv != null) return fromEnv

  const fromProfile = profileNumericId(authStore.user, 100_000, 1_400_000_000)
  if (fromProfile != null) return fromProfile

  return null
}

export function getStaffId() {
  const authStore = useAuthStore(pinia)
  if (!authStore.isAuthenticated) return null

  const fromEnv = envStaffId()
  if (fromEnv != null) return fromEnv

  const fromProfile = profileNumericId(authStore.user, 1_500_000_000, 600_000_000)
  if (fromProfile != null) return fromProfile

  return 5001
}
