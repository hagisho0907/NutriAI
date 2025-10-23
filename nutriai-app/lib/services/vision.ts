import { ProcessedImage } from '../utils/imageProcessing';
import { VisionAnalysisError, APIError } from '../utils/errorHandling';
import { retryVisionAnalysis } from '../utils/retry';

export interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  confidence: number;
}

export interface VisionAnalysisResult {
  items: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  overallConfidence: number;
  analysisId: string;
  processedAt: Date;
}

export interface VisionService {
  analyzeFood(image: ProcessedImage, description?: string): Promise<VisionAnalysisResult>;
}

// Mock implementation for development
export class MockVisionService implements VisionService {
  async analyzeFood(image: ProcessedImage, description?: string): Promise<VisionAnalysisResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock data based on description or random
    const mockFoods = [
      { name: 'ご飯', quantity: 150, unit: 'g', multiplier: 1.68 },
      { name: '鶏胸肉', quantity: 100, unit: 'g', multiplier: 1.65 },
      { name: 'サラダ', quantity: 80, unit: 'g', multiplier: 0.2 },
      { name: '味噌汁', quantity: 200, unit: 'ml', multiplier: 0.3 },
      { name: '卵焼き', quantity: 60, unit: 'g', multiplier: 1.5 }
    ];
    
    // Randomly select 1-3 items
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedItems = mockFoods
      .sort(() => Math.random() - 0.5)
      .slice(0, numItems);
    
    const items: FoodItem[] = selectedItems.map(food => {
      const baseCalories = food.quantity * food.multiplier;
      const protein = baseCalories * 0.15 / 4; // 15% from protein
      const fat = baseCalories * 0.25 / 9; // 25% from fat
      const carbs = baseCalories * 0.6 / 4; // 60% from carbs
      
      return {
        name: food.name,
        quantity: food.quantity,
        unit: food.unit,
        calories: Math.round(baseCalories),
        protein: Math.round(protein * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        confidence: Math.round((0.7 + Math.random() * 0.25) * 100) / 100
      };
    });
    
    const totals = items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        fat: acc.fat + item.fat,
        carbs: acc.carbs + item.carbs
      }),
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
    
    const overallConfidence = 
      items.reduce((sum, item) => sum + item.confidence, 0) / items.length;
    
    return {
      items,
      totalCalories: Math.round(totals.calories),
      totalProtein: Math.round(totals.protein * 10) / 10,
      totalFat: Math.round(totals.fat * 10) / 10,
      totalCarbs: Math.round(totals.carbs * 10) / 10,
      overallConfidence: Math.round(overallConfidence * 100) / 100,
      analysisId: `mock-${Date.now()}`,
      processedAt: new Date()
    };
  }
}

// Replicate service implementation
export class ReplicateVisionService implements VisionService {
  constructor(private apiKey: string) {}
  
  async analyzeFood(image: ProcessedImage, description?: string): Promise<VisionAnalysisResult> {
    return retryVisionAnalysis(async () => {
      try {
        // Convert image to base64 for API call
        const base64Image = await this.imageToBase64(image);
        
        // Call Replicate API
        const response = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: 'andreasjansson/blip-2:4b32258c42e9efd4288bb9910bc532a69727f9acd26aa08e175713a0a857a608',
            input: {
              image: base64Image,
              question: this.buildPrompt(description),
            },
          }),
        });

        if (!response.ok) {
          throw new APIError(
            `Replicate API error: ${response.status}`,
            response.status,
            response.status >= 500
          );
        }

        const prediction = await response.json();
        
        // Poll for results
        const result = await this.pollForResult(prediction.urls.get);
        
        // Parse and structure the response
        return this.parseAnalysisResult(result.output, description);
        
      } catch (error) {
        if (error instanceof APIError) {
          throw error;
        }
        throw new VisionAnalysisError(`Failed to analyze image: ${error}`);
      }
    });
  }

  private async imageToBase64(image: ProcessedImage): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to convert image to base64'));
      reader.readAsDataURL(image.file);
    });
  }

  private buildPrompt(description?: string): string {
    let prompt = 'Identify all food items in this image with their estimated portions. List each item with quantity and unit.';
    
    if (description) {
      prompt += ` Additional context: ${description}`;
    }
    
    return prompt;
  }

  private async pollForResult(getUrl: string): Promise<any> {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max
    
    while (attempts < maxAttempts) {
      const response = await fetch(getUrl, {
        headers: {
          'Authorization': `Token ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new APIError(`Failed to get prediction status: ${response.status}`, response.status);
      }

      const result = await response.json();
      
      if (result.status === 'succeeded') {
        return result;
      }
      
      if (result.status === 'failed') {
        throw new VisionAnalysisError('Image analysis failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    throw new VisionAnalysisError('Analysis timeout');
  }

  private async parseAnalysisResult(output: string, description?: string): Promise<VisionAnalysisResult> {
    // Parse AI output and structure response
    // This is a simplified implementation
    const mockService = new MockVisionService();
    return mockService.analyzeFood({ file: new File([], ''), dataUrl: '', width: 0, height: 0, size: 0 }, description);
  }
}

// Factory function to get appropriate service
export function createVisionService(): VisionService {
  // Check environment configuration
  const useRealAPI = process.env.NEXT_PUBLIC_ENABLE_REAL_AI_ANALYSIS === 'true';
  const apiKey = process.env.NEXT_PUBLIC_REPLICATE_API_KEY;
  
  if (useRealAPI && apiKey) {
    return new ReplicateVisionService(apiKey);
  }
  
  // Default to mock service for development
  return new MockVisionService();
}
