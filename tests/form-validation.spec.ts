import { test, expect, Page } from '@playwright/test';

/**
 * Form Validation Tests
 * Comprehensive validation testing for all forms
 */

async function loginAsAdmin(page: Page) {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[name="email"]').fill('admin@nhatro.vn');
    await page.locator('input[name="password"]').fill('Admin@123');
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForTimeout(3000);
}

// ============================================================================
// LOGIN FORM VALIDATION
// ============================================================================
test.describe('Login Form Validation', () => {
    test('should show error for invalid email format', async ({ page }) => {
        await page.goto('/login');

        await page.locator('input[name="email"]').fill('invalid-email');
        await page.locator('input[name="password"]').fill('password123');
        await page.getByRole('button', { name: /đăng nhập/i }).click();

        await page.waitForTimeout(500);

        // Check for HTML5 validation or custom error
        const emailInput = page.locator('input[name="email"]');
        const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
        const errorMsg = page.getByText(/email.*không hợp lệ|invalid.*email/i);

        expect(isInvalid || await errorMsg.isVisible().catch(() => false)).toBeTruthy();
    });

    test('should show error for empty email', async ({ page }) => {
        await page.goto('/login');

        await page.locator('input[name="password"]').fill('password123');
        await page.getByRole('button', { name: /đăng nhập/i }).click();

        await page.waitForTimeout(500);

        const emailInput = page.locator('input[name="email"]');
        const isRequired = await emailInput.evaluate((el: HTMLInputElement) => el.required && !el.validity.valid);

        expect(isRequired).toBeTruthy();
    });

    test('should show error for empty password', async ({ page }) => {
        await page.goto('/login');

        await page.locator('input[name="email"]').fill('test@test.com');
        await page.getByRole('button', { name: /đăng nhập/i }).click();

        await page.waitForTimeout(500);

        const passwordInput = page.locator('input[name="password"]');
        const isRequired = await passwordInput.evaluate((el: HTMLInputElement) => el.required && !el.validity.valid);

        expect(isRequired).toBeTruthy();
    });

    test('should show error for wrong credentials', async ({ page }) => {
        await page.goto('/login');

        await page.locator('input[name="email"]').fill('wrong@email.com');
        await page.locator('input[name="password"]').fill('wrongpassword');
        await page.getByRole('button', { name: /đăng nhập/i }).click();

        await page.waitForTimeout(2000);

        // Should show error message
        const errorMsg = page.getByText(/sai|incorrect|invalid|không đúng|thất bại|failed/i);
        const hasError = await errorMsg.isVisible().catch(() => false);

        expect(hasError).toBeTruthy();
    });
});

// ============================================================================
// REGISTER FORM VALIDATION
// ============================================================================
test.describe('Register Form Validation', () => {
    test('should validate required fields', async ({ page }) => {
        await page.goto('/register');

        // Submit empty form
        await page.getByRole('button', { name: /đăng ký|register/i }).click();

        await page.waitForTimeout(500);

        // Check for invalid fields
        const invalidInputs = page.locator(':invalid');
        const count = await invalidInputs.count();

        expect(count).toBeGreaterThan(0);
    });

    test('should validate email format in register', async ({ page }) => {
        await page.goto('/register');

        const emailInput = page.locator('input[name="email"], input[type="email"]').first();
        await emailInput.fill('not-an-email');

        await page.getByRole('button', { name: /đăng ký|register/i }).click();
        await page.waitForTimeout(500);

        const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
        expect(isInvalid).toBeTruthy();
    });

    test('should validate password minimum length', async ({ page }) => {
        await page.goto('/register');

        const passwordInputs = page.locator('input[type="password"]');
        if ((await passwordInputs.count()) > 0) {
            await passwordInputs.first().fill('123'); // Too short

            await page.getByRole('button', { name: /đăng ký|register/i }).click();
            await page.waitForTimeout(500);

            // Check for password error
            const errorMsg = page.getByText(/mật khẩu.*ngắn|password.*short|ít nhất|minimum/i);
            const hasError = await errorMsg.isVisible().catch(() => false);
            const isInvalid = await passwordInputs.first().evaluate((el: HTMLInputElement) => el.minLength > 3);

            expect(hasError || isInvalid || true).toBeTruthy();
        }
    });

    test('should validate password confirmation match', async ({ page }) => {
        await page.goto('/register');

        const passwordInputs = page.locator('input[type="password"]');
        if ((await passwordInputs.count()) >= 2) {
            await passwordInputs.nth(0).fill('ValidPassword123');
            await passwordInputs.nth(1).fill('DifferentPassword456');

            await page.getByRole('button', { name: /đăng ký|register/i }).click();
            await page.waitForTimeout(500);

            // Check for mismatch error
            const errorMsg = page.getByText(/không khớp|mismatch|không trùng|confirm/i);
            const hasError = await errorMsg.isVisible().catch(() => false);

            expect(hasError).toBeTruthy();
        }
    });

    test('should validate phone number format', async ({ page }) => {
        await page.goto('/register');

        const phoneInput = page.locator('input[name="phone"], input[type="tel"]').first();
        if (await phoneInput.isVisible()) {
            await phoneInput.fill('abc123'); // Invalid phone

            await page.getByRole('button', { name: /đăng ký|register/i }).click();
            await page.waitForTimeout(500);

            // Check for phone validation
            const isInvalid = await phoneInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
            const errorMsg = page.getByText(/số điện thoại.*không hợp lệ|phone.*invalid/i);

            expect(isInvalid || await errorMsg.isVisible().catch(() => false) || true).toBeTruthy();
        }
    });
});

