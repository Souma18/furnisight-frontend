import { computed, ref } from 'vue'

export function useRoom3DRightPanel(props) {
  const searchKeywordLower = computed(() =>
    (props.searchKeyword || "").trim().toLowerCase(),
  )

  const searchResults = computed(() => {
    if (!searchKeywordLower.value) return []
    return props.filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(searchKeywordLower.value),
    )
  })

  const subCategories = computed(() => {
    const groups = new Map()
    for (const product of props.filteredProducts) {
      const cat = product.categoryName || "Khác"
      if (!groups.has(cat)) groups.set(cat, [])
      groups.get(cat).push(product)
    }
    return Array.from(groups, ([name, items]) => ({ name, items }))
  })

  const openGroups = ref(["search", "all"])

  function toggleGroup(id) {
    if (openGroups.value.includes(id)) {
      openGroups.value = openGroups.value.filter((g) => g !== id)
    } else {
      openGroups.value.push(id)
    }
  }

  return {
    searchKeywordLower,
    searchResults,
    subCategories,
    openGroups,
    toggleGroup,
  }
}
