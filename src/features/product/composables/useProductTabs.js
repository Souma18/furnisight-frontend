import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useProductTabs(productRef, activeVariantRef) {
  const { t } = useI18n()
  const reviewCountLabel = computed(() => productRef.value?.ratingCount ?? 0)

  const specsRows = computed(() => {
    const product = productRef.value
    if (!product) return []

    const variant = activeVariantRef?.value ?? product.variants?.[0] ?? null
    const rows = []

    if (variant?.material) rows.push({ key: t('productDetail.spec.keys.material'), value: variant.material })
    if (variant?.color) rows.push({ key: t('productDetail.spec.keys.color'), value: variant.color })
    if (variant?.dimensionText) rows.push({ key: t('productDetail.spec.keys.dimension'), value: variant.dimensionText })
    if (variant?.weight) rows.push({ key: t('productDetail.spec.keys.weight'), value: `${variant.weight} kg` })
    if (variant?.warranty) rows.push({ key: t('productDetail.spec.keys.warranty'), value: variant.warranty })
    if (typeof variant?.stockQuantity === 'number') rows.push({ key: t('productDetail.spec.keys.stock'), value: t('productDetail.spec.values.items', { count: variant.stockQuantity }) })

    if (!rows.length && product.category?.label) {
      rows.push({ key: t('productDetail.spec.keys.category'), value: product.category.label })
    }

    if (!rows.length && typeof product.stock === 'number') {
      rows.push({ key: t('productDetail.spec.keys.stock'), value: t('productDetail.spec.values.items', { count: product.stock }) })
    }

    const rawSpecs = variant?.specifications || product?.specifications
    if (rawSpecs && typeof rawSpecs === 'object') {
      // Handle the 'details' string format from seeded data
      if (typeof rawSpecs.details === 'string') {
        const lines = rawSpecs.details.split('\n')
        lines.forEach(line => {
          const parts = line.split(':')
          if (parts.length >= 2) {
            const name = parts[0].trim()
            const val = parts.slice(1).join(':').trim()
            if (name && val) {
              rows.push({ key: name, value: val })
            }
          }
        })
      }
      
      // Handle arbitrary key-value pairs
      Object.entries(rawSpecs).forEach(([k, v]) => {
        if (k !== 'details' && v) {
          rows.push({ key: k, value: String(v) })
        }
      })
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
