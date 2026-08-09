export function useVoucherRailDrag(voucherRail) {
  let voucherDrag = null

  function startVoucherDrag(event) {
    if (event.button !== 0 || !voucherRail.value) return
    if (event.target.closest('button, a, input, select, textarea, [role="button"]')) return
    voucherDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: voucherRail.value.scrollLeft,
    }
    voucherRail.value.setPointerCapture?.(event.pointerId)
  }

  function moveVoucherDrag(event) {
    if (!voucherDrag || !voucherRail.value) return
    const delta = event.clientX - voucherDrag.startX
    voucherRail.value.scrollLeft = voucherDrag.scrollLeft - delta
  }

  function stopVoucherDrag(event) {
    if (!voucherDrag || !voucherRail.value) return
    voucherRail.value.releasePointerCapture?.(event.pointerId)
    voucherDrag = null
  }

  return {
    startVoucherDrag,
    moveVoucherDrag,
    stopVoucherDrag,
  }
}
