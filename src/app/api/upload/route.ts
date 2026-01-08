import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'nhatro';

        if (!file) {
            return NextResponse.json(
                { success: false, error: { message: 'No file provided' } },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: { message: 'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.' } },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: { message: 'File size too large. Maximum 5MB allowed.' } },
                { status: 400 }
            );
        }

        // Convert to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await uploadImage(buffer, folder);

        return NextResponse.json({
            success: true,
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
            }
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: { message: error.message || 'Upload failed' } },
            { status: 500 }
        );
    }
}
