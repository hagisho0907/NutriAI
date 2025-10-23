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

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Analysis failed');
    }

    return result.data;
  }
}

// Factory function for client-side usage
export function createClientVisionService(): VisionService {
  return new ClientVisionService();
}