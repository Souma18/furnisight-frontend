import { buildCartLine, cloneCartLine } from '../utils/cartItemFactory'

function sleep(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let cartSeed = [
  buildCartLine({
    id: 'cart-1',
    detailId: 'nordic-sofa',
    name: 'Sofa Nordic 3 chỗ ngồi',
    qty: 1,
    price: 8500000,
    imageFallback: '🛋️',
    selectedColor: 'Be sáng',
    selectedSize: '2m1 × 95cm',
    outOfStock: true,
  }),
  buildCartLine({
    id: 'cart-2',
    detailId: 'ergonomic-chair',
    name: 'Ghế ergonomic ProFlex X1',
    qty: 2,
    price: 1200000,
    imageFallback: '🪑',
    selectedColor: 'Xám đá',
    selectedSize: 'Tiêu chuẩn',
  }),
  buildCartLine({
    id: 'cart-3',
    detailId: 'tea-table',
    name: 'Đèn treo trần Rattan Boho',
    qty: 1,
    price: 920000,
    imageFallback: '💡',
    selectedColor: 'Nâu gỗ',
    selectedSize: 'Ø60 × 45cm',
  }),
]

function cloneState() {
  return cartSeed.map(cloneCartLine)
}

function findIndexById(lineId) {
  return cartSeed.findIndex((item) => item.id === lineId)
}

export async function fetchCartMock() {
  await sleep()
  return {
    data: {
      items: cloneState(),
    },
  }
}

export async function addCartItemMock(productOrLine, options = {}) {
  await sleep()

  const nextLine = buildCartLine({
    ...productOrLine,
    qty: options.qty ?? productOrLine?.qty ?? 1,
    outOfStock: productOrLine?.outOfStock ?? false,
  })

  const existingIndex = cartSeed.findIndex((item) => item.productKey === nextLine.productKey)

  if (existingIndex >= 0) {
    const current = cartSeed[existingIndex]
    cartSeed[existingIndex] = {
      ...current,
      qty: current.qty + nextLine.qty,
      room3dProductId: current.room3dProductId ?? nextLine.room3dProductId,
    }
  } else {
    cartSeed = [...cartSeed, nextLine]
  }

  return {
    data: {
      items: cloneState(),
    },
  }
}

export async function updateCartItemMock(lineId, patch = {}) {
  await sleep()

  const index = findIndexById(lineId)
  if (index < 0) {
    return {
      data: {
        items: cloneState(),
      },
    }
  }

  const current = cartSeed[index]
  const nextColors = Array.isArray(patch.colors) ? [...patch.colors] : current.colors
  const nextSizes = Array.isArray(patch.sizes) ? [...patch.sizes] : current.sizes
  cartSeed[index] = {
    ...current,
    ...patch,
    qty: patch.qty != null ? Math.max(1, Number(patch.qty) || 1) : current.qty,
    colors: nextColors,
    sizes: nextSizes,
  }

  return {
    data: {
      items: cloneState(),
      item: cloneCartLine(cartSeed[index]),
    },
  }
}

export async function removeCartItemMock(lineId) {
  await sleep()
  cartSeed = cartSeed.filter((item) => item.id !== lineId)

  return {
    data: {
      items: cloneState(),
    },
  }
}

export async function clearCartMock() {
  await sleep()
  cartSeed = []

  return {
    data: {
      items: [],
    },
  }
}
