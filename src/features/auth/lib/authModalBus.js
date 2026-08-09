export const AUTH_MODAL_EVENT = 'furnisight:open-auth-modal'

let pendingInitialView = null

export function openAuthModal(initialView = 'login') {
  pendingInitialView = initialView
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(AUTH_MODAL_EVENT, {
      detail: { initialView },
    }),
  )
}

export function consumePendingAuthModal() {
  const initialView = pendingInitialView
  pendingInitialView = null
  return initialView
}
