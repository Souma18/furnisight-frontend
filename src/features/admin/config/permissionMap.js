/**
 * Centralized permission display mapping.
 * Each key matches a permission ID from the backend.
 *
 * - label : Vietnamese display name
 * - icon  : Lucide icon name (used with <AppIcon>)
 * - css   : CSS modifier class applied to .perm-badge
 */
export const PERMISSION_MAP = {
  PRODUCT_MANAGE: {
    label: 'Quản lý sản phẩm',
    icon: 'package',
    css: 'perm--product',
  },
  ORDER_MANAGE: {
    label: 'Quản lý đơn hàng',
    icon: 'shopping-cart',
    css: 'perm--order',
  },
  VOUCHER_MANAGE: {
    label: 'Quản lý khuyến mãi',
    icon: 'ticket',
    css: 'perm--voucher',
  },
  ACCOUNT_MANAGE: {
    label: 'Quản lý tài khoản',
    icon: 'users',
    css: 'perm--account',
  },
  CUSTOMER_SUPPORT: {
    label: 'Chăm sóc khách hàng',
    icon: 'headphones',
    css: 'perm--support',
  },
}

/** Get display info for a permission key, with safe fallback. Case-insensitive. */
export function getPermission(key) {
  const normalized = String(key ?? '').toUpperCase()
  return (
    PERMISSION_MAP[normalized] ?? {
      label: key,
      icon: 'shield',
      css: 'perm--default',
    }
  )
}

/** Shortcut: get label */
export function getPermLabel(key) {
  return getPermission(key).label
}

/** Shortcut: get CSS class */
export function getPermClass(key) {
  return getPermission(key).css
}