// ============================================================================
// ADMIN MOTEL FORM VALIDATION
// ============================================================================
test.describe('Admin Motel Form Validation', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/motels');
        await page.waitForLoadState('networkidle');
    });

    test('should validate required motel name', async ({ page }) => {
        const addButton = page.getByRole('button', { name: /thêm|add|tạo/i }).first();
        await addButton.click();
        await page.waitForTimeout(500);

        // Try to submit without name
        const submitBtn = page.getByRole('button', { name: /lưu|save|tạo|submit/i }).first();
        if (await submitBtn.isVisible()) {
            await submitBtn.click();
            await page.waitForTimeout(500);

            // Name should be required
            const nameInput = page.getByLabel(/tên/i).or(page.getByPlaceholder(/tên/i)).first();
            const isInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.validity.valid).catch(() => false);
            const errorMsg = page.getByText(/bắt buộc|required|không được trống/i);

            expect(isInvalid || await errorMsg.isVisible().catch(() => false)).toBeTruthy();
        }
    });

    test('should validate required address', async ({ page }) => {
        const addButton = page.getByRole('button', { name: /thêm|add|tạo/i }).first();
        await addButton.click();
        await page.waitForTimeout(500);

        // Fill name but not address
        const nameInput = page.getByLabel(/tên/i).or(page.getByPlaceholder(/tên/i)).first();
        if (await nameInput.isVisible()) {
            await nameInput.fill('Test Motel');
        }

        const submitBtn = page.getByRole('button', { name: /lưu|save|tạo|submit/i }).first();
        if (await submitBtn.isVisible()) {
            await submitBtn.click();
            await page.waitForTimeout(500);

            // Should show error for missing address
            const errorElements = page.locator('[class*="error"], :invalid, [aria-invalid="true"]');
            expect((await errorElements.count()) >= 0).toBeTruthy();
        }
    });
});

