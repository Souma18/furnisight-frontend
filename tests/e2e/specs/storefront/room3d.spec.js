import { test, expect } from '@playwright/test';

test.describe('EPIC 2: Discover & Experience - Room 3D & AI Image', () => {
  test('User can open 3D room, interact, and trigger AI', async ({ page }) => {
    await page.goto('/room3d');

    // Wait for 3D Canvas
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 }); 

    // Interact with the 3D model
    const box = await canvas.boundingBox();
    if (box) {
      // Simulate clicking on an object in the room
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }

    // Trigger AI Image Reconstruction
    const aiButton = page.getByRole('button', { name: /tái tạo hình ảnh ai|render/i });
    if (await aiButton.isVisible()) {
      await aiButton.click();
      
      await expect(page.getByText(/đang xử lý/i)).toBeVisible();
      // Wait for result
      await expect(page.getByAltText(/kết quả ai/i)).toBeVisible({ timeout: 30000 });
    }
  });
});
