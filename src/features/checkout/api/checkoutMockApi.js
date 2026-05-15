import {
  CHECKOUT_COD_NOTE,
  CHECKOUT_INSURANCE,
  CHECKOUT_PAYMENT_METHODS,
  CHECKOUT_SHIPPING_OPTIONS,
  CHECKOUT_SHIPPING_VOUCHERS,
  CHECKOUT_SHOP_VOUCHERS,
} from '../mock/checkoutPageMockData'
import { calcShopDiscount } from '../utils/checkoutPricing'

function sleep(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function findVoucherByCode(code, type = 'shop') {
  const pool = type === 'ship' ? CHECKOUT_SHIPPING_VOUCHERS : CHECKOUT_SHOP_VOUCHERS
  return pool.find((item) => item.code.toUpperCase() === String(code).trim().toUpperCase()) ?? null
}

export async function fetchCheckoutSessionMock() {
  await sleep()
  return {
    data: {
      shippingOptions: CHECKOUT_SHIPPING_OPTIONS,
      paymentMethods: CHECKOUT_PAYMENT_METHODS,
      shopVouchers: CHECKOUT_SHOP_VOUCHERS,
      shippingVouchers: CHECKOUT_SHIPPING_VOUCHERS,
      insurance: CHECKOUT_INSURANCE,
      codNote: CHECKOUT_COD_NOTE,
      defaultShippingId: CHECKOUT_SHIPPING_OPTIONS[0]?.id ?? '',
      defaultPaymentId: 'cod',
      defaultShippingVoucherCode: 'FREESHIP50K',
    },
  }
}

export async function validateCheckoutVoucherMock({ code, type = 'shop', subtotal = 0 }) {
  await sleep(180)
  const voucher = findVoucherByCode(code, type)

  if (!voucher) {
    return {
      data: {
        valid: false,
        message: 'Mã không hợp lệ. Vui lòng kiểm tra lại.',
      },
    }
  }

  if (type === 'shop' && subtotal < (Number(voucher.minOrder) || 0)) {
    return {
      data: {
        valid: false,
        message: `Đơn tối thiểu ${Number(voucher.minOrder).toLocaleString('vi-VN')}đ để dùng mã này.`,
      },
    }
  }

  const discount =
    type === 'ship'
      ? Number(voucher.discountValue) || 0
      : calcShopDiscount(subtotal, voucher)

  return {
    data: {
      valid: true,
      voucher,
      discount,
    },
  }
}

export async function placeCheckoutOrderMock(payload) {
  await sleep(900)
  const orderCode = `#LX-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`

  return {
    data: {
      orderId: `order-${Date.now()}`,
      orderCode,
      status: 'pending',
      payload,
    },
  }
}
