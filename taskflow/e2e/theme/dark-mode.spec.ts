// e2e/theme/dark-mode.spec.ts
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth';

test.describe('Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should toggle dark mode', async ({ page }) => {
    // Check initial theme
    const html = page.locator('html');
    const initialClass = await html.getAttribute('class');
    
    // Toggle theme
    await page.click('button[aria-label*="mode"]');
    
    // Wait for transition
    await page.waitForTimeout(300);
    
    // Check theme changed
    const newClass = await html.getAttribute('class');
    expect(newClass).not.toBe(initialClass);
  });

  test('should persist theme preference', async ({ page }) => {
    // Enable dark mode
    const themeToggle = page.locator('button[aria-label*="mode"]');
    await themeToggle.click();
    
    // Check dark mode applied
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
    
    // Reload page
    await page.reload();
    
    // Verify dark mode persists
    await expect(html).toHaveClass(/dark/);
  });

  test('should apply dark styles to all components', async ({ page }) => {
    await page.click('button[aria-label*="dark"]');
    
    // Check navbar
    const nav = page.locator('nav');
    await expect(nav).toHaveClass(/dark:bg-gray-800/);
    
    // Navigate to different pages and verify dark mode
    await page.click('text=Kanban');
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    await page.click('text=Tasks');
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
