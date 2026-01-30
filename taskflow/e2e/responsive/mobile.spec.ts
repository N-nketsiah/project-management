// e2e/responsive/mobile.spec.ts
import { test, expect, devices } from '@playwright/test';
import { login } from '../utils/auth';

test.describe('Mobile Responsiveness', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should display correctly on mobile', async ({ page }) => {
    await login(page);
    
    // Check viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThan(768);
    
    // Verify mobile layout
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate on mobile', async ({ page }) => {
    await login(page);
    
    await page.click('text=Kanban');
    await expect(page).toHaveURL(/.*kanban/);
    
    await page.click('text=Tasks');
    await expect(page).toHaveURL(/.*tasks/);
  });
});
