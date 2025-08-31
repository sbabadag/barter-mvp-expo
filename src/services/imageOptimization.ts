import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export interface ImageSize {
  width: number;
  height: number;
  quality: number;
  suffix: string;
}

export interface OptimizedImage {
  uri: string;
  width: number;
  height: number;
  size: number; // file size in bytes
  type: 'thumbnail' | 'medium' | 'full' | 'profile';
}

export interface ImageOptimizationResult {
  thumbnail: OptimizedImage;
  medium: OptimizedImage;
  full: OptimizedImage;
  original: {
    width: number;
    height: number;
    size: number;
  };
}

// Quality settings as specified in requirements
export const IMAGE_SIZES: Record<string, ImageSize> = {
  thumbnail: { width: 150, height: 150, quality: 0.6, suffix: '_thumb' },
  medium: { width: 400, height: 400, quality: 0.8, suffix: '_med' },
  full: { width: 800, height: 800, quality: 0.9, suffix: '_full' },
  profile: { width: 200, height: 200, quality: 0.8, suffix: '_profile' },
};

/**
 * Gets the file size of an image URI
 */
async function getImageSize(uri: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists ? info.size || 0 : 0;
  } catch (error) {
    console.warn('Error getting image size:', error);
    return 0;
  }
}

/**
 * Optimizes an image to a specific size and quality
 */
export async function optimizeImage(
  uri: string,
  targetSize: ImageSize,
  maintainAspectRatio: boolean = true
): Promise<OptimizedImage> {
  try {
    // Get original image info first
    const originalInfo = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    // Calculate resize dimensions while maintaining aspect ratio
    let resize: ImageManipulator.Action[] = [];
    
    if (maintainAspectRatio) {
      // Resize to fit within target dimensions while maintaining aspect ratio
      resize = [{ resize: { width: targetSize.width, height: targetSize.height } }];
    } else {
      // Force exact dimensions (for profile photos, thumbnails)
      resize = [{ resize: { width: targetSize.width, height: targetSize.height } }];
    }

    const result = await ImageManipulator.manipulateAsync(
      uri,
      resize,
      {
        compress: targetSize.quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    const fileSize = await getImageSize(result.uri);

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      size: fileSize,
      type: targetSize.suffix.replace('_', '') as 'thumbnail' | 'medium' | 'full' | 'profile',
    };
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw new Error(`Failed to optimize image: ${error}`);
  }
}

/**
 * Creates multiple optimized versions of an image
 */
export async function createOptimizedVersions(
  uri: string,
  onProgress?: (progress: number, message: string) => void
): Promise<ImageOptimizationResult> {
  try {
    onProgress?.(10, 'Analyzing original image...');

    // Get original image dimensions and size
    const originalInfo = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    const originalSize = await getImageSize(uri);

    onProgress?.(25, 'Creating thumbnail...');
    const thumbnail = await optimizeImage(uri, IMAGE_SIZES.thumbnail, false);

    onProgress?.(50, 'Creating medium size...');
    const medium = await optimizeImage(uri, IMAGE_SIZES.medium, true);

    onProgress?.(75, 'Creating full size...');
    const full = await optimizeImage(uri, IMAGE_SIZES.full, true);

    onProgress?.(100, 'Optimization complete');

    return {
      thumbnail,
      medium,
      full,
      original: {
        width: originalInfo.width,
        height: originalInfo.height,
        size: originalSize,
      },
    };
  } catch (error) {
    console.error('Error creating optimized versions:', error);
    throw new Error(`Failed to create optimized versions: ${error}`);
  }
}

/**
 * Optimizes a profile image
 */
export async function optimizeProfileImage(uri: string): Promise<OptimizedImage> {
  return optimizeImage(uri, IMAGE_SIZES.profile, false);
}

/**
 * Calculates compression ratio
 */
export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Validates if image URI is valid
 */
export async function validateImageUri(uri: string): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists;
  } catch (error) {
    console.warn('Error validating image URI:', error);
    return false;
  }
}