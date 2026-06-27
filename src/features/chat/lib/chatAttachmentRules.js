export const DOCUMENT_FILE_ACCEPT = '.pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain'
export const CHAT_ATTACHMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024
export const CHAT_ATTACHMENT_MAX_SIZE_LABEL = '10MB'

const DOCUMENT_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt']
const DOCUMENT_FILE_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

export function isAllowedChatDocument(file) {
  const extension = String(file?.name || '').split('.').pop()?.toLowerCase()
  return DOCUMENT_FILE_EXTENSIONS.includes(extension) || DOCUMENT_FILE_MIME_TYPES.includes(file?.type)
}

export function isAllowedChatImage(file) {
  return String(file?.type || '').startsWith('image/')
}

export function isAllowedChatAttachmentSize(file) {
  return Number(file?.size || 0) > 0 && Number(file?.size || 0) <= CHAT_ATTACHMENT_MAX_SIZE_BYTES
}

export function chatAttachmentFormatError(kind = 'file') {
  if (kind === 'image') {
    return 'Ảnh không đúng định dạng. Vui lòng chọn file ảnh JPG, PNG, WEBP hoặc định dạng ảnh hợp lệ.'
  }
  return 'File không đúng định dạng. Chỉ hỗ trợ tài liệu PDF, DOC, DOCX hoặc TXT.'
}

export function chatAttachmentSizeError() {
  return `Tệp đính kèm không được vượt quá ${CHAT_ATTACHMENT_MAX_SIZE_LABEL}. Vui lòng chọn tệp nhỏ hơn.`
}
