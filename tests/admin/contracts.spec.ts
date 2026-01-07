import { test, expect, Page } from '@playwright/test';

/**
 * Admin Contracts Page Tests
 */

async function loginAsAdmin(page: Page) {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('admin@nhatro.vn');
    await page.locator('input[type="password"]').fill('Admin@123');
    await page.getByRole('button', { name: /đăng nhập|login|sign in/i }).click();
    await page.waitForTimeout(2000); // Wait for potential redirect
}

test.describe('Admin Contracts Page', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should display contracts management page', async ({ page }) => {
        await page.goto('/admin/contracts');

        await expect(page.getByText(/hợp đồng|contracts/i).first()).toBeVisible();
    });

    test('should display contracts list', async ({ page }) => {
        await page.goto('/admin/contracts');

        const hasTable = await page.locator('table').first().isVisible().catch(() => false);
        const hasContent = await page.locator('[class*="card"], article').first().isVisible().catch(() => false);

        expect(hasTable || hasContent).toBeTruthy();
    });

    test('should have create contract button', async ({ page }) => {
        await page.goto('/admin/contracts');

        const addButton = page.getByRole('button', { name: /tạo hợp đồng|thêm|create|add/i }).first();
        await expect(addButton).toBeVisible();
    });

    test('should show contract status filter', async ({ page }) => {
        await page.goto('/admin/contracts');

        // Look for status filter tabs or dropdown
        const statusFilter = page.getByText(/tất cả|hoạt động|hết hạn|all|active|expired/i);
        await expect(statusFilter.first()).toBeVisible();
    });

    test('should display contract details columns', async ({ page }) => {
        await page.goto('/admin/contracts');

        // Check for important columns in table
        const columns = ['mã hợp đồng', 'phòng', 'khách thuê', 'ngày bắt đầu', 'ngày kết thúc', 'trạng thái'];
        let foundColumns = 0;

        for (const col of columns) {
            const exists = await page.getByText(new RegExp(col, 'i')).isVisible().catch(() => false);
            if (exists) foundColumns++;
        }

        expect(foundColumns).toBeGreaterThan(0);
    });
});

test.describe('Admin Contracts CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should open create contract form', async ({ page }) => {
        await page.goto('/admin/contracts');

        const addButton = page.getByRole('button', { name: /tạo|thêm|create|add/i }).first();
        await addButton.click();

        await page.waitForTimeout(1000);

        // Should show form
        const hasDialog = await page.locator('[role="dialog"]').isVisible().catch(() => false);
        const hasForm = await page.locator('form').isVisible().catch(() => false);

        expect(hasDialog || hasForm || page.url().includes('new')).toBeTruthy();
    });

    test('contract form should have required fields', async ({ page }) => {
        await page.goto('/admin/contracts');

        const addButton = page.getByRole('button', { name: /tạo|thêm|create|add/i }).first();
        await addButton.click();

        await page.waitForTimeout(1000);

        // Check for essential form fields
        const roomSelect = page.getByText(/chọn phòng|select room|phòng/i);
        const dateInput = page.locator('input[type="date"], [class*="date"]');

        const hasRoomField = await roomSelect.isVisible().catch(() => false);
        const hasDateField = await dateInput.first().isVisible().catch(() => false);

        expect(hasRoomField || hasDateField).toBeTruthy();
    });
});
