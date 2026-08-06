import { test, expect } from '@playwright/test';

test.describe('EPIC 3: Shopping - Checkout', () => {
  test.beforeEach(async ({ page }) => {
    // Add item to cart and go to checkout
    await page.goto('/products/1');
    await page.getByRole('button', { name: /thêm vào giỏ/i }).click();
    await page.goto('/cart');
    await page.getByRole('button', { name: /thanh toán/i }).click();
  });

  test('User can checkout using COD', async ({ page }) => {
    // Fill shipping address if required
    const addressInput = page.getByPlaceholder(/địa chỉ/i);
    if (await addressInput.isVisible()) {
      await addressInput.fill('123 Test Street');
      await page.getByPlaceholder(/số điện thoại/i).fill('0901234567');
    }

    await page.getByLabel(/thanh toán khi nhận hàng|cod/i).check();
    await page.getByRole('button', { name: /đặt hàng/i }).click();

    await expect(page).toHaveURL(/.*orders.*/);
    await expect(page.getByText(/thành công/i)).toBeVisible();
  });

  test('User can checkout using Online Payment', async ({ page }) => {
    await page.getByLabel(/thanh toán online|vnpay|momo/i).check();
    await page.getByRole('button', { name: /đặt hàng/i }).click();
    
    // System should redirect to a mock gateway or the real sandbox gateway
    // Just verify the URL changed away from our domain, or to a callback page
    await expect(page).not.toHaveURL(/.*checkout.*/);
  });
});
