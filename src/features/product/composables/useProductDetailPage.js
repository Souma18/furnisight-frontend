import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchProductById } from '../api/productApi'


export function useProductDetailPage(props) {
  const router = useRouter()
  const product = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const selectedColor = ref('')
  const selectedSize = ref('')
  const qty = ref(1)
  const wished = ref(false)
  const activeImage = ref('')
  const activeTab = ref('desc')
  const show3DModal = ref(false)

  async function loadProduct(id) {
    loading.value = true
    error.value = null
    product.value = null
    try {
      const res = await fetchProductById(id)
      if (!res.data) throw new Error('not_found')

      product.value = res.data

      selectedColor.value = product.value.colors?.[0] ?? ''
      selectedSize.value = product.value.sizes?.[0] ?? ''
      activeImage.value = product.value.gallery?.[0] ?? ''
      qty.value = 1
      activeTab.value = 'desc'
      show3DModal.value = false
    } catch (e) {
      if (e.message === 'not_found' || e.response?.status === 404) {
        error.value = 'not_found'
      } else {
        error.value = 'api_error'
      }
    } finally {
      loading.value = false
    }
  }

  function retry() {
    loadProduct(props.id)
  }

  function changeQty(delta) {
    qty.value = Math.max(1, Math.min(product.value?.stock ?? 99, qty.value + delta))
  }

  function openRoom3D() {
    router.push({
      name: 'room3d',
      query: {
        productId: product.value?.id ?? '',
        roomType: product.value?.roomTypeHint ?? '',
      },
    })
  }

  const breadcrumbLinks = ref([])
  watch(product, (p) => {
    if (!p) { breadcrumbLinks.value = []; return }
    breadcrumbLinks.value = (p.breadcrumb ?? []).map((crumb) => ({
      label: crumb.label ?? crumb,
      to: (crumb.id === 'home' || crumb === 'Trang chủ')
        ? { name: 'home' }
        : { name: 'products', query: { category: crumb.id } },
    }))
  })

  watch(() => props.id, (id) => loadProduct(id))
  onMounted(() => loadProduct(props.id))

  return {
    product,
    loading,
    error,
    selectedColor,
    selectedSize,
    qty,
    wished,
    activeImage,
    activeTab,
    show3DModal,
    breadcrumbLinks,
    retry,
    changeQty,
    openRoom3D,
  }
}