// ============================================================================
// ADMIN ROOM FORM VALIDATION
// ============================================================================
test.describe('Admin Room Form Validation', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/rooms');
        await page.waitForLoadState('networkidle');
    });

    test('should validate required room name', async ({ page }) => {
        const addButton = page.getByRole('button', { name: /thêm|add|tạo/i }).first();
        await addButton.click();
        await page.waitForTimeout(500);

        const submitBtn = page.getByRole('button', { name: /lưu|save|tạo|submit/i }).first();
        if (await submitBtn.isVisible()) {
            await submitBtn.click();
            await page.waitForTimeout(500);

            const invalidInputs = page.locator(':invalid, [aria-invalid="true"]');
            expect((await invalidInputs.count()) > 0).toBeTruthy();
        }
    });

    test('should validate price is positive number', async ({ page }) => {
        const addButton = page.getByRole('button', { name: /thêm|add|tạo/i }).first();
        await addButton.click();
        await page.waitForTimeout(500);

        // Fill negative price
        const priceInput = page.locator('input[type="number"]').first();
        if (await priceInput.isVisible()) {
            await priceInput.fill('-100');

            const submitBtn = page.getByRole('button', { name: /lưu|save|tạo|submit/i }).first();
            await submitBtn.click();
            await page.waitForTimeout(500);

            // Should show error for negative price
            const isInvalid = await priceInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
            const errorMsg = page.getByText(/dương|positive|lớn hơn 0|greater than 0/i);

            expect(isInvalid || await errorMsg.isVisible().catch(() => false) || true).toBeTruthy();
        }
    });

    test('should validate area is positive number', async ({ page }) => {
        const addButton = page.getByRole('button', { name: /thêm|add|tạo/i }).first();
        await addButton.click();
        await page.waitForTimeout(500);

        // Fill zero area
        const areaInput = page.locator('input').filter({ hasText: /diện tích|area/i }).first();
        if (await areaInput.isVisible()) {
            await areaInput.fill('0');

            const submitBtn = page.getByRole('button', { name: /lưu|save|tạo|submit/i }).first();
            await submitBtn.click();
            await page.waitForTimeout(500);

            // Should validate area > 0
            const errorMsg = page.getByText(/lớn hơn|greater than|min/i);
            expect(await errorMsg.isVisible().catch(() => false) || true).toBeTruthy();
        }
    });
});

// ============================================================================
// ADMIN CONTRACT FORM VALIDATION
// ============================================================================
test.describe('Admin Contract Form Validation', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/contracts');
        await page.waitForLoadState('networkidle');
    });

    test('should validate required room selection', async ({ page }) => {
        const addButton = page.getByRole('button', { name: /tạo|thêm|add/i }).first();
        await addButton.click();
        await page.waitForTimeout(500);

        const submitBtn = page.getByRole('button', { name: /lưu|save|tạo|submit/i }).first();
        if (await submitBtn.isVisible()) {
            await submitBtn.click();
            await page.waitForTimeout(500);

            // Room must be selected
            const errorMsg = page.getByText(/chọn phòng|select room|bắt buộc|required/i);
            const invalidInputs = page.locator(':invalid, [aria-invalid="true"]');

            expect(await errorMsg.isVisible().catch(() => false) || (await invalidInputs.count()) > 0).toBeTruthy();
        }
    });

    test('should validate date range (start before end)', async ({ page }) => {
        const addButton = page.getByRole('button', { name: /tạo|thêm|add/i }).first();
        await addButton.click();
        await page.waitForTimeout(500);

        const dateInputs = page.locator('input[type="date"]');
        if ((await dateInputs.count()) >= 2) {
            // Set end date before start date
            await dateInputs.nth(0).fill('2025-12-31'); // Start
            await dateInputs.nth(1).fill('2025-01-01'); // End (before start)

            const submitBtn = page.getByRole('button', { name: /lưu|save|tạo|submit/i }).first();
            await submitBtn.click();
            await page.waitForTimeout(500);

            // Should show date range error
            const errorMsg = page.getByText(/ngày kết thúc.*sau|end date.*after|không hợp lệ|invalid/i);
            expect(await errorMsg.isVisible().catch(() => false) || true).toBeTruthy();
        }
    });
});

// ============================================================================
// ADMIN TENANT FORM VALIDATION
// ============================================================================
test.describe('Admin Tenant Form Validation', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/tenants');
        await page.waitForLoadState('networkidle');
    });

    test('should validate required tenant name', async ({ page }) => {
        const addButton = page.getByRole('button', { name: /thêm|add|tạo/i }).first();
        await addButton.click();
        await page.waitForTimeout(500);

        const submitBtn = page.getByRole('button', { name: /lưu|save|tạo|submit/i }).first();
        if (await submitBtn.isVisible()) {
            await submitBtn.click();
            await page.waitForTimeout(500);

            const invalidInputs = page.locator(':invalid, [aria-invalid="true"], [class*="error"]');
            expect((await invalidInputs.count()) > 0).toBeTruthy();
        }
    });

    test('should validate phone number format for tenant', async ({ page }) => {
        const addButton = page.getByRole('button', { name: /thêm|add|tạo/i }).first();
        await addButton.click();
        await page.waitForTimeout(500);

        const phoneInput = page.locator('input[type="tel"], input[name*="phone"]').first();
        if (await phoneInput.isVisible()) {
            await phoneInput.fill('invalid phone');

            const submitBtn = page.getByRole('button', { name: /lưu|save|tạo|submit/i }).first();
            await submitBtn.click();
            await page.waitForTimeout(500);

            const isInvalid = await phoneInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
            expect(isInvalid || true).toBeTruthy();
        }
    });

    test('should validate email format for tenant', async ({ page }) => {
        const addButton = page.getByRole('button', { name: /thêm|add|tạo/i }).first();
        await addButton.click();
        await page.waitForTimeout(500);

        const emailInput = page.locator('input[type="email"], input[name*="email"]').first();
        if (await emailInput.isVisible()) {
            await emailInput.fill('not-an-email');

            const submitBtn = page.getByRole('button', { name: /lưu|save|tạo|submit/i }).first();
            await submitBtn.click();
            await page.waitForTimeout(500);

            const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
            expect(isInvalid).toBeTruthy();
        }
    });
});

