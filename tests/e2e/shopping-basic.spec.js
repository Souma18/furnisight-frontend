import { test, expect } from '@playwright/test';

test.describe('Standard Shopping Flow', () => {
  test('User can browse, search, and checkout', async ({ page }) => {
    // 1. View Homepage & Search
    await page.goto('/');
    
    // Fill search bar and press enter
    await page.getByPlaceholder(/tìm kiếm/i).fill('sofa');
    await page.keyboard.press('Enter');
    
    // Verify search results page
    await expect(page).toHaveURL(/.*search.*/);
    
    // 2. View Product Detail
    // Click on the first product card
    const firstProduct = page.locator('.product-card').first();
    // Fallback if no .product-card class
    if (await firstProduct.isHidden()) {
      await page.getByRole('img', { name: /sản phẩm/i }).first().click();
    } else {
      await firstProduct.click();
    }
    
    // Check product detail elements
    await expect(page.getByRole('button', { name: /thêm vào giỏ/i })).toBeVisible();

    // 3. Add to Cart
    await page.getByRole('button', { name: /thêm vào giỏ/i }).click();
    // System might show a toast or slide-over
    await expect(page.getByText(/thành công/i)).toBeVisible();

    // 4. Go to Cart
    await page.goto('/cart'); // or click cart icon
    
    // Verify item in cart
    await expect(page.getByRole('button', { name: /thanh toán/i })).toBeVisible();
    await page.getByRole('button', { name: /thanh toán/i }).click();

    // 5. Checkout
    await expect(page).toHaveURL(/.*checkout.*/);
    
    // Fill checkout details (assuming user is guest or missing details)
    const nameInput = page.getByPlaceholder(/tên/i);
    if (await nameInput.isVisible()) {
      await nameInput.fill('Nguyen Van A');
      await page.getByPlaceholder(/số điện thoại/i).fill('0901234567');
      await page.getByPlaceholder(/địa chỉ/i).fill('123 Duong ABC, Quan 1, TP HCM');
    }

    // Select COD payment method
    await page.getByLabel(/thanh toán khi nhận hàng/i).check();

    // Place order
    await page.getByRole('button', { name: /đặt hàng/i }).click();

    // 6. Verify success
    await expect(page.getByText(/đặt hàng thành công/i)).toBeVisible();
  });
});
