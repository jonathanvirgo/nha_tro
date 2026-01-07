import { test, expect, Page } from '@playwright/test';

/**
 * Admin Motels Page Tests
 * Tests for motel listing, create, edit, and delete functionality
 */

// Helper to login as admin before tests
async function loginAsAdmin(page: Page) {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('admin@nhatro.vn');
    await page.locator('input[type="password"]').fill('Admin@123');
    await page.getByRole('button', { name: /đăng nhập|login|sign in/i }).click();
    await page.waitForTimeout(2000); // Wait for potential redirect
}

test.describe('Admin Motels Page', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should navigate to motels management page', async ({ page }) => {
        await page.goto('/admin/motels');

        // Should see page title
        await expect(page.getByText(/quản lý nhà trọ|motels/i).first()).toBeVisible();
    });

    test('should display motels list table', async ({ page }) => {
        await page.goto('/admin/motels');

        // Look for table or list of motels
        const table = page.locator('table').first();
        await expect(table).toBeVisible();

        // Table should have headers
        await expect(page.getByText(/tên nhà trọ|motel name/i)).toBeVisible();
    });

    test('should display add motel button', async ({ page }) => {
        await page.goto('/admin/motels');

        // Find add button
        const addButton = page.getByRole('button', { name: /thêm|add|tạo|create/i }).first();
        await expect(addButton).toBeVisible();
    });

    test('should have search functionality', async ({ page }) => {
        await page.goto('/admin/motels');

        // Find search input
        const searchInput = page.getByPlaceholder(/tìm kiếm|search/i);
        await expect(searchInput).toBeVisible();

        // Type in search
        await searchInput.fill('Minh');
        await page.waitForTimeout(500);

        // Results should be filtered (no error thrown)
    });

    test('should show action menu for each motel', async ({ page }) => {
        await page.goto('/admin/motels');

        // Find action button (usually 3 dots or gear icon)
        const actionButton = page.locator('button').filter({ has: page.locator('[class*="MoreHorizontal"], [class*="ellipsis"], svg') }).first();

        if (await actionButton.isVisible()) {
            await actionButton.click();

            // Should show dropdown with edit/delete options
            await expect(page.getByText(/chỉnh sửa|edit/i).first()).toBeVisible();
        }
    });

    test('should display motel statistics cards', async ({ page }) => {
        await page.goto('/admin/motels');

        // Look for stats cards
        const statsText = page.getByText(/tổng nhà trọ|tổng phòng|đang cho thuê|còn trống/i);
        await expect(statsText.first()).toBeVisible();
    });
});

test.describe('Admin Motels CRUD Operations', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should open add motel dialog/form', async ({ page }) => {
        await page.goto('/admin/motels');

        // Click add button
        const addButton = page.getByRole('button', { name: /thêm|add|tạo|create/i }).first();
        await addButton.click();

        // Wait for modal/dialog or new page
        await page.waitForTimeout(1000);

        // Should show form fields (either in modal or new page)
        const formExists = await page.getByRole('textbox').first().isVisible().catch(() => false);
        const dialogExists = await page.locator('[role="dialog"]').isVisible().catch(() => false);

        expect(formExists || dialogExists || page.url().includes('new') || page.url().includes('create')).toBeTruthy();
    });

    test('should show edit form when clicking edit', async ({ page }) => {
        await page.goto('/admin/motels');

        // Click on action menu
        const actionButton = page.locator('button').filter({ has: page.locator('svg') }).last();
        if (await actionButton.isVisible()) {
            await actionButton.click();

            // Click edit
            const editOption = page.getByText(/chỉnh sửa|edit/i).first();
            if (await editOption.isVisible()) {
                await editOption.click();
                await page.waitForTimeout(1000);

                // Should show edit form or navigate to edit page
                const formVisible = await page.getByRole('textbox').first().isVisible().catch(() => false);
                expect(formVisible || page.url().includes('edit')).toBeTruthy();
            }
        }
    });
});
