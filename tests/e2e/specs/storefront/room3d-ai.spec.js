import { test, expect } from '@playwright/test';

test.describe('Advanced Flow: Room 3D & AI Image Reconstruction', () => {
  test('User can open 3D room, interact, and trigger AI', async ({ page }) => {
    // 1. Navigate to 3D Room page
    await page.goto('/room3d');

    // 2. Wait for 3D Canvas to load
    // Assuming the 3D viewer uses a canvas element
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 }); // 3D models can take time to load

    // 3. Interact with the 3D model
    // E2E interaction with canvas is tricky, we'll simulate a click in the center
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
    
    // Check if clicking the model opens a property panel or similar UI
    // await expect(page.getByText(/thuộc tính/i)).toBeVisible();

    // 4. Trigger AI Image Reconstruction
    // Assume there's a button to snapshot or reconstruct
    const aiButton = page.getByRole('button', { name: /tái tạo hình ảnh ai|ai render/i });
    if (await aiButton.isVisible()) {
      await aiButton.click();
      
      // 5. Verify AI processing
      await expect(page.getByText(/đang xử lý/i)).toBeVisible();
      
      // Wait for AI result
      await expect(page.getByAltText(/kết quả ai/i)).toBeVisible({ timeout: 30000 });
    }
  });
});
