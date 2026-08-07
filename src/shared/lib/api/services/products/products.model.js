import { PriceFormatter } from '@shared/lib/formatters'

export class ProductResponse {
  /**
   * @param {Object} data
   */
  constructor(data = {}) {
    const variants = normalizeVariants(data)
    const gallery = normalizeGallery(data)
    const primaryVariant = variants[0] ?? null

    this.id = data.id || null
    this.shopId = data.shopId || null
    this.slug = data.slug || ''
    this.name = resolveLocalizedValue(data, 'name')
    this.description = resolveLocalizedValue(data, 'description')
    this.status = data.status || ''
    this.price = resolvePrice(data, primaryVariant)
    this.categoryId = data.categoryId || data.category?.id || null
    this.categoryName = resolveLocalizedValue(data, 'categoryName')
      || resolveLocalizedValue(data.category, 'name', ['label'])
    this.category = data.category ? new CategoryResponse(data.category) : null
    this.categoryTrail = normalizeCategoryTrail(data.categoryTrail, data.category)
    this.breadcrumb = normalizeBreadcrumb(data.breadcrumb)
    this.images = Array.isArray(data.images) ? data.images : []
    this.gallery = gallery
    this.image = data.image || data.imageUrl || gallery[0] || ''
    this.stockQuantity = data.stockQuantity ?? data.stock ?? primaryVariant?.stockQuantity ?? 0
    this.outOfStock = data.outOfStock != null
      ? Boolean(data.outOfStock)
      : (variants.length ? variants.every((variant) => Number(variant.stockQuantity || 0) <= 0) : Number(this.stockQuantity || 0) <= 0)
    this.attributes = Array.isArray(data.attributes) ? data.attributes : []
    this.tags = Array.isArray(data.tags) ? data.tags : []
    this.rating = data.rating ?? 0
    this.ratingCount = data.ratingCount ?? 0
    this.soldCount = data.soldCount ?? data.soldQuantity ?? data.sold ?? 0
    this.supports3d = Boolean(data.supports3d)
    this.features = normalizeLocalizedArray(data, 'features')
    this.specifications = (() => {
      if (typeof data.specifications === 'object' && data.specifications) return data.specifications
      if (typeof data.specifications === 'string' && data.specifications.trim()) {
        try { return JSON.parse(data.specifications) } catch (err) {}
      }
      return {}
    })()
    this.modelUrl = data.modelUrl || ''
    this.roomTypeHint = resolveLocalizedValue(data, 'roomTypeHint')
    this.reviews = Array.isArray(data.reviews)
      ? data.reviews.map((review) => new ReviewResponse(review))
      : []
    this.variants = variants
    this.fallbackColor = resolveLocalizedValue(data, 'color') || primaryVariant?.color || ''
    this.fallbackMaterial = resolveLocalizedValue(data, 'material') || primaryVariant?.material || ''
    this.fallbackWarranty = resolveLocalizedValue(data, 'warranty') || primaryVariant?.warranty || ''
    this.fallbackStock = data.stockQuantity ?? data.stock ?? primaryVariant?.stockQuantity ?? 0
    // Product-level dimensions (used as fallback when variant has no dims)
    this.length = data.length ?? data.dimensions?.length ?? null
    this.width = data.width ?? data.dimensions?.width ?? null
    this.height = data.height ?? data.dimensions?.height ?? null
    this.weight = data.weight ?? data.dimensions?.weight ?? null
  }

  get colors() {
    const colors = [...new Set(this.variants.map((variant) => variant.color).filter(Boolean))]
    if (colors.length) return colors
    return this.fallbackColor ? [this.fallbackColor] : []
  }

  get materials() {
    const materials = [...new Set(this.variants.map((variant) => variant.material).filter(Boolean))]
    if (materials.length) return materials
    return this.fallbackMaterial ? [this.fallbackMaterial] : []
  }

  get sizes() {
    return [...new Set(this.variants.map((variant) => variant.dimensionText).filter(Boolean))]
  }

  get stock() {
    const variantStock = this.variants.reduce((total, variant) => total + (variant.stockQuantity || 0), 0)
    return variantStock > 0 ? variantStock : this.fallbackStock || 0
  }

  get formattedPrice() {
    return formatVnd(this.price)
  }
}

