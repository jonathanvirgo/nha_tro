import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
    if (supabaseClient) return supabaseClient;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL and Key are required. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.');
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey);
    return supabaseClient;
}

export const BUCKETS = {
    MOTEL_IMAGES: 'motel-images',
    ROOM_IMAGES: 'room-images',
    CONTRACT_FILES: 'contract-files',
    MAINTENANCE_IMAGES: 'maintenance-images',
    AVATARS: 'avatars',
} as const;

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS];

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
    bucket: BucketName,
    path: string,
    file: File | Blob,
    options?: { contentType?: string; upsert?: boolean }
): Promise<{ url: string | null; error: Error | null }> {
    try {
        const { data, error } = await getSupabaseClient().storage
            .from(bucket)
            .upload(path, file, {
                contentType: options?.contentType,
                upsert: options?.upsert ?? false,
            });

        if (error) {
            console.error('Upload error:', error);
            return { url: null, error: new Error(error.message) };
        }

        // Get public URL
        const { data: urlData } = getSupabaseClient().storage.from(bucket).getPublicUrl(data.path);

        return { url: urlData.publicUrl, error: null };
    } catch (error) {
        console.error('Upload error:', error);
        return { url: null, error: error as Error };
    }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
    bucket: BucketName,
    path: string
): Promise<{ success: boolean; error: Error | null }> {
    try {
        const { error } = await getSupabaseClient().storage.from(bucket).remove([path]);

        if (error) {
            console.error('Delete error:', error);
            return { success: false, error: new Error(error.message) };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: error as Error };
    }
}

/**
 * Get signed URL for private files
 */
export async function getSignedUrl(
    bucket: BucketName,
    path: string,
    expiresIn: number = 3600
): Promise<{ url: string | null; error: Error | null }> {
    try {
        const { data, error } = await getSupabaseClient().storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);

        if (error) {
            return { url: null, error: new Error(error.message) };
        }

        return { url: data.signedUrl, error: null };
    } catch (error) {
        return { url: null, error: error as Error };
    }
}

/**
 * Generate unique file path
 */
export function generateFilePath(
    folder: string,
    filename: string,
    entityId?: string
): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = filename.split('.').pop() || '';
    const baseName = filename.replace(/\.[^/.]+$/, '').slice(0, 20);

    const parts = [folder];
    if (entityId) parts.push(entityId);
    parts.push(`${baseName}-${timestamp}-${randomStr}.${ext}`);

    return parts.join('/');
}

/**
 * Validate file type and size
 */
export function validateFile(
    file: File,
    options: {
        maxSizeMB?: number;
        allowedTypes?: string[];
    } = {}
): { valid: boolean; error?: string } {
    const { maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;

    if (file.size > maxSizeMB * 1024 * 1024) {
        return { valid: false, error: `File vượt quá ${maxSizeMB}MB` };
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return { valid: false, error: `Loại file không được phép. Chấp nhận: ${allowedTypes.join(', ')}` };
    }

    return { valid: true };
}
