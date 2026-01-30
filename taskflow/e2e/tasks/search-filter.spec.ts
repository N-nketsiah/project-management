// e2e/tasks/search-filter.spec.ts
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth';

test.describe('Task Search and Filters', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/tasks');
  });

  test('should search tasks by title', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search tasks..."]');
    await searchInput.fill('Design');
    
    await page.waitForTimeout(500); // Wait for debounce
    
    const tasks = page.locator('.bg-white.dark\\:bg-gray-800');
    const firstTask = tasks.first();
    await expect(firstTask).toContainText('Design');
  });

  test('should filter by status', async ({ page }) => {
    const statusFilter = page.locator('label:has-text("Status")').locator('..').locator('select');
    await statusFilter.selectOption('done');
    
    await page.waitForTimeout(300);
    
    const tasks = page.locator('.bg-white.dark\\:bg-gray-800');
    const count = await tasks.count();
    
    for (let i = 0; i < count; i++) {
      await expect(tasks.nth(i)).toContainText('done');
    }
  });

  test('should filter by priority', async ({ page }) => {
    const priorityFilter = page.locator('label:has-text("Priority")').locator('..').locator('select');
    await priorityFilter.selectOption('high');
    
    await page.waitForTimeout(300);
    
    const tasks = page.locator('.bg-white.dark\\:bg-gray-800');
    const count = await tasks.count();
    
    for (let i = 0; i < count; i++) {
      await expect(tasks.nth(i)).toContainText('high');
    }
  });

  test('should show task count', async ({ page }) => {
    const taskCount = page.locator('text=/\\d+ task\\(s\\) found/');
    await expect(taskCount).toBeVisible();
  });

  test('should clear filters', async ({ page }) => {
    // Apply filters
    const statusFilter = page.locator('label:has-text("Status")').locator('..').locator('select');
    await statusFilter.selectOption('done');
    
    // Clear filters
    await page.click('text=Clear all');
    
    // Verify filters cleared
    const statusValue = await statusFilter.inputValue();
    expect(statusValue).toBe('');
  });

  test('should show no results message', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search tasks..."]');
    await searchInput.fill('NonexistentTask12345');
    
    await page.waitForTimeout(500);
    
    await expect(page.locator('text=No tasks found')).toBeVisible();
  });

  test('should combine multiple filters', async ({ page }) => {
    // Apply status filter
    const statusFilter = page.locator('label:has-text("Status")').locator('..').locator('select');
    await statusFilter.selectOption('in-progress');
    
    // Apply priority filter
    const priorityFilter = page.locator('label:has-text("Priority")').locator('..').locator('select');
    await priorityFilter.selectOption('high');
    
    await page.waitForTimeout(300);
    
    // Verify both filters applied
    const tasks = page.locator('.bg-white.dark\\:bg-gray-800');
    const firstTask = tasks.first();
    await expect(firstTask).toContainText('in-progress');
    await expect(firstTask).toContainText('high');
  });
});