export class CategoryResponse {
  /**
   * @param {Object} data
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.slug = data.slug || ''
    this.name = resolveLocalizedValue(data, 'name', ['label'])
    this.label = resolveLocalizedValue(data, 'label', ['name']) || this.name
    this.parentId = data.parentId || null
    this.path = data.path || ''
    this.parentLabel = resolveLocalizedValue(data, 'parentLabel', ['parentName'])
    this.productCount = data.productCount ?? 0
    this.roomTypeId = data.roomTypeId || null
    this.imageUrl = data.imageUrl || data.image || ''
    this.iconUrl = data.iconUrl || ''
  }
}

export class RoomTypeResponse {
  /**
   * @param {Object} data
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.slug = data.slug || ''
    this.name = resolveLocalizedValue(data, 'name', ['label'])
    this.label = resolveLocalizedValue(data, 'label', ['name']) || this.name
    this.description = resolveLocalizedValue(data, 'description')
    this.productCount = data.productCount ?? 0
    this.imageUrl = data.imageUrl || data.image || ''
    this.visible = data.visible !== false
  }
}

export class ReviewResponse {
  /**
   * @param {Object} data
   */
  constructor(data = {}) {
    this.id = data.id || null
    this.productId = data.productId || null
    this.orderItemId = data.orderItemId || null
    this.userId = data.userId || null
    this.userName = data.userName || data.user || 'Khách hàng'
    this.user = data.user || data.userName || 'Khách hàng'
    this.userAvatar = data.userAvatarUrl || data.userAvatar || data.avatar || ''
    this.avatar = data.avatar || data.userAvatarUrl || data.userAvatar || ''
    this.rating = data.rating ?? 5
    this.title = data.title || ''
    this.content = data.content || data.comment || ''
    this.comment = data.comment || data.content || ''
    this.images = Array.isArray(data.images) ? data.images : []
    this.createdAt = data.createdAt || null
    this.createdAtFormatted = formatReviewDateTime(this.createdAt)
  }
}

export class ProductVariantResponse {
  /**
   * @param {Object} data
   * @param {Object} parentData
   */
  constructor(data = {}, parentData = {}) {
    this.id = data.id || null
    this.price = data.price ?? parentData.price ?? 0
    this.stockQuantity = data.stockQuantity ?? 0
    this.length = data.length || data.dimensions?.length || parentData.length || parentData.dimensions?.length || null
    this.width = data.width || data.dimensions?.width || parentData.width || parentData.dimensions?.width || null
    this.height = data.height || data.dimensions?.height || parentData.height || parentData.dimensions?.height || null
    this.weight = data.weight || data.dimensions?.weight || parentData.weight || parentData.dimensions?.weight || null
    this.material = resolveLocalizedValue(data, 'material') || resolveLocalizedValue(parentData, 'material')
    this.color = resolveLocalizedValue(data, 'color') || resolveLocalizedValue(parentData, 'color')
    this.warranty = resolveLocalizedValue(data, 'warranty') || resolveLocalizedValue(parentData, 'warranty')
    this.supports3d = Boolean(data.supports3d ?? parentData.supports3d)
    this.specifications = (() => {
      if (typeof data.specifications === 'object' && data.specifications) return data.specifications
      if (typeof data.specifications === 'string' && data.specifications.trim()) {
        try { return JSON.parse(data.specifications) } catch (err) {}
      }
      if (typeof parentData.specifications === 'object' && parentData.specifications) return parentData.specifications
      if (typeof parentData.specifications === 'string' && parentData.specifications.trim()) {
        try { return JSON.parse(parentData.specifications) } catch (err) {}
      }
      return {}
    })()
    this.modelUrl = data.modelUrl || ''
    this.imageUrls = normalizeGallery(data)
    this.image = this.imageUrls[0] || ''
  }

  get dimensionText() {
    if (!this.length || !this.width || !this.height) return ''
    return `${this.length} × ${this.width} × ${this.height} cm`
  }
}

export function formatVnd(value) {
  return PriceFormatter.format(value)
}

export function formatReviewDateTime(value) {
  if (!value) return ''
  const normalized = String(value).trim()
  const date = new Date(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized) ? normalized : `${normalized}Z`)
  if (Number.isNaN(date.getTime())) return normalized

  const pad = (number) => String(number).padStart(2, '0')
  return [
    pad(date.getDate()),
    pad(date.getMonth() + 1),
    date.getFullYear(),
  ].join('/') + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function buildCategoryTrail(category) {
  if (!category || typeof category !== 'object') return []

  const currentLabel = resolveLocalizedValue(category, 'label', ['name'])
  const currentSlug = category.slug || category.id || ''
  const parentLabel = resolveLocalizedValue(category, 'parentLabel', ['parentName'])
  const parentSlug = category.parentSlug || category.parentId || ''

  if (parentLabel) {
    return [
      { label: parentLabel, slug: parentSlug },
      { label: currentLabel, slug: currentSlug },
    ].filter((item) => item.label)
  }

  return []
}

function normalizeVariants(data = {}) {
  if (Array.isArray(data.variants) && data.variants.length) {
    return data.variants.map((variant) => new ProductVariantResponse(variant, data))
  }

  const fallbackVariant = {
    id: data.variantId ?? data.defaultVariantId ?? null,
    price: data.price ?? 0,
    stockQuantity: data.stockQuantity ?? data.stock ?? 0,
    length: data.length ?? data.dimensions?.length ?? null,
    width: data.width ?? data.dimensions?.width ?? null,
    height: data.height ?? data.dimensions?.height ?? null,
    weight: data.weight ?? data.dimensions?.weight ?? null,
    material: resolveLocalizedValue(data, 'material'),
    color: resolveLocalizedValue(data, 'color'),
    warranty: resolveLocalizedValue(data, 'warranty'),
    supports3d: data.supports3d,
    modelUrl: data.modelUrl,
    imageUrls: normalizeGallery(data),
  }

  const hasFallbackVariant = Object.values(fallbackVariant).some((value) => {
    if (value == null) return false
    if (typeof value === 'string') return value.trim() !== ''
    return true
  })

  return hasFallbackVariant ? [new ProductVariantResponse(fallbackVariant, data)] : []
}

