import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

export function useProductNavigation({ product }) {
  const router = useRouter()
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

  function openRoom3D() {
    router.push({
      name: 'room3d',
      query: {
        productId: product.value?.id ?? '',
        roomType: product.value?.roomTypeHint ?? '',
      },
    })
  }

  function getDetailRoute(productId) {
    return productId ? `/products/${productId}` : null
  }

  return {
    breadcrumbLinks,
    openRoom3D,
    getDetailRoute,
  }
}
