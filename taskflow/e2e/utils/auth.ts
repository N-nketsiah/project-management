// e2e/utils/auth.ts
import { Page } from '@playwright/test';
import { testUser } from '../fixtures/test-data';

export async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', testUser.email);
  await page.fill('input[type="password"]', testUser.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

export async function logout(page: Page) {
  await page.click('text=Logout');
  await page.waitForURL('**/login');
}
