import { NextRequest, NextResponse } from 'next/server';
import { createVisionService, MockVisionService } from '@/lib/services/vision';
import { classifyError, AppError } from '@/lib/utils/errorHandling';
import type { ProcessedImage } from '@/lib/utils/imageProcessing';

// Use Node.js runtime for external Gemini API calls
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
      ENABLE_GEMINI: process.env.NEXT_PUBLIC_ENABLE_GEMINI,
      HAS_GEMINI_KEY: !!process.env.GOOGLE_AI_API_KEY,
      GEMINI_MODEL: process.env.GEMINI_MODEL,
      GEMINI_TEMPERATURE: process.env.GEMINI_TEMPERATURE,
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
    console.log('✅ 画像解析完了:', {
      provider: analysisResult.provider,
      fallback: analysisResult.fallback,
      items: analysisResult.items.length,
      totalCalories: analysisResult.totalCalories,
      confidence: analysisResult.overallConfidence
    });

    const { rawResponse, ...publicResult } = analysisResult;

    // In production, you would also:
    // 1. Upload to Supabase Storage
    // 2. Call Gemini API via Edge Function
    // 3. Store results in database

    return NextResponse.json({
      success: true,
      data: publicResult,
      meta: {
        provider: analysisResult.provider,
        fallback: analysisResult.fallback
      }
    });

  } catch (error) {
    const appError: AppError = classifyError(error);
    let clientMessage = appError.message;
    if (appError.statusCode === 401) {
      clientMessage = 'Gemini APIキーが無効か設定されていません。管理者に連絡してください。';
    } else if (appError.statusCode === 404) {
      clientMessage = '指定されたGeminiモデルが見つかりません。モデル名を確認して再度お試しください。';
    } else if (appError.statusCode === 429) {
      clientMessage = 'Gemini APIの利用上限に達しました。時間をおいて再試行するか手動入力をご利用ください。';
    } else if (appError.statusCode === 503 || appError.statusCode === 504) {
      clientMessage = 'Gemini APIが混雑しています。少し時間をおいてから再試行してください。';
    }
    console.error('❌ Vision API エラー:', appError);
    console.error('エラー詳細:', {
      name: appError.name,
      message: appError.message,
      status: appError.statusCode,
      code: appError.code,
      retryable: appError.retryable,
      stack: appError.stack
    });

    const canFallback =
      processedImage !== null &&
      appError.code === 'API_ERROR' &&
      [401, 404, 429, 503, 504].includes(appError.statusCode);

    if (canFallback) {
      const fallbackImage = processedImage!;
      console.warn('⚠️ Gemini APIのエラー。モック分析にフォールバックします。', {
        status: appError.statusCode,
        retryable: appError.retryable
      });
      
      try {
        const fallbackService = new MockVisionService();
        const fallbackResult = await fallbackService.analyzeFood(fallbackImage, description);
        const { rawResponse, ...publicFallback } = fallbackResult;
        
        return NextResponse.json(
          {
            success: true,
            data: publicFallback,
            meta: {
              provider: fallbackResult.provider,
              fallback: true,
              reason: 'gemini_error',
              originalStatus: appError.statusCode,
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
