export function useProductNavigation() {
  function getDetailRoute(productId) {
    return productId ? `/products/${productId}` : null
  }

  return {
    getDetailRoute,
  }
}
