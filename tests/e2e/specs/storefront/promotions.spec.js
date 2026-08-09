import { test, expect } from '@playwright/test';

test.describe('EPIC 3: Shopping - Promotions', () => {
  test('User can view and save promotions', async ({ page }) => {
    await page.goto('/promotions');
    
    const saveVoucherBtn = page.getByRole('button', { name: /lưu mã/i }).first();
    if (await saveVoucherBtn.isVisible()) {
      await saveVoucherBtn.click();
      await expect(page.getByText(/đã lưu/i)).toBeVisible();
    }
  });

  test('System applies combo discount and voucher correctly', async ({ page }) => {
    // Add 2 items for combo
    await page.goto('/products/1');
    await page.getByRole('button', { name: /thêm vào giỏ/i }).click();
    await page.goto('/products/2');
    await page.getByRole('button', { name: /thêm vào giỏ/i }).click();

    await page.goto('/cart');
    
    // Check combo
    await expect(page.getByText(/combo/i)).toBeVisible();

    await page.getByRole('button', { name: /thanh toán/i }).click();

    // Apply Voucher
    await page.getByPlaceholder(/mã giảm giá/i).fill('TESTVOUCHER');
    await page.getByRole('button', { name: /áp dụng/i }).click();
    await expect(page.getByText(/thành công/i)).toBeVisible();
  });
});
