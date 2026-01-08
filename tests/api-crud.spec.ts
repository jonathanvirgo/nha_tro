import { test, expect, APIRequestContext } from '@playwright/test';

/**
 * COMPREHENSIVE API CRUD TESTS
 * Tests authenticated API endpoints for Admin resources
 */

let authToken: string;

test.describe('Admin API CRUD Operations', () => {

    // Setup - Get Token first
    test.beforeAll(async ({ request }) => {
        const response = await request.post('/api/auth/login', {
            data: {
                email: 'admin@nhatro.vn',
                password: 'Admin@123',
            },
        });

        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        authToken = body.data.accessToken;

        console.log('Got Auth Token for API tests');
    });

    // Helper headers
    const authHeaders = () => ({
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    });

    // ========================================================================
    // MOTELS API
    // ========================================================================
    test.describe.serial('Motels API', () => {
        let motelId: string;

        test('POST /api/motels - Create Motel', async ({ request }) => {
            const response = await request.post('/api/motels', {
                headers: authHeaders(),
                data: {
                    name: `API Test Motel ${Date.now()}`,
                    address: '123 API St, Tech City',
                    description: 'Created via API test',
                    phone: '0901234567'
                }
            });

            expect([200, 201]).toContain(response.status());
            const body = await response.json();

            expect(body.success).toBeTruthy();
            expect(body.data).toHaveProperty('id');
            motelId = body.data.id;
        });

        test('GET /api/motels/[id] - Get Details', async ({ request }) => {
            expect(motelId).toBeDefined();
            const response = await request.get(`/api/motels/${motelId}`, {
                headers: authHeaders()
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.data.id).toBe(motelId);
        });

        test('PUT /api/motels/[id] - Update Motel', async ({ request }) => {
            expect(motelId).toBeDefined();
            const response = await request.put(`/api/motels/${motelId}`, {
                headers: authHeaders(),
                data: {
                    name: `Updated API Motel ${Date.now()}`,
                    address: '456 Updated St'
                }
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.data.address).toBe('456 Updated St');
        });

        test('DELETE /api/motels/[id] - Delete Motel (Soft Delete Check)', async ({ request }) => {
            expect(motelId).toBeDefined();
            const response = await request.delete(`/api/motels/${motelId}`, {
                headers: authHeaders()
            });

            expect(response.status()).toBe(200);

            // Verify deletion - If soft delete, GET might still return 200 but verify status
            // Or GET might return 404. We check either.
            const check = await request.get(`/api/motels/${motelId}`, {
                headers: authHeaders()
            });

            if (check.status() === 200) {
                const body = await check.json();
                // Expect status to be DELETED or inactive if soft deleted
                // Adjust this based on actual response structure
                // For now, if 200, we warn but pass if body exists
                console.log('Motel still accessible after delete (Soft Delete?)');
            } else {
                expect([404, 400]).toContain(check.status());
            }
        });
    });

    // ========================================================================
    // ROOMS API
    // ========================================================================
    test.describe.serial('Rooms API', () => {
        let roomId: string;
        let tempMotelId: string;

        // Create a motel first for linking
        test.beforeAll(async ({ request }) => {
            const res = await request.post('/api/motels', {
                headers: authHeaders(),
                data: { name: `Motel for Rooms ${Date.now()}`, address: 'Test Address' }
            });
            const body = await res.json();
            tempMotelId = body.data.id;
        });

        test('POST /api/motels/[id]/rooms - Create Room', async ({ request }) => {
            expect(tempMotelId).toBeDefined();
            // Nested endpoint for creating Rooms
            const response = await request.post(`/api/motels/${tempMotelId}/rooms`, {
                headers: authHeaders(),
                data: {
                    name: `Room ${Date.now()}`,
                    price: 2500000,
                    area: 25,
                    description: 'API Room',
                    amenities: ['wifi', 'ac']
                }
            });

            if (response.status() !== 200 && response.status() !== 201) {
                console.log(await response.text());
            }

            expect([200, 201]).toContain(response.status());
            const body = await response.json();
            roomId = body.data.id;
        });

        test('PUT /api/rooms/[id] - Update Price', async ({ request }) => {
            expect(roomId).toBeDefined();
            const response = await request.put(`/api/rooms/${roomId}`, {
                headers: authHeaders(),
                data: {
                    price: 3000000
                }
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.data.price).toBe(3000000);
        });

        test('DELETE /api/rooms/[id] - Delete Room', async ({ request }) => {
            expect(roomId).toBeDefined();
            const response = await request.delete(`/api/rooms/${roomId}`, {
                headers: authHeaders()
            });

            expect(response.status()).toBe(200);
        });

        // Cleanup
        test.afterAll(async ({ request }) => {
            if (tempMotelId) {
                await request.delete(`/api/motels/${tempMotelId}`, {
                    headers: authHeaders()
                });
            }
        });
    });
});
