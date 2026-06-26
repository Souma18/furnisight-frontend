import { computed } from 'vue'

export function useProductTabs(productRef, activeVariantRef) {
  const reviewCountLabel = computed(() => productRef.value?.ratingCount ?? 0)

  const specsRows = computed(() => {
    const product = productRef.value
    if (!product) return []

    const variant = activeVariantRef?.value ?? product.variants?.[0] ?? null
    const rows = []

    if (variant?.material) rows.push({ key: 'Chất liệu chính', value: variant.material })
    if (variant?.color) rows.push({ key: 'Màu sắc', value: variant.color })
    if (variant?.dimensionText) rows.push({ key: 'Kích thước', value: variant.dimensionText })
    if (variant?.weight) rows.push({ key: 'Khối lượng', value: `${variant.weight} kg` })
    if (variant?.warranty) rows.push({ key: 'Bảo hành', value: variant.warranty })
    if (typeof variant?.stockQuantity === 'number') rows.push({ key: 'Tồn kho', value: `${variant.stockQuantity} sản phẩm` })

    if (!rows.length && product.category?.label) {
      rows.push({ key: 'Danh mục', value: product.category.label })
    }

    if (!rows.length && typeof product.stock === 'number') {
      rows.push({ key: 'Tồn kho', value: `${product.stock} sản phẩm` })
    }

    return rows
  })

  const reviewBars = computed(() => {
    const bars = [5, 4, 3, 2, 1].map((star) => ({ star, count: 0, percent: 0 }))
    const reviews = productRef.value?.reviews || []
    const total = reviews.length || productRef.value?.ratingCount || 0
    if (!total || !reviews.length) return bars

    reviews.forEach((review) => {
      const star = Math.round(review.rating || 5)
      const bar = bars.find((item) => item.star === star)
      if (bar) bar.count += 1
    })

    bars.forEach((bar) => {
      bar.percent = Math.round((bar.count / total) * 100)
    })

    return bars
  })

  return {
    reviewCountLabel,
    specsRows,
    reviewBars,
  }
}