function normalizeGallery(data = {}) {
  const imageCandidates = []

  if (Array.isArray(data.imageUrls)) {
    imageCandidates.push(...data.imageUrls)
  }

  if (Array.isArray(data.image_urls)) {
    imageCandidates.push(...data.image_urls)
  }

  if (Array.isArray(data.gallery)) {
    imageCandidates.push(...data.gallery)
  }

  if (Array.isArray(data.images)) {
    imageCandidates.push(...data.images.map((item) => {
      if (typeof item === 'string') return item
      return item?.url || item?.imageUrl || item?.src || ''
    }))
  }

  imageCandidates.push(
    data.image,
    data.imageUrl,
  )

  return [...new Set(imageCandidates.filter(Boolean))]
}

function resolvePrice(data = {}, primaryVariant = null) {
  if (typeof data.price === 'number' && data.price > 0) return data.price
  if (typeof primaryVariant?.price === 'number' && primaryVariant.price > 0) return primaryVariant.price
  return data.price ?? primaryVariant?.price ?? 0
}

const LOCALE_STORAGE_KEY = 'furnisight:locale'
const SUPPORTED_LOCALES = ['vi', 'en']

function getCurrentLocale() {
  if (typeof window === 'undefined') return 'vi'
  return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY))
}

function normalizeLocale(value) {
  return SUPPORTED_LOCALES.includes(value) ? value : 'vi'
}

function localeSuffix(locale = getCurrentLocale()) {
  return locale === 'en' ? 'En' : 'Vi'
}

function localizedKeyCandidates(baseKey, locale = getCurrentLocale()) {
  const suffix = localeSuffix(locale)
  return [
    `${baseKey}${suffix}`,
    `${baseKey}_${locale}`,
    `${baseKey}${locale.toUpperCase()}`,
  ]
}

function isPresent(value) {
  if (value == null) return false
  if (typeof value === 'string') return value.trim() !== ''
  return true
}

function firstPresent(...values) {
  return values.find(isPresent)
}

function readLocalizedTranslation(data = {}, baseKey, locale = getCurrentLocale()) {
  const translations = data.translations
  if (!translations) return undefined

  if (Array.isArray(translations)) {
    const match = translations.find((item) => normalizeLocale(item?.locale || item?.language) === locale)
    return match ? firstPresent(match[baseKey], ...localizedKeyCandidates(baseKey, locale).map((key) => match[key])) : undefined
  }

  const localeGroup = translations[locale]
  if (localeGroup && typeof localeGroup === 'object') {
    return firstPresent(localeGroup[baseKey], ...localizedKeyCandidates(baseKey, locale).map((key) => localeGroup[key]))
  }

  return firstPresent(translations[baseKey], ...localizedKeyCandidates(baseKey, locale).map((key) => translations[key]))
}

function resolveLocalizedValue(data = {}, baseKey, fallbackKeys = []) {
  if (!data || typeof data !== 'object') return ''

  const locale = getCurrentLocale()
  const directLocalized = firstPresent(...localizedKeyCandidates(baseKey, locale).map((key) => data[key]))
  const translated = readLocalizedTranslation(data, baseKey, locale)
  const fallbackValues = fallbackKeys.map((key) => data[key])

  return firstPresent(
    directLocalized,
    translated,
    data[baseKey],
    ...fallbackValues,
    '',
  )
}

function normalizeLocalizedArray(data = {}, baseKey) {
  const value = resolveLocalizedValue(data, baseKey)
  if (Array.isArray(value)) return value
  return Array.isArray(data[baseKey]) ? data[baseKey] : []
}

function normalizeBreadcrumb(items = []) {
  if (!Array.isArray(items)) return []
  return items.map((item) => {
    if (!item || typeof item !== 'object') return item
    return {
      ...item,
      label: resolveLocalizedValue(item, 'label', ['name', 'title']),
      name: resolveLocalizedValue(item, 'name', ['label', 'title']),
    }
  })
}

function normalizeCategoryTrail(items = [], fallbackCategory = null) {
  if (!Array.isArray(items) || !items.length) return buildCategoryTrail(fallbackCategory)
  return items.map((item) => {
    if (!item || typeof item !== 'object') return item

    return {
      ...item,
      label: resolveLocalizedValue(item, 'label', ['name']),
      name: resolveLocalizedValue(item, 'name', ['label']),
    }
  })
}
