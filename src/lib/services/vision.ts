import { ProcessedImage } from '../utils/imageProcessing';

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

// Replicate service implementation (to be implemented with actual API)
export class ReplicateVisionService implements VisionService {
  constructor(private apiKey: string) {}
  
  async analyzeFood(image: ProcessedImage, description?: string): Promise<VisionAnalysisResult> {
    // TODO: Implement actual Replicate API call
    // For now, return mock data
    const mockService = new MockVisionService();
    return mockService.analyzeFood(image, description);
  }
}

// Factory function to get appropriate service
export function createVisionService(): VisionService {
  const apiKey = process.env.NEXT_PUBLIC_REPLICATE_API_KEY;
  
  if (apiKey && process.env.NODE_ENV === 'production') {
    return new ReplicateVisionService(apiKey);
  }
  
  return new MockVisionService();
}