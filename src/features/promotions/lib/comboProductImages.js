import { productsApi } from '@shared/lib/api/services'

const comboProductImageCache = new Map()

export function imageLikeUrl(value) {
  return typeof value === 'string' && (/^https?:\/\//.test(value) || value.startsWith('/'))
}

export async function resolveComboProductImage(item = {}) {
  if (imageLikeUrl(item.imageUrl)) return item.imageUrl
  if (imageLikeUrl(item.image)) return item.image
  if (!item.productId) return ''

  if (!comboProductImageCache.has(item.productId)) {
    comboProductImageCache.set(item.productId, productsApi.getProductDetail(item.productId)
      .then(({ data }) => {
        const candidates = [
          ...(Array.isArray(data?.gallery) ? data.gallery : []),
          ...(Array.isArray(data?.images) ? data.images : []),
          data?.imageUrl,
          data?.image,
          data?.thumbnailUrl,
          data?.thumbnail,
        ]

        return candidates
          .map((image) => typeof image === 'string' ? image : image?.url || image?.imageUrl || '')
          .find(imageLikeUrl) || ''
      })
      .catch(() => ''))
  }

  return comboProductImageCache.get(item.productId)
}

export async function enrichComboItemImage(item = {}) {
  return {
    ...item,
    imageUrl: await resolveComboProductImage(item),
  }
}
