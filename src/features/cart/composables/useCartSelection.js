import { computed, ref, watch } from 'vue'
import { isPurchasableLine } from '../lib/stockGuards'

export function useCartSelection(items) {
  const checkedIds = ref([])

  const availableItems = computed(() => items.value.filter(isPurchasableLine))
  const availableItemIds = computed(() => availableItems.value.map((item) => item.id))
  const allAvailableChecked = computed(() =>
    availableItemIds.value.length > 0 &&
    availableItemIds.value.every((id) => checkedIds.value.includes(id)),
  )
  const partiallyChecked = computed(() =>
    checkedIds.value.some((id) => availableItemIds.value.includes(id)) && !allAvailableChecked.value,
  )
  const selectedItems = computed(() =>
    items.value.filter((item) => checkedIds.value.includes(item.id) && isPurchasableLine(item)),
  )
  const selectedCount = computed(() => selectedItems.value.length)
  const total = computed(() =>
    selectedItems.value.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0),
  )

  watch(
    items,
    (nextItems) => {
      const availableIds = nextItems.filter(isPurchasableLine).map((item) => item.id)
      checkedIds.value = checkedIds.value.filter((id) => availableIds.includes(id))
    },
    { deep: true },
  )

  function toggleChecked(itemId) {
    if (checkedIds.value.includes(itemId)) {
      checkedIds.value = checkedIds.value.filter((id) => id !== itemId)
      return
    }

    checkedIds.value = [...checkedIds.value, itemId]
  }

  function toggleAllChecked() {
    if (allAvailableChecked.value) {
      checkedIds.value = checkedIds.value.filter((id) => !availableItemIds.value.includes(id))
      return
    }

    checkedIds.value = [...new Set([...checkedIds.value, ...availableItemIds.value])]
  }

  function uncheck(itemId) {
    checkedIds.value = checkedIds.value.filter((id) => id !== itemId)
  }

  return {
    checkedIds,
    availableItems,
    availableItemIds,
    allAvailableChecked,
    partiallyChecked,
    selectedItems,
    selectedCount,
    total,
    toggleChecked,
    toggleAllChecked,
    uncheck,
  }
}
