import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    url: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
}

export async function uploadImage(
    file: Buffer | string,
    folder: string = 'nhatro'
): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder,
            resource_type: 'image' as const,
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
            ],
        };

        if (typeof file === 'string' && file.startsWith('data:')) {
            // Base64 upload
            cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
                if (error) reject(error);
                else resolve(result as CloudinaryUploadResult);
            });
        } else if (Buffer.isBuffer(file)) {
            // Buffer upload
            cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) reject(error);
                else resolve(result as CloudinaryUploadResult);
            }).end(file);
        } else {
            reject(new Error('Invalid file format'));
        }
    });
}

export async function deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) reject(error);
            else resolve();
        });
    });
}

export function getOptimizedUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    crop?: string;
}): string {
    return cloudinary.url(publicId, {
        fetch_format: 'auto',
        quality: 'auto',
        ...options,
    });
}
