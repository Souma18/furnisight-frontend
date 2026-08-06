import { test, expect } from '@playwright/test';

test.describe('EPIC 2: Discover & Experience - Storefront', () => {
  test('User can browse homepage and view banners', async ({ page }) => {
    await page.goto('/');
    
    // Check if hero banner or main categories are rendered
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('heading', { name: /danh mục/i })).toBeVisible();
  });

  test('User can search and filter products', async ({ page }) => {
    await page.goto('/products');
    
    // Search
    await page.getByPlaceholder(/tìm kiếm/i).fill('Sofa');
    await page.keyboard.press('Enter');
    
    // Wait for search result
    await expect(page.locator('.product-list, .grid')).toBeVisible();

    // Filter by category
    const filterBtn = page.getByRole('button', { name: /lọc/i });
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await page.getByLabel(/sofa/i).check();
      await page.getByRole('button', { name: /áp dụng/i }).click();
    }
  });

  test('User can view product details and select variants', async ({ page }) => {
    await page.goto('/products');
    
    // Click first product
    await page.locator('.product-card').first().click();
    await expect(page).toHaveURL(/.*products\/.+/);

    // Check title and price
    await expect(page.getByRole('heading').first()).toBeVisible();
    
    // Select color variant if exists
    const colorBtn = page.locator('.color-variant-selector').first();
    if (await colorBtn.isVisible()) {
      await colorBtn.click();
    }
    
    // Check Add to Cart button
    await expect(page.getByRole('button', { name: /thêm vào giỏ/i })).toBeVisible();
  });
});
