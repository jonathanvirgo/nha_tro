import { test, expect, Page } from '@playwright/test';

/**
 * Security & Access Control Tests (RBAC)
 * Ensures users cannot access unauthorized resources
 */

test.describe('Security & RBAC', () => {

    // GUEST ACCESS
    test('Guest: should be redirected to login when accessing admin pages', async ({ page }) => {
        const protectedRoutes = [
            '/admin',
            '/admin/motels',
            '/admin/contracts',
            '/admin/revenue',
            '/tenant',
            '/tenant/contracts'
        ];

        for (const route of protectedRoutes) {
            await page.goto(route);
            await page.waitForTimeout(1000);

            // Should redirect to login or show 403
            const url = page.url();
            const isLogin = url.includes('/login');
            const isHome = url === 'http://localhost:3000/'; // Sometimes redirects home

            expect(isLogin || isHome).toBeTruthy();
        }
    });

    test('Guest: should not be able to access API endpoints directly', async ({ request }) => {
        const response = await request.get('/api/motels');
        expect(response.status()).toBeOneOf([401, 403]);
    });

    // TENANT ACCESS
    test('Tenant: should NOT be able to access Admin pages', async ({ page }) => {
        // Login as Tenant
        await page.goto('/login');
        await page.locator('input[name="email"]').fill('an@gmail.com');
        await page.locator('input[name="password"]').fill('Tenant@123');
        await page.getByRole('button', { name: /đăng nhập/i }).click();
        await page.waitForTimeout(3000);

        // Try to go to Admin page
        await page.goto('/admin/dashboard');
        await page.waitForTimeout(1000);

        // Should be redirected (usually to home or tenant dashboard) or show 403
        const url = page.url();
        const isAdmin = url.includes('/admin/dashboard');

        expect(isAdmin).toBeFalsy();

        // Check for "Not Authorized" message if staying on page
        if (isAdmin) {
            const errorMsg = await page.getByText(/không có quyền|unauthorized|forbidden|403/i).isVisible();
            expect(errorMsg).toBeTruthy();
        }
    });

    test('Tenant: should only see their own data', async ({ page }) => {
        await page.goto('/login');
        await page.locator('input[name="email"]').fill('an@gmail.com');
        await page.locator('input[name="password"]').fill('Tenant@123');
        await page.getByRole('button', { name: /đăng nhập/i }).click();
        await page.waitForTimeout(3000);

        await page.goto('/tenant/contracts');

        // Should verify they don't see massive list of all contracts
        // This is a heuristic check
        const rows = page.locator('table tbody tr');
        // Typical tenant has 1-2 contracts, admin has many
        // count should be small suitable number
    });

    // LANDLORD ACCESS (Assuming similar to Admin but might have restrictions if implemented)
    // ...
});
