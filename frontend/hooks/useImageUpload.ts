import { useState, useCallback, useRef } from 'react';

interface ImageConfig {
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  aspectRatio?: number;
  multiple?: boolean;
}

interface ImageDimensions {
  width: number;
  height: number;
}

interface ProcessedImage {
  file: File;
  url: string;
  dimensions: ImageDimensions;
}

interface UseImageUploadReturn {
  images: ProcessedImage[];
  uploading: boolean;
  error: string | null;
  handleImageUpload: (files: FileList | null) => Promise<void>;
  handleImageDrop: (event: React.DragEvent) => Promise<void>;
  removeImage: (index: number) => void;
  clearImages: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const defaultConfig: ImageConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  multiple: false,
};

export const useImageUpload = (config: ImageConfig = {}): UseImageUploadReturn => {
  const {
    maxSize,
    acceptedTypes,
    maxWidth,
    maxHeight,
    quality,
    aspectRatio,
    multiple,
  } = { ...defaultConfig, ...config };

  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!acceptedTypes?.includes(file.type)) {
      return 'Invalid file type';
    }

    if (maxSize && file.size > maxSize) {
      return `File size must be less than ${maxSize / 1024 / 1024}MB`;
    }

    return null;
  };

  // Get image dimensions
  const getImageDimensions = (file: File): Promise<ImageDimensions> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
    });
  };

  // Resize image if needed
  const resizeImage = async (
    file: File,
    dimensions: ImageDimensions
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(img.src);

        let { width, height } = dimensions;

        // Calculate new dimensions while maintaining aspect ratio
        if (maxWidth && width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (maxHeight && height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Apply aspect ratio if specified
        if (aspectRatio) {
          if (width / height > aspectRatio) {
            width = height * aspectRatio;
          } else {
            height = width / aspectRatio;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
    });
  };

  // Process single image
  const processImage = async (file: File): Promise<ProcessedImage> => {
    const validationError = validateFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    const dimensions = await getImageDimensions(file);
    let processedFile = file;

    // Resize if needed
    if (
      (maxWidth && dimensions.width > maxWidth) ||
      (maxHeight && dimensions.height > maxHeight) ||
      aspectRatio
    ) {
      const resizedBlob = await resizeImage(file, dimensions);
      processedFile = new File([resizedBlob], file.name, {
        type: file.type,
      });
    }

    return {
      file: processedFile,
      url: URL.createObjectURL(processedFile),
      dimensions: await getImageDimensions(processedFile),
    };
  };

  // Handle file upload
  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return;

    setError(null);
    setUploading(true);

    try {
      const processedImages = await Promise.all(
        Array.from(files).map(processImage)
      );

      setImages((prev) =>
        multiple ? [...prev, ...processedImages] : processedImages
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  // Handle drag and drop
  const handleImageDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    await handleImageUpload(files);
  };

  // Remove image
  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].url);
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  // Clear all images
  const clearImages = useCallback(() => {
    images.forEach((image) => URL.revokeObjectURL(image.url));
    setImages([]);
  }, [images]);

  return {
    images,
    uploading,
    error,
    handleImageUpload,
    handleImageDrop,
    removeImage,
    clearImages,
    inputRef,
  };
};

export default useImageUpload;
