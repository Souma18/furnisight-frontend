import { computed } from 'vue'

export function useProductTabs(productRef) {
  const reviewCountLabel = computed(() => productRef.value?.ratingCount ?? 0)
  const qaCountLabel = computed(() => productRef.value?.qa?.length ?? 0)

  const specsRows = computed(() => {
    const product = productRef.value
    if (!product) return []

    const v = product.variants?.[0] ?? null
    const rows = []

    if (v.material) rows.push({ key: 'Chất liệu chính', value: v.material });
    if (product.colors?.length) rows.push({ key: 'Màu sắc', value: product.colors.join(', ') });
    if (v.dimensionText) rows.push({ key: 'Kích thước', value: v.dimensionText });
    if (v.weight) rows.push({ key: 'Khối lượng', value: `${v.weight} kg` });
    if (v.warranty) rows.push({ key: 'Bảo hành', value: v.warranty });

    if (!rows.length && product.category?.label) {
      rows.push({ key: 'Danh mục', value: product.category.label })
    }

    if (!rows.length && product.collection) {
      rows.push({ key: 'Bộ sưu tập', value: product.collection })
    }

    if (!rows.length && typeof product.stock === 'number') {
      rows.push({ key: 'Tồn kho', value: `${product.stock} sản phẩm` })
    }

    return rows;
  })

  const reviewBars = computed(() => {
    const bars = [5, 4, 3, 2, 1].map(star => ({ star, count: 0, percent: 0 }));
    const reviews = productRef.value?.reviews || [];
    const total = reviews.length || productRef.value?.ratingCount || 0;
    if (!total || !reviews.length) return bars;
    
    reviews.forEach(r => {
      const star = Math.round(r.rating || 5);
      const bar = bars.find(b => b.star === star);
      if (bar) bar.count++;
    });
    
    bars.forEach(b => {
      b.percent = Math.round((b.count / total) * 100);
    });
    return bars;
  })

  function getStars(rating) {
    return '★'.repeat(Math.round(rating || 5)).padEnd(5, '☆')
  }

  return {
    reviewCountLabel,
    qaCountLabel,
    specsRows,
    reviewBars,
    getStars,
  }
}
