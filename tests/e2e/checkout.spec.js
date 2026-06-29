import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('User can checkout and pay via VNPay Sandbox', async ({ page }) => {
    // 1. Register a new user
    await page.goto('/')
    const accountBtn = page.getByRole('button', { name: 'Tài khoản', exact: true })
    await accountBtn.click()
    
    const authModal = page.locator('.mc-modal-overlay')
    await expect(authModal).toBeVisible()
    
    const toggleBtn = authModal.getByRole('button', { name: 'Đăng ký', exact: true }).first()
    await toggleBtn.click()

    const registerSubmitBtn = authModal.locator('button[type="submit"]')
    const randomEmail = `testuser_${Date.now()}@example.com`

    await authModal.getByPlaceholder('Họ và tên').fill('Playwright Tester')
    await authModal.getByPlaceholder('Email').fill(randomEmail)
    await authModal.getByPlaceholder('Mật khẩu').fill('Password123!')
    await authModal.getByPlaceholder('Nhập lại mật khẩu').fill('Password123!')

    await registerSubmitBtn.click()
    await expect(authModal).not.toBeVisible()

    await page.waitForTimeout(1000)

    // 2. Go to products and add to cart
    await page.getByRole('link', { name: 'Sản phẩm', exact: true }).first().click()
    
    await expect(page.locator('.product-card').first()).toBeVisible()
    await page.locator('.product-card').first().click()

    const addToCartBtn = page.getByRole('button', { name: /Thêm vào giỏ/i }).first()
    await expect(addToCartBtn).toBeVisible()
    await addToCartBtn.click()

    await page.waitForTimeout(1000)

    // 3. Open cart and Checkout
    const cartBtn = page.getByRole('button', { name: /Giỏ hàng/i })
    await cartBtn.click()
    
    const cartCheckoutBtn = page.getByRole('button', { name: /Thanh toán/i })
    await expect(cartCheckoutBtn).toBeVisible()
    await cartCheckoutBtn.click()

    await expect(page).toHaveURL(/.*checkout/)

    // 4. Fill Address if required
    const addAddressBtn = page.getByRole('button', { name: 'Thêm địa chỉ' })
    if (await addAddressBtn.isVisible()) {
      await addAddressBtn.click()
      await expect(page.locator('.co-address-modal')).toBeVisible()
      
      await page.getByPlaceholder('Nguyễn Văn A').fill('Playwright Tester')
      await page.getByPlaceholder('0123456789').fill('0987654321')
      
      const provinceSelect = page.locator('.co-address-form select').nth(0)
      await provinceSelect.selectOption({ index: 1 })
      
      const wardSelect = page.locator('.co-address-form select').nth(1)
      await wardSelect.selectOption({ index: 1 })
      
      await page.getByPlaceholder('Số nhà, tên đường...').fill('123 Test Street')
      
      await page.getByRole('button', { name: 'Lưu địa chỉ' }).click()
      await expect(page.locator('.co-address-modal')).not.toBeVisible()
    }

    // 5. Select VNPay
    const vnpayLabel = page.locator('.co-pay-method', { hasText: /VNPay|VNPAY/i })
    await expect(vnpayLabel).toBeVisible()
    await vnpayLabel.click()

    // Check Terms if required
    const termsCheck = page.locator('input[type="checkbox"]#checkout-terms')
    if (await termsCheck.isVisible()) {
        await termsCheck.check()
    }

    // 6. Place order
    const placeOrderBtn = page.getByRole('button', { name: /Đặt hàng/i })
    await placeOrderBtn.click()

    // 7. VNPay Sandbox Flow
    await expect(page).toHaveURL(/.*vnpayment\.vn.*/, { timeout: 15000 })

    await page.getByText('Thẻ ATM và Tài khoản ngân hàng', { exact: false }).click()

    const ncbLogo = page.locator('img[alt="NCB"], img[title="NCB"]').first()
    if (await ncbLogo.isVisible()) {
      await ncbLogo.click()
    } else {
      await page.getByText('NCB').click()
    }

    await page.getByPlaceholder('Số thẻ').fill('9704198526191432198')
    await page.getByPlaceholder('Tên chủ thẻ').fill('NGUYEN VAN A')
    await page.getByPlaceholder('MM/YY').fill('07/15')

    const nextBtn = page.getByRole('button', { name: /(Tiếp tục|Xác thực|Thanh toán)/i }).first()
    await nextBtn.click()

    const otpInput = page.getByPlaceholder(/OTP/i)
    await expect(otpInput).toBeVisible({ timeout: 10000 })
    await otpInput.fill('123456')
    
    const confirmBtn = page.getByRole('button', { name: /(Xác nhận|Thanh toán)/i }).first()
    await confirmBtn.click()

    // 8. Redirect back to success page
    await expect(page).toHaveURL(/.*\/payment\/success.*/, { timeout: 15000 })
    
  })
})
