import { ProcessedImage } from '../utils/imageProcessing';

export interface StorageService {
  uploadImage(image: ProcessedImage, path: string): Promise<UploadResult>;
  getPublicUrl(path: string): string;
  deleteImage(path: string): Promise<void>;
}

export interface UploadResult {
  path: string;
  publicUrl: string;
  size: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Mock Storage Service for development
export class MockStorageService implements StorageService {
  private mockDelay = 2000; // Simulate upload time

  async uploadImage(image: ProcessedImage, path: string): Promise<UploadResult> {
    // Simulate upload progress
    const progressCallback = (progress: UploadProgress) => {
      console.log(`Upload progress: ${progress.percentage}%`);
    };

    // Simulate chunks upload
    const chunks = 10;
    for (let i = 0; i <= chunks; i++) {
      await new Promise(resolve => setTimeout(resolve, this.mockDelay / chunks));
      progressCallback({
        loaded: (image.size / chunks) * i,
        total: image.size,
        percentage: (i / chunks) * 100
      });
    }

    // Return mock result
    const publicUrl = image.dataUrl; // In real implementation, this would be a URL
    return {
      path,
      publicUrl,
      size: image.size
    };
  }

  getPublicUrl(path: string): string {
    // In real implementation, generate signed URL
    return `https://mock-storage.nutriai.com/${path}`;
  }

  async deleteImage(path: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Deleted image: ${path}`);
  }
}

// Supabase Storage Service
export class SupabaseStorageService implements StorageService {
  private bucketName = 'meal-images';

  constructor(private supabaseClient: any) {}

  async uploadImage(
    image: ProcessedImage, 
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Upload to Supabase Storage
      const { data, error } = await this.supabaseClient.storage
        .from(this.bucketName)
        .upload(path, image.file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress: any) => {
            if (onProgress) {
              onProgress({
                loaded: progress.loaded,
                total: progress.total,
                percentage: Math.round((progress.loaded / progress.total) * 100)
              });
            }
          }
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const publicUrl = this.getPublicUrl(data.path);

      return {
        path: data.path,
        publicUrl,
        size: image.size
      };
    } catch (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
  }

  getPublicUrl(path: string): string {
    const { data } = this.supabaseClient.storage
      .from(this.bucketName)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  async deleteImage(path: string): Promise<void> {
    const { error } = await this.supabaseClient.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }
}

// Factory function
export function createStorageService(supabaseClient?: any): StorageService {
  if (supabaseClient && process.env.NODE_ENV === 'production') {
    return new SupabaseStorageService(supabaseClient);
  }
  
  return new MockStorageService();
}

// Utility function to generate unique path
export function generateImagePath(userId: string, mealType: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${userId}/${mealType}/${timestamp}_${random}.jpg`;
}