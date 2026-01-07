import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { uploadFile, deleteFile, generateFilePath, BUCKETS } from '@/lib/storage';

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/rooms/[id]/images - Upload room images
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { user, error } = await withAuth(request, ['LANDLORD', 'ADMIN']);
        if (error) return error;

        const { id } = await params;

        // Check room exists and user has access
        const room = await prisma.room.findUnique({
            where: { id },
            include: { motel: { select: { ownerId: true } } },
        });

        if (!room) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy phòng' } },
                { status: 404 }
            );
        }

        if (user!.role === 'LANDLORD' && room.motel.ownerId !== user!.id) {
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uploadedImages: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errors: any[] = [];

        // Get current max sort order
        const maxSort = await prisma.roomImage.aggregate({
            where: { roomId: id },
            _max: { sortOrder: true },
        });
        let sortOrder = (maxSort._max.sortOrder || 0) + 1;

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                errors.push({ file: file.name, error: 'Không phải file ảnh' });
                continue;
            }

            if (file.size > 5 * 1024 * 1024) {
                errors.push({ file: file.name, error: 'File vượt quá 5MB' });
                continue;
            }

            const path = generateFilePath('rooms', file.name, id);
            const { url, error: uploadError } = await uploadFile(BUCKETS.ROOM_IMAGES, path, file);

            if (uploadError || !url) {
                errors.push({ file: file.name, error: uploadError?.message || 'Lỗi tải lên' });
                continue;
            }

            if (isPrimary && uploadedImages.length === 0) {
                await prisma.roomImage.updateMany({
                    where: { roomId: id, isPrimary: true },
                    data: { isPrimary: false },
                });
            }

            const image = await prisma.roomImage.create({
                data: {
                    roomId: id,
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
        console.error('Upload room images error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' } },
            { status: 500 }
        );
    }
}

// GET /api/rooms/[id]/images - List room images
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const images = await prisma.roomImage.findMany({
            where: { roomId: id },
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        });

        return NextResponse.json({
            success: true,
            data: images,
        });
    } catch (error) {
        console.error('Get room images error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' } },
            { status: 500 }
        );
    }
}

// DELETE /api/rooms/[id]/images - Delete room image
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

        const image = await prisma.roomImage.findUnique({
            where: { id: imageId },
            include: { room: { include: { motel: { select: { ownerId: true } } } } },
        });

        if (!image || image.roomId !== id) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy ảnh' } },
                { status: 404 }
            );
        }

        if (user!.role === 'LANDLORD' && image.room.motel.ownerId !== user!.id) {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xóa ảnh này' } },
                { status: 403 }
            );
        }

        const urlParts = image.imageUrl.split('/');
        const pathIndex = urlParts.indexOf(BUCKETS.ROOM_IMAGES);
        if (pathIndex !== -1) {
            const path = urlParts.slice(pathIndex + 1).join('/');
            await deleteFile(BUCKETS.ROOM_IMAGES, path);
        }

        await prisma.roomImage.delete({ where: { id: imageId } });

        return NextResponse.json({
            success: true,
            message: 'Xóa ảnh thành công',
        });
    } catch (error) {
        console.error('Delete room image error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi' } },
            { status: 500 }
        );
    }
}
