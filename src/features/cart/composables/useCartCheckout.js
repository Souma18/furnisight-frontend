export function useCartCheckout(router, selectedItems, selectedCount) {
  function handleCheckout() {
    if (!selectedCount.value) return

    const lineIds = selectedItems.value.map((item) => item.id).join(',')
    router.push({ path: '/checkout', query: { lines: lineIds } })
  }

  return {
    handleCheckout,
  }
}
