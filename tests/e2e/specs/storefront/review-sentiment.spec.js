import { test, expect } from '@playwright/test';

test.describe('EPIC 2: Discover & Experience - Review & AI Sentiment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('user@example.com');
    await page.getByPlaceholder(/mật khẩu/i).fill('Password123!');
    await page.getByRole('button', { name: /đăng nhập/i }).click();
  });

  test('User can submit a review and view AI sentiment', async ({ page }) => {
    await page.goto('/profile/orders');

    // Click rate button on delivered order
    const reviewBtn = page.getByRole('button', { name: /đánh giá/i }).first();
    if (await reviewBtn.isVisible()) {
      await reviewBtn.click();
      
      // Submit review
      await page.getByRole('button', { name: /5 sao/i }).click();
      await page.getByPlaceholder(/nhập đánh giá/i).fill('Sản phẩm rất đẹp và chất lượng, cực kỳ ưng ý!');
      await page.getByRole('button', { name: /gửi đánh giá/i }).click();
      
      await expect(page.getByText(/thành công/i)).toBeVisible();
      
      // Verify AI Sentiment on product page
      await page.goto('/products/1'); // Navigate to the mock product
      await page.getByRole('tab', { name: /đánh giá/i }).click();
      
      await expect(page.getByText(/sản phẩm rất đẹp/i)).toBeVisible();
      await expect(page.getByText(/tích cực/i)).toBeVisible(); // AI Sentiment Tag
    }
  });
});
