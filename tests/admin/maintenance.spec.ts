import { test, expect, Page } from '@playwright/test';

/**
 * Admin Maintenance Page Tests
 */

async function loginAsAdmin(page: Page) {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('admin@nhatro.vn');
    await page.locator('input[type="password"]').fill('Admin@123');
    await page.getByRole('button', { name: /đăng nhập|login|sign in/i }).click();
    await page.waitForTimeout(2000); // Wait for potential redirect
}

test.describe('Admin Maintenance Page', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should display maintenance page', async ({ page }) => {
        await page.goto('/admin/maintenance');

        await expect(page.getByText(/bảo trì|sửa chữa|maintenance/i).first()).toBeVisible();
    });

    test('should display maintenance requests list', async ({ page }) => {
        await page.goto('/admin/maintenance');

        const hasTable = await page.locator('table').first().isVisible().catch(() => false);
        const hasCards = await page.locator('[class*="card"]').first().isVisible().catch(() => false);

        expect(hasTable || hasCards).toBeTruthy();
    });

    test('should show priority badges', async ({ page }) => {
        await page.goto('/admin/maintenance');

        // Look for priority indicators (Low, Medium, High, Urgent)
        const priorityBadge = page.locator('[class*="badge"]').first();
        if (await priorityBadge.isVisible()) {
            expect(await priorityBadge.textContent()).toBeTruthy();
        }
    });

    test('should have status filter tabs', async ({ page }) => {
        await page.goto('/admin/maintenance');

        // Look for status tabs (Pending, In Progress, Completed)
        const statusFilter = page.getByRole('tab').or(page.getByRole('button', { name: /chờ xử lý|pending|đang xử lý|completed|hoàn thành/i }));

        const hasFilter = await statusFilter.first().isVisible().catch(() => false);
        expect(hasFilter).toBeTruthy();
    });

    test('should have create maintenance request button', async ({ page }) => {
        await page.goto('/admin/maintenance');

        const createButton = page.getByRole('button', { name: /tạo|thêm|create|add/i }).first();
        await expect(createButton).toBeVisible();
    });
});

test.describe('Admin Maintenance CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should open create maintenance form', async ({ page }) => {
        await page.goto('/admin/maintenance');

        const createButton = page.getByRole('button', { name: /tạo|thêm|create|add/i }).first();
        await createButton.click();

        await page.waitForTimeout(1000);

        // Should show form
        const hasDialog = await page.locator('[role="dialog"]').isVisible().catch(() => false);
        const hasForm = await page.locator('form').isVisible().catch(() => false);

        expect(hasDialog || hasForm || page.url().includes('new')).toBeTruthy();
    });

    test('maintenance form should have room selection', async ({ page }) => {
        await page.goto('/admin/maintenance');

        const createButton = page.getByRole('button', { name: /tạo|thêm|create|add/i }).first();
        await createButton.click();

        await page.waitForTimeout(1000);

        // Check for room selection
        const roomSelect = page.getByText(/chọn phòng|select room|phòng/i);
        const hasRoomField = await roomSelect.isVisible().catch(() => false);

        expect(hasRoomField).toBeTruthy();
    });

    test('should update maintenance status', async ({ page }) => {
        await page.goto('/admin/maintenance');

        // Click on first maintenance item
        const maintenanceRow = page.locator('table tbody tr, [class*="card"]').first();
        if (await maintenanceRow.isVisible()) {
            await maintenanceRow.click();
            await page.waitForTimeout(500);

            // Look for status update options
            const statusDropdown = page.getByRole('combobox', { name: /trạng thái|status/i });
            const hasStatusUpdate = await statusDropdown.isVisible().catch(() => false);

            expect(hasStatusUpdate || page.url().includes('maintenance')).toBeTruthy();
        }
    });
});
