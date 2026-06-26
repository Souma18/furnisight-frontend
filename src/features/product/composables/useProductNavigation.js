import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@features/auth/store/authStore'
import { openAuthModal } from '@features/auth/lib/authModalBus'

export function useProductNavigation({ product }) {
  const router = useRouter()
  const authStore = useAuthStore()
  const breadcrumbLinks = ref([])

  watch(product, (p) => {
    if (!p) { breadcrumbLinks.value = []; return }
    const categoryTrail = Array.isArray(p.categoryTrail) ? p.categoryTrail : []
    const fallbackCategory = p.categoryName
      ? [{ label: p.categoryName, slug: p.category?.id || p.categoryId || '' }]
      : []
    const trail = categoryTrail.length ? categoryTrail : fallbackCategory

    breadcrumbLinks.value = [
      { label: 'Trang chủ', to: { name: 'home' } },
      ...dedupeTrail(trail).map((crumb) => ({
        label: crumb.label ?? crumb.name ?? crumb,
        to: { name: 'products', query: { category: crumb.slug || crumb.id || crumb.label || crumb } },
      })),
    ]
  })

  function openRoom3D() {
    if (!authStore.isAuthenticated) {
      openAuthModal('login')
      return
    }

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

function dedupeTrail(trail) {
  const seen = new Set()
  return trail.filter((crumb) => {
    const label = String(crumb?.label ?? crumb?.name ?? crumb ?? '').trim()
    if (!label) return false
    const key = label.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
