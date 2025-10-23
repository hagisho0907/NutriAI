import { useState, useCallback } from 'react';
import { ProcessedImage } from '../utils/imageProcessing';
import { createStorageService, generateImagePath, UploadProgress } from '../services/storage';
import { createVisionService, VisionAnalysisResult } from '../services/vision';
import { toast } from 'sonner';

interface UseImageUploadOptions {
  userId: string;
  mealType: string;
  onAnalysisComplete?: (result: VisionAnalysisResult) => void;
}

interface UseImageUploadReturn {
  uploadAndAnalyze: (image: ProcessedImage, description?: string) => Promise<VisionAnalysisResult | null>;
  isUploading: boolean;
  isAnalyzing: boolean;
  uploadProgress: number;
  error: Error | null;
  reset: () => void;
}

export function useImageUpload({
  userId,
  mealType,
  onAnalysisComplete
}: UseImageUploadOptions): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const storageService = createStorageService();
  const visionService = createVisionService();

  const uploadAndAnalyze = useCallback(async (
    image: ProcessedImage,
    description?: string
  ): Promise<VisionAnalysisResult | null> => {
    setError(null);
    setUploadProgress(0);

    try {
      // Step 1: Upload image to storage
      setIsUploading(true);
      const imagePath = generateImagePath(userId, mealType);
      
      const uploadResult = await storageService.uploadImage(
        image,
        imagePath,
        (progress: UploadProgress) => {
          setUploadProgress(progress.percentage);
        }
      );

      toast.success(`画像をアップロードしました (${(uploadResult.size / 1024).toFixed(1)}KB)`);

      // Step 2: Analyze image
      setIsUploading(false);
      setIsAnalyzing(true);
      
      const analysisResult = await visionService.analyzeFood(image, description);
      
      // Add uploaded image URL to result
      const resultWithUrl = {
        ...analysisResult,
        imageUrl: uploadResult.publicUrl
      };

      const providerLabel = analysisResult.provider === 'gemini' ? 'Gemini' : 'モックAI';

      if (analysisResult.fallback) {
        toast.warning('AI推定は参考値です', {
          description: `${providerLabel}が利用できなかったためモック結果を表示しています`
        });
      } else {
        toast.success(`AI分析が完了しました (${analysisResult.items.length}個の食品を検出)`, {
          description: `${providerLabel}の推定結果です`
        });
      }

      if (onAnalysisComplete) {
        onAnalysisComplete(resultWithUrl);
      }

      return resultWithUrl;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(err as Error);
      
      toast.error(errorMessage);
      
      return null;
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  }, [userId, mealType, storageService, visionService, onAnalysisComplete]);

  const reset = useCallback(() => {
    setIsUploading(false);
    setIsAnalyzing(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  return {
    uploadAndAnalyze,
    isUploading,
    isAnalyzing,
    uploadProgress,
    error,
    reset
  };
}
