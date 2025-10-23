import { NextRequest, NextResponse } from 'next/server';
import { createStorageService } from '@/lib/services/storage';
import { createVisionService } from '@/lib/services/vision';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const description = formData.get('description') as string;
    const userId = formData.get('userId') as string;
    const mealType = formData.get('mealType') as string;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      );
    }

    if (!userId || !mealType) {
      return NextResponse.json(
        { error: 'User ID and meal type are required' },
        { status: 400 }
      );
    }

    // For development, use mock services
    const visionService = createVisionService();
    
    // Create processed image object for mock service
    const processedImage = {
      file: imageFile,
      dataUrl: '', // Not needed for API
      width: 1200,
      height: 900,
      size: imageFile.size
    };

    // Analyze the image
    const analysisResult = await visionService.analyzeFood(processedImage, description);

    // In production, you would also:
    // 1. Upload to Supabase Storage
    // 2. Call Replicate API via Edge Function
    // 3. Store results in database

    return NextResponse.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('Vision API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}