import { Page } from '@playwright/test';

/**
 * Common test helpers and utilities
 */

/**
 * Login as admin user
 * Uses seeded test account: admin@nhatro.vn / Admin@123
 */
export async function loginAsAdmin(page: Page): Promise<void> {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill email
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('admin@nhatro.vn');

    // Fill password
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('Admin@123');

    // Click login button
    const loginButton = page.getByRole('button', { name: /đăng nhập/i });
    await loginButton.click();

    // Wait for navigation
    try {
        await page.waitForURL(/admin|dashboard|\/$/i, { timeout: 15000 });
    } catch {
        // If no redirect, check if we're logged in by looking for admin indicator
        const isLoggedIn = await page.locator('[class*="avatar"], [class*="user"]').first().isVisible().catch(() => false);
        if (!isLoggedIn) {
            throw new Error('Login failed');
        }
    }
}

/**
 * Login as tenant user
 * Uses seeded test account: an@gmail.com / Tenant@123
 */
export async function loginAsTenant(page: Page): Promise<void> {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill email
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('an@gmail.com');

    // Fill password
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('Tenant@123');

    // Click login button
    const loginButton = page.getByRole('button', { name: /đăng nhập/i });
    await loginButton.click();

    // Wait for navigation
    try {
        await page.waitForURL(/tenant|dashboard|\/$/i, { timeout: 15000 });
    } catch {
        // If no redirect, check if we're logged in
        const isLoggedIn = await page.locator('[class*="avatar"], [class*="user"]').first().isVisible().catch(() => false);
        if (!isLoggedIn) {
            throw new Error('Login failed');
        }
    }
}

/**
 * Login as landlord user
 * Uses seeded test account: minhtam@nhatro.vn / Landlord@123  
 */
export async function loginAsLandlord(page: Page): Promise<void> {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('minhtam@nhatro.vn');

    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('Landlord@123');

    const loginButton = page.getByRole('button', { name: /đăng nhập/i });
    await loginButton.click();

    try {
        await page.waitForURL(/landlord|dashboard|\/$/i, { timeout: 15000 });
    } catch {
        const isLoggedIn = await page.locator('[class*="avatar"], [class*="user"]').first().isVisible().catch(() => false);
        if (!isLoggedIn) {
            throw new Error('Login failed');
        }
    }
}

/**
 * Wait for loading to complete
 */
export async function waitForLoading(page: Page): Promise<void> {
    // Wait for any loading spinners to disappear
    const loadingIndicators = page.locator('[class*="loading"], [class*="spinner"], [aria-busy="true"]');

    try {
        await loadingIndicators.first().waitFor({ state: 'hidden', timeout: 10000 });
    } catch {
        // No loading indicator found, that's fine
    }

    await page.waitForLoadState('networkidle');
}

/**
 * Fill a form field by label or placeholder
 */
export async function fillField(page: Page, label: string, value: string): Promise<void> {
    // Try by label first
    let field = page.getByLabel(new RegExp(label, 'i'));

    if (!(await field.isVisible().catch(() => false))) {
        // Try by placeholder
        field = page.getByPlaceholder(new RegExp(label, 'i'));
    }

    if (!(await field.isVisible().catch(() => false))) {
        // Try by name attribute
        field = page.locator(`input[name*="${label.toLowerCase()}"]`);
    }

    if (await field.isVisible()) {
        await field.fill(value);
    } else {
        throw new Error(`Could not find field: ${label}`);
    }
}

/**
 * Click a button by text
 */
export async function clickButton(page: Page, text: string): Promise<void> {
    const button = page.getByRole('button', { name: new RegExp(text, 'i') });
    await button.click();
}

/**
 * Check if element exists and is visible
 */
export async function isVisible(page: Page, selector: string): Promise<boolean> {
    try {
        return await page.locator(selector).first().isVisible();
    } catch {
        return false;
    }
}
