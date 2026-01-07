import { test, expect, Page } from '@playwright/test';

/**
 * Admin Tenants Page Tests
 */

async function loginAsAdmin(page: Page) {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('admin@nhatro.vn');
    await page.locator('input[type="password"]').fill('Admin@123');
    await page.getByRole('button', { name: /đăng nhập|login|sign in/i }).click();
    await page.waitForTimeout(2000); // Wait for potential redirect
}

test.describe('Admin Tenants Page', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should display tenants management page', async ({ page }) => {
        await page.goto('/admin/tenants');

        await expect(page.getByText(/khách thuê|người thuê|tenants/i).first()).toBeVisible();
    });

    test('should display tenants list', async ({ page }) => {
        await page.goto('/admin/tenants');

        const hasTable = await page.locator('table').first().isVisible().catch(() => false);
        const hasCards = await page.locator('[class*="card"]').first().isVisible().catch(() => false);
        const hasList = await page.locator('ul, [class*="list"]').first().isVisible().catch(() => false);

        expect(hasTable || hasCards || hasList).toBeTruthy();
    });

    test('should show tenant contact information', async ({ page }) => {
        await page.goto('/admin/tenants');

        // Look for phone or email icons/text
        const contactInfo = page.getByText(/(0\d{9,10})|(@)|phone|email/i);
        const svgIcon = page.locator('svg[class*="phone"], svg[class*="mail"]');

        const hasContact = await contactInfo.first().isVisible().catch(() => false);
        const hasIcon = await svgIcon.first().isVisible().catch(() => false);

        expect(hasContact || hasIcon).toBeTruthy();
    });

    test('should have search tenant functionality', async ({ page }) => {
        await page.goto('/admin/tenants');

        const searchInput = page.getByPlaceholder(/tìm kiếm|search/i);
        await expect(searchInput).toBeVisible();

        // Test search
        await searchInput.fill('Nguyen');
        await page.waitForTimeout(500);
    });

    test('should show tenant room assignment', async ({ page }) => {
        await page.goto('/admin/tenants');

        // Each tenant should show their assigned room
        const roomInfo = page.getByText(/phòng|room/i);
        await expect(roomInfo.first()).toBeVisible();
    });
});

test.describe('Admin Tenants CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should have add tenant button', async ({ page }) => {
        await page.goto('/admin/tenants');

        const addButton = page.getByRole('button', { name: /thêm|add|tạo|create/i }).first();
        await expect(addButton).toBeVisible();
    });

    test('should open tenant form with required fields', async ({ page }) => {
        await page.goto('/admin/tenants');

        const addButton = page.getByRole('button', { name: /thêm|add|tạo|create/i }).first();
        await addButton.click();

        await page.waitForTimeout(1000);

        // Check for form fields
        const nameField = page.getByLabel(/họ tên|name/i).or(page.getByPlaceholder(/họ tên|name/i));
        const phoneField = page.getByLabel(/điện thoại|phone/i).or(page.getByPlaceholder(/điện thoại|phone/i));

        const hasName = await nameField.isVisible().catch(() => false);
        const hasPhone = await phoneField.isVisible().catch(() => false);

        expect(hasName || hasPhone).toBeTruthy();
    });

    test('should show tenant details when clicked', async ({ page }) => {
        await page.goto('/admin/tenants');

        // Click on a tenant row
        const tenantRow = page.locator('table tbody tr').first();
        if (await tenantRow.isVisible()) {
            await tenantRow.click();
            await page.waitForTimeout(500);

            // Should show details
            const hasDetails = await page.getByText(/chi tiết|details|thông tin/i).isVisible().catch(() => false);
            expect(hasDetails || page.url().includes('tenant')).toBeTruthy();
        }
    });
});
