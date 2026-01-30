// e2e/kanban/kanban.spec.ts
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth';

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/kanban');
  });

  test('should display all columns', async ({ page }) => {
    await expect(page.locator('text=To Do')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Review')).toBeVisible();
    await expect(page.locator('text=Done')).toBeVisible();
  });

  test('should display tasks in columns', async ({ page }) => {
    const columns = page.locator('.kanban-column');
    await expect(columns).toHaveCount(4);
    
    const taskCards = page.locator('.task-card');
    const cardCount = await taskCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should show task details', async ({ page }) => {
    const firstTask = page.locator('.task-card').first();
    await expect(firstTask.locator('h3')).toBeVisible();
    await expect(firstTask.locator('p')).toBeVisible();
  });

  test('should drag and drop tasks', async ({ page }) => {
    const sourceColumn = page.locator('.kanban-column').first();
    const targetColumn = page.locator('.kanban-column').nth(1);
    
    const taskCard = sourceColumn.locator('.task-card').first();
    const taskTitle = await taskCard.locator('h3').textContent();
    
    // Drag and drop
    await taskCard.dragTo(targetColumn);
    
    // Wait for animation
    await page.waitForTimeout(500);
    
    // Verify task moved
    await expect(targetColumn.locator(`text=${taskTitle}`)).toBeVisible();
  });

  test('should display task priority badges', async ({ page }) => {
    const taskCard = page.locator('.task-card').first();
    const priorityBadge = taskCard.locator('span').filter({ hasText: /low|medium|high|urgent/ });
    await expect(priorityBadge).toBeVisible();
  });
});
