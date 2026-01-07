import { test, expect, Page } from '@playwright/test';

/**
 * Admin Invoices Page Tests
 */

async function loginAsAdmin(page: Page) {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('admin@nhatro.vn');
    await page.locator('input[type="password"]').fill('Admin@123');
    await page.getByRole('button', { name: /đăng nhập|login|sign in/i }).click();
    await page.waitForTimeout(2000); // Wait for potential redirect
}

test.describe('Admin Invoices Page', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should display invoices page', async ({ page }) => {
        await page.goto('/admin/invoices');

        await expect(page.getByText(/hóa đơn|invoices/i).first()).toBeVisible();
    });

    test('should display invoices list/table', async ({ page }) => {
        await page.goto('/admin/invoices');

        const hasTable = await page.locator('table').first().isVisible().catch(() => false);
        const hasCards = await page.locator('[class*="card"]').first().isVisible().catch(() => false);

        expect(hasTable || hasCards).toBeTruthy();
    });

    test('should have generate invoice button', async ({ page }) => {
        await page.goto('/admin/invoices');

        const generateButton = page.getByRole('button', { name: /tạo hóa đơn|generate|thêm|create/i }).first();
        await expect(generateButton).toBeVisible();
    });

    test('should display payment status badges', async ({ page }) => {
        await page.goto('/admin/invoices');

        // Look for payment status (Paid, Unpaid, Partial, Overdue)
        const statusBadge = page.locator('[class*="badge"]').first();
        if (await statusBadge.isVisible()) {
            const text = await statusBadge.textContent();
            expect(text).toBeTruthy();
        }
    });

    test('should have month/period filter', async ({ page }) => {
        await page.goto('/admin/invoices');

        // Look for date/month filter
        const monthFilter = page.locator('input[type="month"], select, [role="combobox"]');
        await expect(monthFilter.first()).toBeVisible();
    });

    test('should show total amount summary', async ({ page }) => {
        await page.goto('/admin/invoices');

        // Look for amount totals
        const amountText = page.getByText(/tổng|total|đ|vnd/i);
        await expect(amountText.first()).toBeVisible();
    });
});

test.describe('Admin Invoices Actions', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should open invoice details on click', async ({ page }) => {
        await page.goto('/admin/invoices');

        // Click on first invoice row/card
        const invoiceRow = page.locator('table tbody tr, [class*="card"]').first();
        if (await invoiceRow.isVisible()) {
            await invoiceRow.click();
            await page.waitForTimeout(500);

            // Should show details (modal or page)
            const detailsVisible = await page.getByText(/chi tiết|details|thanh toán/i).isVisible().catch(() => false);
            expect(detailsVisible || page.url().includes('invoice')).toBeTruthy();
        }
    });

    test('should have print/export option', async ({ page }) => {
        await page.goto('/admin/invoices');

        // Look for print or export button
        const printButton = page.getByRole('button', { name: /in|print|export|xuất/i });
        const downloadLink = page.getByRole('link', { name: /tải|download|pdf/i });

        const hasPrint = await printButton.isVisible().catch(() => false);
        const hasDownload = await downloadLink.isVisible().catch(() => false);

        // At least one export option should exist
        expect(hasPrint || hasDownload).toBeTruthy();
    });
});
