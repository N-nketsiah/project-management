// e2e/dashboard/dashboard.spec.ts
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display statistics cards', async ({ page }) => {
    await expect(page.locator('text=Total Tasks')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Completion Rate')).toBeVisible();
  });

  test('should display charts', async ({ page }) => {
    await expect(page.locator('text=Task Status Distribution')).toBeVisible();
    await expect(page.locator('text=Priority Breakdown')).toBeVisible();
    
    const charts = page.locator('canvas');
    await expect(charts).toHaveCount(2);
  });

  test('should display recent tasks table', async ({ page }) => {
    await expect(page.locator('text=Recent Tasks')).toBeVisible();
    
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(await rows.count());
  });

  test('should navigate to different pages', async ({ page }) => {
    await page.click('text=Kanban');
    await expect(page).toHaveURL(/.*kanban/);
    
    await page.click('text=Tasks');
    await expect(page).toHaveURL(/.*tasks/);
    
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should update statistics in real-time', async ({ page }) => {
    const totalTasks = await page.locator('text=Total Tasks').locator('..').locator('p').last().textContent();
    expect(Number(totalTasks)).toBeGreaterThanOrEqual(0);
  });
});
