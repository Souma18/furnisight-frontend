function lineProductId(line = {}) {
  return String(line.productId || line.product?.id || line.id || '').trim()
}

function lineVariantId(line = {}) {
  return String(line.variantId || line.variant?.id || '').trim()
}

function lineQuantity(line = {}) {
  return Math.max(1, Number(line.qty ?? line.quantity) || 1)
}

function comboSupportsCheckout(combo = {}) {
  return combo.available !== false
}

export function comboMatchesLines(combo = {}, lines = []) {
  const requiredItems = Array.isArray(combo.items) ? combo.items : []
  if (!requiredItems.length || !comboSupportsCheckout(combo)) return false

  return requiredItems.every((item) => {
    const requiredProductId = String(item.productId || '').trim()
    const requiredVariantId = String(item.variantId || '').trim()
    const requiredQuantity = Math.max(1, Number(item.quantity) || 1)
    if (!requiredProductId) return false

    const matchingQuantity = lines
      .filter((line) => {
        if (lineProductId(line) !== requiredProductId) return false
        return !requiredVariantId || lineVariantId(line) === requiredVariantId
      })
      .reduce((sum, line) => sum + lineQuantity(line), 0)

    return matchingQuantity >= requiredQuantity
  })
}

export function comboValidateItems(lines = []) {
  return lines.map((line) => ({
    productId: lineProductId(line),
    variantId: lineVariantId(line) || null,
    quantity: lineQuantity(line),
    price: Number(line.price) || 0,
  }))
}
