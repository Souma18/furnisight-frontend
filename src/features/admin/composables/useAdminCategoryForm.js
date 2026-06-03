/** Category form defaults & mapping for admin modals. */

export const CATEGORY_FORM_DEFAULTS = {
  name: '',
  slug: '',
  iconId: 'house',
  visible: true,
  description: '',
  imageUrl: '',
}

export function mapCategoryToForm(row) {
  if (!row) return { ...CATEGORY_FORM_DEFAULTS }
  return {
    name: row.name ?? '',
    slug: row.slug ?? '',
    iconId: row.iconId ?? 'house',
    visible: row.visible !== false,
    description: row.description ?? '',
    imageUrl: row.imageUrl ?? '',
  }
}

export function buildCategoryPayload(form) {
  return {
    name: form.name,
    slug: form.slug,
    iconId: form.iconId,
    visible: form.visible,
    description: form.description,
    imageUrl: form.imageUrl,
  }
}
