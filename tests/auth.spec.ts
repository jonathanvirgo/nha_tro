import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test.describe('Login Page', () => {
        test('should display login form', async ({ page }) => {
            await page.goto('/login');

            // Check for email/username input
            const emailInput = page.getByRole('textbox', { name: /email/i });
            await expect(emailInput).toBeVisible();

            // Check for password input
            const passwordInput = page.locator('input[type="password"]');
            await expect(passwordInput).toBeVisible();

            // Check for submit button
            const submitBtn = page.getByRole('button', { name: /đăng nhập|login|sign in/i });
            await expect(submitBtn).toBeVisible();
        });

        test('should show error with invalid credentials', async ({ page }) => {
            await page.goto('/login');

            // Fill in invalid credentials
            await page.locator('input[name="email"]').fill('invalid@test.com');
            await page.locator('input[type="password"]').fill('wrongpassword');

            // Submit form
            await page.getByRole('button', { name: /đăng nhập|login|sign in/i }).click();

            // Wait for response
            await page.waitForLoadState('networkidle');

            // Check for error message
            const errorMessage = page.getByText(/sai|invalid|incorrect|error|lỗi/i);
            await expect(errorMessage).toBeVisible({ timeout: 10000 });
        });

        test('should login successfully with valid credentials', async ({ page }) => {
            await page.goto('/login');

            // Use seeded test account
            await page.locator('input[name="email"]').fill('admin@nhatro.vn');
            await page.locator('input[type="password"]').fill('Admin@123');

            // Submit form
            await page.getByRole('button', { name: /đăng nhập|login|sign in/i }).click();

            // Wait for redirect (either to dashboard or home)
            await page.waitForTimeout(2000); // Wait for potential redirect

            // Should not be on login page anymore
            await expect(page).not.toHaveURL(/login/);
        });
    });

    test.describe('Register Page', () => {
        test('should display registration form', async ({ page }) => {
            await page.goto('/register');

            // Check for name input
            const nameInput = page.getByRole('textbox', { name: /tên|name/i }).first();
            await expect(nameInput).toBeVisible();

            // Check for email input
            const emailInput = page.getByRole('textbox', { name: /email/i });
            await expect(emailInput).toBeVisible();

            // Check for password inputs
            const passwordInputs = page.locator('input[type="password"]');
            await expect(passwordInputs.first()).toBeVisible();

            // Check for submit button
            const submitBtn = page.getByRole('button', { name: /đăng ký|register|sign up/i });
            await expect(submitBtn).toBeVisible();
        });

        test('should show validation errors for empty form', async ({ page }) => {
            await page.goto('/register');

            // Try to submit empty form
            await page.getByRole('button', { name: /đăng ký|register|sign up/i }).click();

            // Should show validation errors
            await page.waitForLoadState('networkidle');

            // Look for error indicators (HTML5 validation or custom errors)
            const hasInvalidField = await page.locator(':invalid').first().isVisible().catch(() => false);
            const hasErrorMessage = await page.getByText(/bắt buộc|required|invalid/i).isVisible().catch(() => false);

            expect(hasInvalidField || hasErrorMessage).toBeTruthy();
        });
    });
});
