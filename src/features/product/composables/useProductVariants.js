export function useProductVariants({ product, selectedColor, selectedSize, qty, activeImage }) {
  function resolveSelectedVariant() {
    const variants = product.value?.variants ?? []
    if (!variants.length) return null

    return (
      variants.find((variant) => {
        const matchesColor = !selectedColor.value || variant.color === selectedColor.value
        const matchesSize = !selectedSize.value || variant.dimensionText === selectedSize.value
        return matchesColor && matchesSize
      }) ??
      variants.find((variant) => !selectedColor.value || variant.color === selectedColor.value) ??
      variants[0]
    )
  }

  function buildCartPayload() {
    const selectedVariant = resolveSelectedVariant()

    return {
      productId: product.value.id,
      detailId: product.value.slug || product.value.id,
      variantId: selectedVariant?.id ?? null,
      name: product.value.name,
      price: selectedVariant?.price ?? product.value.price ?? 0,
      imageUrl: activeImage.value || product.value.image || product.value.gallery?.[0] || '',
      quantity: qty.value,
      selectedColor: selectedColor.value,
      selectedSize: selectedSize.value,
      room3dProductId: product.value.room3dProductId ?? null,
    }
  }

  return {
    resolveSelectedVariant,
    buildCartPayload,
  }
}
