import { PriceFormatter } from '@shared/lib/formatters'

export function formatCurrency(value) {
  return PriceFormatter.format(value)
}
