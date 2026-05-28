import { storeToRefs } from 'pinia'
import { useProductStore } from '../store/productStore'

export function useProducts() {
  const store = useProductStore()
  const { items, total, facets, loading, error, selectedProduct, productDetails } = storeToRefs(store)
  return {
    items,
    total,
    facets,
    loading,
    error,
    selectedProduct,
    productDetails,
    loadList: store.loadList,
    loadDetail: store.loadDetail,
  }
}
