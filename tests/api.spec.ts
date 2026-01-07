import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
    test.describe('Rooms API', () => {
        test('GET /api/rooms should return rooms list', async ({ request }) => {
            const response = await request.get('/api/rooms');

            expect(response.ok()).toBeTruthy();

            const data = await response.json();
            expect(data).toHaveProperty('success', true);
            expect(data).toHaveProperty('data');
            expect(Array.isArray(data.data)).toBeTruthy();
        });

        test('GET /api/rooms with pagination', async ({ request }) => {
            const response = await request.get('/api/rooms?page=1&limit=5');

            expect(response.ok()).toBeTruthy();

            const data = await response.json();
            expect(data).toHaveProperty('pagination');
            expect(data.pagination).toHaveProperty('page');
            expect(data.pagination).toHaveProperty('limit');
        });
    });

    test.describe('Motels API', () => {
        test('GET /api/motels should return motels list', async ({ request }) => {
            const response = await request.get('/api/motels');

            expect(response.ok()).toBeTruthy();

            const data = await response.json();
            expect(data).toHaveProperty('success', true);
            expect(data).toHaveProperty('data');
        });
    });

    test.describe('Search API', () => {
        test('GET /api/search/rooms should work with query', async ({ request }) => {
            const response = await request.get('/api/search/rooms?q=studio');

            expect(response.ok()).toBeTruthy();

            const data = await response.json();
            expect(data).toHaveProperty('success');
        });

        test('GET /api/search/rooms with filters', async ({ request }) => {
            const response = await request.get('/api/search/rooms?minPrice=1000000&maxPrice=5000000');

            expect(response.ok()).toBeTruthy();

            const data = await response.json();
            expect(data).toHaveProperty('success');
        });
    });

    test.describe('Auth API', () => {
        test('POST /api/auth/login with invalid credentials should return error', async ({ request }) => {
            const response = await request.post('/api/auth/login', {
                data: {
                    email: 'invalid@test.com',
                    password: 'wrongpassword',
                },
            });

            expect(response.status()).toBe(401);

            const data = await response.json();
            expect(data).toHaveProperty('success', false);
        });

        test('POST /api/auth/login with valid credentials should succeed', async ({ request }) => {
            const response = await request.post('/api/auth/login', {
                data: {
                    email: 'admin@nhatro.vn',
                    password: 'Admin@123',
                },
            });

            expect(response.ok()).toBeTruthy();

            const data = await response.json();
            expect(data).toHaveProperty('success', true);
            expect(data.data).toHaveProperty('user');
        });
    });

    test.describe('Utilities API', () => {
        test('GET /api/utilities should return utilities list', async ({ request }) => {
            const response = await request.get('/api/utilities');

            expect(response.ok()).toBeTruthy();

            const data = await response.json();
            expect(data).toHaveProperty('success', true);
            expect(data).toHaveProperty('data');
            expect(Array.isArray(data.data)).toBeTruthy();
        });
    });
});
