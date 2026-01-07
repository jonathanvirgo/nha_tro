import { NextResponse } from 'next/server';

// POST /api/auth/logout - Logout user
export async function POST() {
    // For JWT-based auth, logout is handled client-side by removing the token
    // This endpoint can be used to invalidate refresh tokens if implemented
    return NextResponse.json({
        success: true,
        message: 'Đăng xuất thành công',
    });
}
