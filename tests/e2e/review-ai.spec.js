import { test, expect } from '@playwright/test';

test.describe('Advanced Flow: Reviews & AI Sentiment', () => {
  test('User can submit a review and view AI sentiment', async ({ page }) => {
    // 1. Navigate to Order History
    await page.goto('/profile/orders'); // Mock route

    // 2. Select an order to review
    // Assume there is a button 'Đánh giá' for delivered orders
    const reviewBtn = page.getByRole('button', { name: /đánh giá/i }).first();
    if (await reviewBtn.isVisible()) {
      await reviewBtn.click();
      
      // 3. Fill the review form
      await page.getByRole('button', { name: /5 sao/i }).click(); // Select 5 stars
      await page.getByPlaceholder(/nhập đánh giá của bạn/i).fill('Sản phẩm rất đẹp và chất lượng, cực kỳ ưng ý!');
      
      // Submit review
      await page.getByRole('button', { name: /gửi đánh giá/i }).click();
      
      // Wait for success message
      await expect(page.getByText(/cảm ơn bạn đã đánh giá/i)).toBeVisible();
      
      // 4. Verify AI Sentiment on product page
      // Navigate to the product page that was just reviewed
      await page.goto('/products/1'); // Mock
      await page.getByRole('tab', { name: /đánh giá/i }).click();
      
      // Check if the review appears
      await expect(page.getByText(/sản phẩm rất đẹp/i)).toBeVisible();
      
      // Check for AI sentiment tag (e.g., Tích cực / Positive)
      await expect(page.getByText(/tích cực/i)).toBeVisible();
    }
  });
});
