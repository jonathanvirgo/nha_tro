'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface ImageUploadProps {
    images: string[];
    onChange: (images: string[]) => void;
    maxImages?: number;
    folder?: string;
    className?: string;
}

interface UploadedImage {
    url: string;
    publicId?: string;
}

export function ImageUpload({
    images,
    onChange,
    maxImages = 5,
    folder = 'nhatro',
    className = '',
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const uploadFile = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                return result.data.url;
            } else {
                throw new Error(result.error?.message || 'Upload failed');
            }
        } catch (error: any) {
            toast.error(`Upload failed: ${error.message}`);
            return null;
        }
    };

    const handleFiles = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        const remainingSlots = maxImages - images.length;

        if (fileArray.length > remainingSlots) {
            toast.warning(`Chỉ có thể upload thêm ${remainingSlots} ảnh`);
            fileArray.splice(remainingSlots);
        }

        if (fileArray.length === 0) return;

        setIsUploading(true);

        const uploadPromises = fileArray.map(file => uploadFile(file));
        const results = await Promise.all(uploadPromises);
        const successfulUploads = results.filter((url): url is string => url !== null);

        if (successfulUploads.length > 0) {
            onChange([...images, ...successfulUploads]);
            toast.success(`Đã upload ${successfulUploads.length} ảnh`);
        }

        setIsUploading(false);
    }, [images, maxImages, onChange, folder]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    }, [handleFiles]);

    const removeImage = useCallback((index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);
    }, [images, onChange]);

    const canUploadMore = images.length < maxImages;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Current Images */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((url, index) => (
                        <div key={index} className="relative aspect-square group">
                            <Image
                                src={url}
                                alt={`Image ${index + 1}`}
                                fill
                                className="object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            {index === 0 && (
                                <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-primary text-white text-xs rounded">
                                    Ảnh chính
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Area */}
            {canUploadMore && (
                <Card
                    className={`border-2 border-dashed transition-colors ${dragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-primary/50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="p-6">
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            onChange={handleInputChange}
                            className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center text-center">
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                                    <p className="text-sm text-muted-foreground">Đang upload...</p>
                                </>
                            ) : (
                                <>
                                    <div className="mb-3 p-3 bg-muted rounded-full">
                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium mb-1">
                                        Kéo thả ảnh vào đây hoặc
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => inputRef.current?.click()}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Chọn ảnh
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        JPEG, PNG, WebP, GIF (tối đa 5MB) • Còn {maxImages - images.length} ảnh
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
