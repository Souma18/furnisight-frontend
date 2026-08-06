import { test, expect } from '@playwright/test';

test.describe('EPIC 3: Shopping - Cart & Wishlist', () => {
  test('User can manage wishlist', async ({ page }) => {
    await page.goto('/products');
    
    // Add to wishlist
    const heartBtn = page.locator('.wishlist-btn, .heart-icon').first();
    if (await heartBtn.isVisible()) {
      await heartBtn.click();
      await expect(page.getByText(/đã thêm vào yêu thích/i)).toBeVisible();
    }

    // View wishlist
    await page.goto('/profile/wishlist');
    await expect(page.locator('.product-card')).toBeVisible();
  });

  test('User can manage cart items', async ({ page }) => {
    await page.goto('/products/1'); // Mock product
    await page.getByRole('button', { name: /thêm vào giỏ/i }).click();

    await page.goto('/cart');
    
    // Increase quantity
    await page.getByRole('button', { name: /\+/i }).first().click();
    
    // Delete item
    await page.getByRole('button', { name: /xóa/i }).first().click();
    
    await expect(page.getByText(/giỏ hàng trống/i)).toBeVisible();
  });
});
