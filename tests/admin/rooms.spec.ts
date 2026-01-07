import { test, expect, Page } from '@playwright/test';

/**
 * Admin Rooms Page Tests
 * Tests for room listing, create, edit, and delete functionality
 */

async function loginAsAdmin(page: Page) {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('admin@nhatro.vn');
    await page.locator('input[type="password"]').fill('Admin@123');
    await page.getByRole('button', { name: /đăng nhập|login|sign in/i }).click();
    await page.waitForTimeout(2000); // Wait for potential redirect
}

test.describe('Admin Rooms Page', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should navigate to rooms management page', async ({ page }) => {
        await page.goto('/admin/rooms');

        await expect(page.getByText(/quản lý phòng|rooms/i).first()).toBeVisible();
    });

    test('should display rooms list/table', async ({ page }) => {
        await page.goto('/admin/rooms');

        // Look for table or cards
        const hasTable = await page.locator('table').first().isVisible().catch(() => false);
        const hasCards = await page.locator('[class*="card"]').first().isVisible().catch(() => false);

        expect(hasTable || hasCards).toBeTruthy();
    });

    test('should have add room button', async ({ page }) => {
        await page.goto('/admin/rooms');

        const addButton = page.getByRole('button', { name: /thêm phòng|add room|tạo|create/i }).first();
        await expect(addButton).toBeVisible();
    });

    test('should display room status badges', async ({ page }) => {
        await page.goto('/admin/rooms');

        // Look for status badges (Available, Rented, etc.)
        const statusBadge = page.locator('[class*="badge"]').first();
        if (await statusBadge.isVisible()) {
            const text = await statusBadge.textContent();
            expect(text).toBeTruthy();
        }
    });

    test('should have filter options', async ({ page }) => {
        await page.goto('/admin/rooms');

        // Look for filter dropdowns or inputs
        const filterExists = await page.locator('select, [role="combobox"], input[type="search"]').first().isVisible().catch(() => false);
        const searchExists = await page.getByPlaceholder(/tìm kiếm|search|filter/i).isVisible().catch(() => false);

        expect(filterExists || searchExists).toBeTruthy();
    });
});

test.describe('Admin Rooms CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should open add room form', async ({ page }) => {
        await page.goto('/admin/rooms');

        const addButton = page.getByRole('button', { name: /thêm|add|tạo|create/i }).first();
        await addButton.click();

        await page.waitForTimeout(1000);

        // Check for form elements
        const hasForm = await page.locator('form, [role="dialog"]').isVisible().catch(() => false);
        const hasInputs = await page.getByRole('textbox').first().isVisible().catch(() => false);

        expect(hasForm || hasInputs || page.url().includes('new')).toBeTruthy();
    });

    test('should validate required fields in room form', async ({ page }) => {
        await page.goto('/admin/rooms');

        const addButton = page.getByRole('button', { name: /thêm|add|tạo|create/i }).first();
        await addButton.click();

        await page.waitForTimeout(500);

        // Try to submit empty form
        const submitButton = page.getByRole('button', { name: /lưu|save|submit|tạo|create/i });
        if (await submitButton.isVisible()) {
            await submitButton.click();

            // Should show validation errors
            await page.waitForTimeout(500);
            const hasError = await page.getByText(/bắt buộc|required|invalid|lỗi/i).isVisible().catch(() => false);
            const hasInvalid = await page.locator(':invalid').first().isVisible().catch(() => false);

            expect(hasError || hasInvalid).toBeTruthy();
        }
    });
});
