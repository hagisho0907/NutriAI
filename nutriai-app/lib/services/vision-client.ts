import { ProcessedImage } from '../utils/imageProcessing';
import { VisionAnalysisResult, VisionService } from './vision';

// Client-side vision service that uses API route
export class ClientVisionService implements VisionService {
  async analyzeFood(image: ProcessedImage, description?: string): Promise<VisionAnalysisResult> {
    const formData = new FormData();
    formData.append('image', image.file);
    if (description) formData.append('description', description);
    formData.append('userId', 'current-user'); // TODO: Get from auth context
    formData.append('mealType', 'lunch'); // TODO: Get from context

    const response = await fetch('/api/vision/analyze', {
      method: 'POST',
      body: formData,
    });

    let result;
    try {
      result = await response.json();
    } catch (e) {
      console.error('❌ レスポンスのパースエラー:', e);
      throw new Error(`API error: ${response.status} - Response parsing failed`);
    }

    if (!response.ok) {
      console.error('❌ APIエラーレスポンス:', {
        status: response.status,
        statusText: response.statusText,
        result: result
      });
      throw new Error(result.details || result.error || `API error: ${response.status}`);
    }
    
    if (!result.success) {
      console.error('❌ 解析失敗:', result);
      throw new Error(result.details || result.error || 'Analysis failed');
    }

    if (result.meta) {
      console.info('ℹ️ Vision meta情報:', result.meta);
    }

    const analysis: VisionAnalysisResult = {
      ...result.data,
      provider: result.data.provider ?? result.meta?.provider ?? 'gemini',
      fallback: result.data.fallback ?? Boolean(result.meta?.fallback),
    };

    return analysis;
  }
}

// Factory function for client-side usage
export function createClientVisionService(): VisionService {
  return new ClientVisionService();
}
