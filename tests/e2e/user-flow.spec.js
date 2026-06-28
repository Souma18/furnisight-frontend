import fs from 'fs'
import { test, expect } from '@playwright/test'
test.describe('User Flow E2E Tests', () => {
  // Config: Run tests sequentially to simulate a real user flow
  test.describe.configure({ mode: 'serial' })

  let page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()))
    page.on('request', req => {
      if (req.url().includes('/api/v1/orders/initiate') && req.method() === 'POST') {
        console.log('ORDER PAYLOAD:', req.postData())
      }
    })
    page.on('response', async res => {
      if (res.url().includes('/api/')) {
        console.log('API:', res.url(), res.status(), await res.text().catch(() => ''))
      }
    })
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('U1: User can login and view address', async () => {
    // Navigate to protected route to trigger auth modal
    await page.goto('/account')

    // Điền thông tin user01
    const authModal = page.locator('.mc-modal-overlay, .auth-page')
    await expect(authModal.first()).toBeVisible()
    
    // Nhập user01 từ seed data
    await authModal.locator('input[type="email"]').fill('22130080@st.hcmuaf.edu.vn')
    await authModal.locator('input[type="password"]').fill('Password123!')
    
    const loginBtn = authModal.locator('button[type="submit"]')
    await loginBtn.click()

    // Chờ đăng nhập thành công và đóng modal
    await expect(page.locator('.mc-modal-overlay')).not.toBeVisible({ timeout: 10000 })
    
    // Kiểm tra đã vào trang tài khoản
    await expect(page).toHaveURL(/.*\/account.*/)

    // Kiểm tra địa chỉ có sẵn: "12 Nguyễn Huệ"
    await expect(page.getByText('12 Nguyễn Huệ')).toBeVisible()
  })

  test('U2: User can experience Room3D and add to cart', async () => {
    await page.goto('/room3d')
    await expect(page).toHaveURL(/.*\/room3d.*/)

    // Chọn "Mẫu phòng"
    await page.getByText(/Phòng ở|Mẫu phòng/i).click()

    // Chọn Phòng khách
    const livingRoomBtn = page.getByText(/Phòng khách/i).first()
    await expect(livingRoomBtn).toBeVisible()
    await livingRoomBtn.click()

    // Chờ tải phòng
    await expect(page.locator('.canvas-shell')).toBeVisible()
    
    // Bên phải: Chọn sản phẩm (Tất cả hoặc Phòng khách)
    // Click mở accordion Tất cả nếu đóng
    const allGroup = page.locator('.product-group').filter({ hasText: 'Tất cả' })
    if (await allGroup.locator('.group-content').isHidden()) {
      await allGroup.locator('.group-header').click()
    }

    // Chọn sản phẩm đầu tiên có icon Thêm vào giỏ
    const productCard = allGroup.locator('.card').first()
    await expect(productCard).toBeVisible()
    
    // Bấm nút thêm vào giỏ
    const addToCartBtn = productCard.locator('.add-btn')
    await addToCartBtn.click()

    // Mở giỏ hàng thu gọn
    const cartToggleBtn = page.locator('.cart-toggle')
    await expect(cartToggleBtn).toBeVisible()
    await cartToggleBtn.click()

    // Xác nhận có sản phẩm trong giỏ
    await expect(page.locator('.cart-body .item')).toHaveCount(1)
  })

  test('U3: User can checkout via VNPay', async () => {
    // Tiếp tục từ U2, bấm Thanh toán
    const checkoutBtn = page.locator('.cart-body .checkout')
    await expect(checkoutBtn).toBeVisible()
    await checkoutBtn.click()

    await expect(page).toHaveURL(/.*\/checkout.*/)

    // Chọn địa chỉ mặc định (thường đã tự chọn nếu is_default=true)
    const defaultAddress = page.locator('.co-address-option.co-address-option--active')
    await expect(defaultAddress).toBeVisible()

    // Chọn phương thức vận chuyển
    const firstShipping = page.locator('.co-ship-option').first()
    if (await firstShipping.isVisible()) {
      await firstShipping.click()
    }

    // Chọn VNPay
    const vnpayLabel = page.locator('.co-pay-method', { hasText: /VNPay|VNPAY/i })
    await expect(vnpayLabel).toBeVisible()
    await vnpayLabel.click()

    // Intercept VNPay callback to redirect back to localhost instead of production
    await page.route('https://furnisight.store/orders/payment/callback**', async route => {
      const url = route.request().url()
      const newUrl = url.replace('https://furnisight.store', 'http://localhost:5173')
      await route.fulfill({
        status: 302,
        headers: { location: newUrl }
      })
    })

    // Đặt hàng
    const placeOrderBtn = page.getByRole('button', { name: /Đặt hàng/i })
    await placeOrderBtn.click()

    try {
      const errorToast = page.locator('.mo-toast')
      await errorToast.waitFor({ state: 'visible', timeout: 3000 })
      console.log('TOAST ERROR:', await errorToast.innerText())
    } catch (e) {
      // No toast appeared within 3s
    }

    // Redirect to VNPay
    await expect(page).toHaveURL(/.*vnpayment\.vn.*/, { timeout: 15000 })

    // Luồng VNPay
    await page.getByText(/Thẻ ATM và Tài khoản ngân hàng|Thẻ nội địa và tài khoản ngân hàng|Thẻ nội địa|ATM card|Local Bank|Domestic/i).first().click()

    const ncbBank = page.locator('button#NCB, .domestic-bank[search-value*="ncb"] button, img[src*="ncb"]').first()
    await ncbBank.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})
    await ncbBank.click()

    // Điền thông tin thẻ
    const cardNumberInput = page.locator('#card_number_mask, input[name="card_number"], [placeholder*="Số thẻ"], [placeholder*="Card number"]').first()
    await cardNumberInput.waitFor({ state: 'visible', timeout: 15000 })
    await cardNumberInput.fill('9704198526191432198')

    const cardNameInput = page.locator('#cardHolder, input[name="cardHolder"], [placeholder*="Tên chủ thẻ"], [placeholder*="Cardholder name"]').first()
    await cardNameInput.fill('NGUYEN VAN A')

    const cardDateInput = page.locator('#issueDate, input[name="issueDate"], [placeholder*="Ngày phát hành"], [placeholder*="MM/YY"], [placeholder*="Tháng/Năm"]').first()
    await cardDateInput.fill('07/15')

    // Bấm thanh toán (trên trang nhập thẻ)
    const nextBtn = page.locator('#btnSubmit, #btnContinue, button:has-text("Tiếp tục"), button:has-text("Xác thực"), a:has-text("Tiếp tục")').first()
    await nextBtn.click()

    // Handle VNPay Terms of Service popup if it appears
    const termsAgreeBtn = page.locator('[href="#cardVerify"], a:has-text("Đồng ý")').last()
    try {
      await termsAgreeBtn.waitFor({ state: 'visible', timeout: 5000 })
      await termsAgreeBtn.click()
    } catch (e) {
      // Ignore if popup doesn't appear
    }

    const otpInput = page.locator('input[placeholder*="OTP" i], input[name*="otp" i], input[id*="otp" i], input[type="password"]').first()
    await expect(otpInput).toBeVisible({ timeout: 15000 })
    await otpInput.fill('123456')
    
    const confirmBtn = page.getByRole('button', { name: /(Xác nhận|Thanh toán|Confirm|Pay)/i }).first()
    await confirmBtn.click()

    // Đợi redirect về trang chi tiết đơn hàng (hoặc trang callback báo thành công)
    await expect(page).toHaveURL(/.*(payment\/success|order-detail|payment\/callback).*/, { timeout: 15000 })
  })

  test('U4: User can track order status', async () => {
    await page.goto('/account?view=orders')
    
    // Xác nhận có đơn hàng trạng thái PENDING hoặc PAID
    const orderItem = page.locator('.order-card').first()
    await expect(orderItem).toBeVisible()
    
    // Mở chi tiết đơn hàng
    const detailBtn = orderItem.locator('.order-detail-btn')
    await detailBtn.click()
    
    // Kiểm tra có VNPay trong phương thức thanh toán không
    const paymentValue = page.locator('.payment-value')
    await expect(paymentValue).toContainText(/VNPay/i)
  })
})
