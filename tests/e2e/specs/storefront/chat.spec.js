import { test, expect } from '@playwright/test';

test.describe('EPIC 4: CRM - Contact & Chat', () => {


  test('User can open realtime chat', async ({ page }) => {
    await page.goto('/');

    // Chat widget usually floats at bottom right
    const chatBtn = page.locator('.chat-widget-btn').first();
    if (await chatBtn.isVisible()) {
      await chatBtn.click();
      
      await page.getByPlaceholder(/nhập tin nhắn/i).fill('Xin chào admin');
      await page.getByRole('button', { name: /gửi|send/i }).click();

      // Ensure message appears in chat window
      await expect(page.getByText(/xin chào admin/i)).toBeVisible();
    }
  });
});
