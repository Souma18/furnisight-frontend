import { mediaApi } from '@shared/lib/api/services'

export async function uploadChatAttachment(file, authStore) {
  if (!file) return null

  const profile = await authStore.ensureProfileLoaded({ force: true })
  const ownerId = profile?.accountId

  if (!ownerId) {
    throw new Error('Không tìm thấy người dùng để tải tệp lên.')
  }

  return mediaApi.uploadDirect(file, {
    ownerType: 'CHAT',
    ownerId,
  })
}
