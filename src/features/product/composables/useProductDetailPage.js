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
      const raw = res.data
      if (!raw) throw new Error('not_found')

      const currentPriceStr = new Intl.NumberFormat('vi-VN').format(raw.price || 0)
      const oldPriceStr = raw.oldPrice ? new Intl.NumberFormat('vi-VN').format(raw.oldPrice) : ''
      const saveStr = raw.oldPrice && raw.oldPrice > raw.price ? `Tiết kiệm ${new Intl.NumberFormat('vi-VN').format(raw.oldPrice - raw.price)}đ` : ''

      const ratingScore = raw.rating ? Number(raw.rating).toFixed(1) : '5.0'
      const ratingStars = ratingScore >= 4.5 ? '★★★★★' : '★★★★☆'
      const ratingCount = raw.ratingCount ?? 0
      const ratingSold = raw.stock ? Math.max(0, raw.stock * 3) : 0

      const descArray = Array.isArray(raw.description)
        ? raw.description
        : raw.description
          ? [raw.description]
          : []

      let specsObj = {
        summaryTitle: 'Thông số cơ bản',
        summaryRows: [],
        detailTitle: 'Chi tiết kỹ thuật',
        detailRows: [],
      }

      if (raw.specs) {
        if (Array.isArray(raw.specs)) {
          specsObj.detailRows = raw.specs
          specsObj.summaryRows = raw.specs.slice(0, 4)
        } else if (raw.specs.detailRows || raw.specs.summaryRows) {
          specsObj = { ...specsObj, ...raw.specs }
        } else if (typeof raw.specs === 'object') {
          const rows = Object.entries(raw.specs).map(([key, value]) => ({ key, value }))
          specsObj.detailRows = rows
          specsObj.summaryRows = rows.slice(0, 4)
        }
      }

      const reviewsObj = raw.reviews ?? { bars: [], items: [] }
      const galleryArr = raw.gallery?.length ? raw.gallery : raw.thumbnailUrl ? [raw.thumbnailUrl] : []

      product.value = {
        ...raw,
        price: {
          current: currentPriceStr,
          old: oldPriceStr,
          save: saveStr,
          rawValue: raw.price,
        },
        rating: {
          stars: ratingStars,
          score: ratingScore,
          count: ratingCount,
          sold: ratingSold,
        },
        descriptionTitle: raw.name,
        description: descArray,
        specs: specsObj,
        reviews: reviewsObj,
        gallery: galleryArr,
        colors: raw.colors?.length ? raw.colors : [],
        sizes: raw.sizes?.length ? raw.sizes : [],
      }

      selectedColor.value = product.value.colors?.[0] ?? ''
      selectedSize.value = product.value.sizes?.[1] ?? product.value.sizes?.[0] ?? ''
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
