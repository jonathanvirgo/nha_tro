import { test, expect, Page } from '@playwright/test';

/**
 * Admin Dashboard & Reports Tests
 */

async function loginAsAdmin(page: Page) {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('admin@nhatro.vn');
    await page.locator('input[type="password"]').fill('Admin@123');
    await page.getByRole('button', { name: /đăng nhập|login|sign in/i }).click();
    await page.waitForTimeout(2000); // Wait for potential redirect
}

test.describe('Admin Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should display admin dashboard', async ({ page }) => {
        await page.goto('/admin');

        // Should show dashboard or redirect to dashboard
        const dashboardText = page.getByText(/dashboard|tổng quan|bảng điều khiển/i);
        await expect(dashboardText.first()).toBeVisible();
    });

    test('should display statistics cards', async ({ page }) => {
        await page.goto('/admin');

        // Look for stat cards (Total rooms, Revenue, etc.)
        const statCards = page.locator('[class*="card"]');
        await expect(statCards.first()).toBeVisible();

        // Should have multiple stat cards
        const count = await statCards.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should display charts/graphs', async ({ page }) => {
        await page.goto('/admin');

        // Look for chart elements
        const hasChart = await page.locator('svg[class*="recharts"], canvas, [class*="chart"]').first().isVisible().catch(() => false);
        expect(hasChart).toBeTruthy();
    });

    test('should have quick action buttons', async ({ page }) => {
        await page.goto('/admin');

        // Look for action buttons
        const actionButtons = page.getByRole('button', { name: /tạo|thêm|xem|view|create|add/i });
        const count = await actionButtons.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should show recent activities', async ({ page }) => {
        await page.goto('/admin');

        // Look for activity section
        const activitySection = page.getByText(/hoạt động gần đây|recent|activity|thông báo/i);
        const hasActivity = await activitySection.first().isVisible().catch(() => false);
        expect(hasActivity).toBeTruthy();
    });
});

test.describe('Admin Reports Page', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should display reports page', async ({ page }) => {
        await page.goto('/admin/reports');

        await expect(page.getByText(/báo cáo|reports|thống kê/i).first()).toBeVisible();
    });

    test('should have date range filter', async ({ page }) => {
        await page.goto('/admin/reports');

        // Look for date pickers or period selector
        const dateFilter = page.locator('input[type="date"], [class*="date"], [class*="calendar"]');
        const periodSelector = page.getByRole('combobox', { name: /kỳ|period|tháng|month/i });

        const hasDateFilter = await dateFilter.first().isVisible().catch(() => false);
        const hasPeriod = await periodSelector.isVisible().catch(() => false);

        expect(hasDateFilter || hasPeriod).toBeTruthy();
    });

    test('should display revenue statistics', async ({ page }) => {
        await page.goto('/admin/reports');

        // Look for revenue information
        const revenueText = page.getByText(/doanh thu|revenue|thu nhập|income/i);
        await expect(revenueText.first()).toBeVisible();
    });

    test('should have export/download option', async ({ page }) => {
        await page.goto('/admin/reports');

        const exportButton = page.getByRole('button', { name: /xuất|export|tải|download|pdf|excel/i });
        const hasExport = await exportButton.first().isVisible().catch(() => false);
        expect(hasExport).toBeTruthy();
    });

    test('should display occupancy rates', async ({ page }) => {
        await page.goto('/admin/reports');

        const occupancyText = page.getByText(/tỷ lệ|lấp đầy|công suất|occupancy/i);
        const hasOccupancy = await occupancyText.first().isVisible().catch(() => false);
        expect(hasOccupancy).toBeTruthy();
    });
});

test.describe('Admin Settings Page', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should display settings page', async ({ page }) => {
        await page.goto('/admin/settings');

        await expect(page.getByText(/cài đặt|settings|cấu hình/i).first()).toBeVisible();
    });

    test('should have profile settings section', async ({ page }) => {
        await page.goto('/admin/settings');

        const profileSection = page.getByText(/thông tin cá nhân|profile|hồ sơ/i);
        const hasProfile = await profileSection.first().isVisible().catch(() => false);
        expect(hasProfile).toBeTruthy();
    });

    test('should allow changing password', async ({ page }) => {
        await page.goto('/admin/settings');

        // Look for password change section
        const passwordSection = page.getByText(/đổi mật khẩu|change password|mật khẩu/i);
        const hasPassword = await passwordSection.first().isVisible().catch(() => false);
        expect(hasPassword).toBeTruthy();
    });

    test('should have notification settings', async ({ page }) => {
        await page.goto('/admin/settings');

        const notifSection = page.getByText(/thông báo|notification/i);
        const hasNotif = await notifSection.first().isVisible().catch(() => false);
        expect(hasNotif).toBeTruthy();
    });
});
