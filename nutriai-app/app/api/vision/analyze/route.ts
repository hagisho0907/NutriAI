import { NextRequest, NextResponse } from 'next/server';
import { createStorageService } from '@/lib/services/storage';
import { createVisionService, MockVisionService } from '@/lib/services/vision';
import { classifyError, AppError } from '@/lib/utils/errorHandling';
import type { ProcessedImage } from '@/lib/utils/imageProcessing';

// Use Node.js runtime for Replicate API calls
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('🔍 Vision API: リクエスト受信');
  
  let processedImage: ProcessedImage | null = null;
  let description: string | undefined;

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    description = (formData.get('description') as string) || undefined;
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
    processedImage = {
      file: imageFile,
      dataUrl,
      width: 1200,
      height: 900,
      size: imageFile.size
    };

    console.log('🚀 画像解析開始...');
    
    // Analyze the image
    const analysisResult = await visionService.analyzeFood(processedImage, description);
    console.log('✅ 画像解析完了:', analysisResult);

    // In production, you would also:
    // 1. Upload to Supabase Storage
    // 2. Call Replicate API via Edge Function
    // 3. Store results in database

    return NextResponse.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    const appError: AppError = classifyError(error);
    const clientMessage =
      appError.statusCode === 402
        ? 'AIビジョン分析のクレジットが不足しています。数分後に再試行するか、管理者に連絡してください。'
        : appError.message;
    console.error('❌ Vision API エラー:', appError);
    console.error('エラー詳細:', {
      name: appError.name,
      message: appError.message,
      status: appError.statusCode,
      code: appError.code,
      retryable: appError.retryable,
      stack: appError.stack
    });

    if (
      processedImage &&
      appError.code === 'API_ERROR' &&
      appError.statusCode === 402
    ) {
      console.warn('⚠️ Replicate APIのクレジット不足。モック分析にフォールバックします。');
      
      try {
        const fallbackService = new MockVisionService();
        const fallbackResult = await fallbackService.analyzeFood(processedImage, description);
        
        return NextResponse.json(
          {
            success: true,
            data: fallbackResult,
            meta: {
              fallback: true,
              reason: 'replicate_insufficient_credit'
            }
          },
          { status: 200 }
        );
      } catch (fallbackError) {
        console.error('❌ フォールバック分析に失敗:', fallbackError);
      }
    }
    
    return NextResponse.json(
      { 
        error: clientMessage,
        code: appError.code,
        retryable: appError.retryable,
        details: appError.message,
        debug: process.env.NODE_ENV === 'development' ? {
          name: appError.name,
          message: appError.message,
          status: appError.statusCode,
          stack: appError.stack
        } : undefined
      },
      { status: appError.statusCode || 500 }
    );
  }
}
