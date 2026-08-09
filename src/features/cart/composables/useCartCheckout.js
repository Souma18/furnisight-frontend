export function useCartCheckout(router, selectedItems, selectedCount, ensureHydrated) {
  async function handleCheckout() {
    if (ensureHydrated) {
      await ensureHydrated({ force: true }).catch(() => null)
    }

    if (!selectedCount.value) return

    const lineIds = selectedItems.value.map((item) => item.id).join(',')
    router.push({ path: '/checkout', query: { lines: lineIds } })
  }

  return {
    handleCheckout,
  }
}
