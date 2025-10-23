import { NextRequest, NextResponse } from 'next/server';
import { createStorageService } from '@/lib/services/storage';
import { createVisionService } from '@/lib/services/vision';

// Use Node.js runtime for Replicate API calls
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('🔍 Vision API: リクエスト受信');
  
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const description = formData.get('description') as string;
    const userId = formData.get('userId') as string;
    const mealType = formData.get('mealType') as string;
    
    console.log('📋 リクエストデータ:', {
      hasImage: !!imageFile,
      imageSize: imageFile?.size,
      description: description?.substring(0, 50),
      userId,
      mealType
    });

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

    console.log('🏭 VisionService作成中...');
    console.log('🔑 環境変数チェック:', {
      ENABLE_REAL_AI: process.env.NEXT_PUBLIC_ENABLE_REAL_AI_ANALYSIS,
      HAS_API_KEY: !!process.env.REPLICATE_API_KEY, // サーバーサイド環境変数
      NODE_ENV: process.env.NODE_ENV
    });
    
    // Create vision service (will use environment variables)
    const visionService = createVisionService();
    
    console.log('📷 画像処理準備...');
    // Convert File to base64 for processing
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${imageFile.type};base64,${base64}`;
    
    // Create processed image object
    const processedImage = {
      file: imageFile,
      dataUrl,
      width: 1200,
      height: 900,
      size: imageFile.size
    };

    console.log('🚀 画像解析開始...');
    
    let analysisResult;
    try {
      // Analyze the image
      analysisResult = await visionService.analyzeFood(processedImage, description);
      console.log('✅ 画像解析完了:', analysisResult);
    } catch (error) {
      console.error('⚠️ 画像解析エラー、モックサービスにフォールバック:', error);
      // Fallback to mock service if real API fails
      const { MockVisionService } = await import('@/lib/services/vision');
      const mockService = new MockVisionService();
      analysisResult = await mockService.analyzeFood(processedImage, description);
      console.log('✅ モック解析完了:', analysisResult);
    }

    // In production, you would also:
    // 1. Upload to Supabase Storage
    // 2. Call Replicate API via Edge Function
    // 3. Store results in database

    return NextResponse.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('❌ Vision API エラー:', error);
    console.error('エラー詳細:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return more detailed error for debugging
    return NextResponse.json(
      { 
        error: 'Failed to analyze image',
        details: error instanceof Error ? error.message : 'Unknown error',
        // Only in development
        debug: process.env.NODE_ENV === 'development' ? {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error)
        } : undefined
      },
      { status: 500 }
    );
  }
}