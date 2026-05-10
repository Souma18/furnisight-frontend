import { storeToRefs } from 'pinia'
import { useProductStore } from '../store/productStore'

export function useProducts() {
  const store = useProductStore()
  const { items, total, facets, loading, error } = storeToRefs(store)
  return { items, total, facets, loading, error, loadList: store.loadList }
}