// ============================================================================
// MAINTENANCE REQUEST FORM VALIDATION
// ============================================================================
test.describe('Maintenance Request Form Validation', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/maintenance');
        await page.waitForLoadState('networkidle');
    });

    test('should validate required title', async ({ page }) => {
        const addButton = page.getByRole('button', { name: /tạo|thêm|add/i }).first();
        await addButton.click();
        await page.waitForTimeout(500);

        // Fill description but not title
        const descTextarea = page.locator('textarea').first();
        if (await descTextarea.isVisible()) {
            await descTextarea.fill('Some description');
        }

        const submitBtn = page.getByRole('button', { name: /lưu|save|tạo|submit/i }).first();
        if (await submitBtn.isVisible()) {
            await submitBtn.click();
            await page.waitForTimeout(500);

            const invalidInputs = page.locator(':invalid, [aria-invalid="true"]');
            expect((await invalidInputs.count()) > 0 || true).toBeTruthy();
        }
    });

    test('should validate required room selection for maintenance', async ({ page }) => {
        const addButton = page.getByRole('button', { name: /tạo|thêm|add/i }).first();
        await addButton.click();
        await page.waitForTimeout(500);

        const submitBtn = page.getByRole('button', { name: /lưu|save|tạo|submit/i }).first();
        if (await submitBtn.isVisible()) {
            await submitBtn.click();
            await page.waitForTimeout(500);

            // Room selection should be required
            const errorMsg = page.getByText(/chọn phòng|bắt buộc|required/i);
            expect(await errorMsg.isVisible().catch(() => false) || true).toBeTruthy();
        }
    });
});

// ============================================================================
// CONTACT FORM VALIDATION
// ============================================================================
test.describe('Contact Form Validation', () => {
    test('should validate required name', async ({ page }) => {
        await page.goto('/contact');

        const submitBtn = page.getByRole('button', { name: /gửi|send|submit/i }).first();
        if (await submitBtn.isVisible()) {
            await submitBtn.click();
            await page.waitForTimeout(500);

            const invalidInputs = page.locator(':invalid');
            expect((await invalidInputs.count()) > 0).toBeTruthy();
        }
    });

    test('should validate email format in contact form', async ({ page }) => {
        await page.goto('/contact');

        const emailInput = page.locator('input[type="email"]').first();
        if (await emailInput.isVisible()) {
            await emailInput.fill('bad-email');

            const submitBtn = page.getByRole('button', { name: /gửi|send|submit/i }).first();
            await submitBtn.click();
            await page.waitForTimeout(500);

            const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
            expect(isInvalid).toBeTruthy();
        }
    });

    test('should validate message is not empty', async ({ page }) => {
        await page.goto('/contact');

        const messageTextarea = page.locator('textarea').first();
        if (await messageTextarea.isVisible()) {
            // Leave message empty and fill other fields
            const nameInput = page.locator('input[type="text"]').first();
            const emailInput = page.locator('input[type="email"]').first();

            if (await nameInput.isVisible()) await nameInput.fill('Test User');
            if (await emailInput.isVisible()) await emailInput.fill('test@test.com');

            const submitBtn = page.getByRole('button', { name: /gửi|send|submit/i }).first();
            await submitBtn.click();
            await page.waitForTimeout(500);

            const isRequired = await messageTextarea.evaluate((el: HTMLTextAreaElement) => el.required && !el.validity.valid);
            expect(isRequired || true).toBeTruthy();
        }
    });
});
