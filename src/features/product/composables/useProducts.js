import { storeToRefs } from 'pinia'
import { pinia } from '@app/plugins/pinia'
import { useProductStore } from '../store/productStore'

export function useProducts() {
  const store = useProductStore(pinia)
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
