import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { uploadFile, deleteFile, generateFilePath, BUCKETS } from '@/lib/storage';

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/motels/[id]/images - Upload motel images
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'ADMIN']);
        if (error) return error;

        const { id } = await params;

        // Check motel exists and user has access
        const motel = await prisma.motel.findUnique({
            where: { id },
            select: { ownerId: true },
        });

        if (!motel) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy nhà trọ' } },
                { status: 404 }
            );
        }

        if (user!.role === 'LANDLORD' && motel.ownerId !== user!.id) {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền thêm ảnh' } },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const files = formData.getAll('images') as File[];
        const isPrimary = formData.get('isPrimary') === 'true';

        if (!files || files.length === 0) {
            return NextResponse.json(
                { success: false, error: { code: 'NO_FILES', message: 'Không có file nào được tải lên' } },
                { status: 400 }
            );
        }

        // Validate files
        const maxFiles = 10;
        if (files.length > maxFiles) {
            return NextResponse.json(
                { success: false, error: { code: 'TOO_MANY_FILES', message: `Tối đa ${maxFiles} ảnh` } },
                { status: 400 }
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uploadedImages: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errors: any[] = [];

        // Get current max sort order
        const maxSort = await prisma.motelImage.aggregate({
            where: { motelId: id },
            _max: { sortOrder: true },
        });
        let sortOrder = (maxSort._max.sortOrder || 0) + 1;

        for (const file of files) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                errors.push({ file: file.name, error: 'Không phải file ảnh' });
                continue;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                errors.push({ file: file.name, error: 'File vượt quá 5MB' });
                continue;
            }

            // Upload to storage
            const path = generateFilePath('motels', file.name, id);
            const { url, error: uploadError } = await uploadFile(BUCKETS.MOTEL_IMAGES, path, file);

            if (uploadError || !url) {
                errors.push({ file: file.name, error: uploadError?.message || 'Lỗi tải lên' });
                continue;
            }

            // If isPrimary, unset other primary images
            if (isPrimary && uploadedImages.length === 0) {
                await prisma.motelImage.updateMany({
                    where: { motelId: id, isPrimary: true },
                    data: { isPrimary: false },
                });
            }

            // Save to database
            const image = await prisma.motelImage.create({
                data: {
                    motelId: id,
                    imageUrl: url,
                    isPrimary: isPrimary && uploadedImages.length === 0,
                    sortOrder: sortOrder++,
                },
            });

            uploadedImages.push(image);
        }

        return NextResponse.json({
            success: true,
            data: {
                uploaded: uploadedImages,
                errors: errors.length > 0 ? errors : undefined,
            },
            message: `Đã tải lên ${uploadedImages.length}/${files.length} ảnh`,
        });
    } catch (error) {
        console.error('Upload motel images error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' } },
            { status: 500 }
        );
    }
}

// GET /api/motels/[id]/images - List motel images
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const images = await prisma.motelImage.findMany({
            where: { motelId: id },
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        });

        return NextResponse.json({
            success: true,
            data: images,
        });
    } catch (error) {
        console.error('Get motel images error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' } },
            { status: 500 }
        );
    }
}

// DELETE /api/motels/[id]/images - Delete motel image
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'ADMIN']);
        if (error) return error;

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const imageId = searchParams.get('imageId');

        if (!imageId) {
            return NextResponse.json(
                { success: false, error: { code: 'MISSING_IMAGE_ID', message: 'Thiếu imageId' } },
                { status: 400 }
            );
        }

        const image = await prisma.motelImage.findUnique({
            where: { id: imageId },
            include: { motel: { select: { ownerId: true } } },
        });

        if (!image || image.motelId !== id) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy ảnh' } },
                { status: 404 }
            );
        }

        if (user!.role === 'LANDLORD' && image.motel.ownerId !== user!.id) {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xóa ảnh này' } },
                { status: 403 }
            );
        }

        // Extract path from URL for storage deletion
        const urlParts = image.imageUrl.split('/');
        const pathIndex = urlParts.indexOf(BUCKETS.MOTEL_IMAGES);
        if (pathIndex !== -1) {
            const path = urlParts.slice(pathIndex + 1).join('/');
            await deleteFile(BUCKETS.MOTEL_IMAGES, path);
        }

        // Delete from database
        await prisma.motelImage.delete({ where: { id: imageId } });

        return NextResponse.json({
            success: true,
            message: 'Xóa ảnh thành công',
        });
    } catch (error) {
        console.error('Delete motel image error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' } },
            { status: 500 }
        );
    }
}
