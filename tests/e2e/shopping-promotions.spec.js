import { test, expect } from '@playwright/test';

test.describe('Advanced Flow: Promotions & Vouchers', () => {
  test('Apply combo discount and voucher during checkout', async ({ page }) => {
    // 1. Setup: User goes to a product page and adds to cart
    await page.goto('/products/1'); // Mock product URL
    await page.getByRole('button', { name: /thêm vào giỏ/i }).click();

    // 2. Add second product to satisfy a hypothetical "Buy 2 get 10% off" combo
    await page.goto('/products/2');
    await page.getByRole('button', { name: /thêm vào giỏ/i }).click();

    // 3. Go to cart
    await page.goto('/cart');

    // 4. Check for combo application
    // The combo discount should be visible in the cart summary
    await expect(page.getByText(/giảm giá combo/i)).toBeVisible();

    // 5. Proceed to checkout
    await page.getByRole('button', { name: /thanh toán/i }).click();

    // 6. Apply Voucher
    await page.getByPlaceholder(/nhập mã giảm giá/i).fill('DISCOUNT2026');
    await page.getByRole('button', { name: /áp dụng/i }).click();

    // Verify voucher applied successfully
    await expect(page.getByText(/áp dụng thành công/i)).toBeVisible();

    // 7. Verify Total is reduced
    // We assume the DOM has a specific total class, but we can just check if discount row exists
    await expect(page.getByText(/giảm giá voucher/i)).toBeVisible();

    // 8. Place order
    await page.getByRole('button', { name: /đặt hàng/i }).click();
    await expect(page.getByText(/đặt hàng thành công/i)).toBeVisible();
  });
});
