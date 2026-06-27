export async function downloadChatAttachment(attachment = {}) {
  const url = attachment.url || attachment.attachmentUrl || ''
  if (!url) return

  const filename = attachment.name || attachment.attachmentName || 'tep-dinh-kem'

  try {
    const response = await fetch(url, { mode: 'cors' })
    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`)
    }

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    triggerDownload(objectUrl, filename)
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  } catch {
    triggerDownload(url, filename)
  }
}

function triggerDownload(url, filename) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noreferrer'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
