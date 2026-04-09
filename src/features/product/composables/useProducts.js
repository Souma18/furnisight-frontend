import { storeToRefs } from 'pinia'
import { useProductStore } from '../store/productStore'

export function useProducts() {
  const store = useProductStore()
  const { items, loading, error } = storeToRefs(store)
  return { items, loading, error, loadList: store.loadList }
}
