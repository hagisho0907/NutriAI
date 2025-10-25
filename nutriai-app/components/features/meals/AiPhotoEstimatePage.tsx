'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Slider } from '../../ui/slider';
import { Camera, Upload, Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/features/meal/ImageUpload';
import { ProcessedImage } from '@/lib/utils/imageProcessing';
import { createClientVisionService } from '@/lib/services/vision-client';
import { VisionAnalysisResult } from '@/lib/services/vision';

interface AiPhotoEstimatePageProps {
  onBack: () => void;
  onSave: (data: {
    foodName: string;
    quantity: number;
    unit: string;
    macros: { protein: number; fat: number; carb: number };
    photoUrl?: string;
    description?: string;
  }) => void;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export function AiPhotoEstimatePage({
  onBack,
  onSave,
  mealType,
}: AiPhotoEstimatePageProps) {
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null);
  const [description, setDescription] = useState('');
  const [showEstimation, setShowEstimation] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VisionAnalysisResult | null>(null);
  const [macros, setMacros] = useState({ protein: 0, fat: 0, carb: 0 });
  const [isEstimating, setIsEstimating] = useState(false);
  const [isEditingResult, setIsEditingResult] = useState(false);
  const [reEstimateNotes, setReEstimateNotes] = useState('');
  
  const visionService = createClientVisionService();

  const handleImageSelect = (image: ProcessedImage) => {
    setSelectedImage(image);
    setShowEstimation(false);
    setAnalysisResult(null);
    setIsEditingResult(false);
    setReEstimateNotes('');
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setShowEstimation(false);
    setAnalysisResult(null);
    setMacros({ protein: 0, fat: 0, carb: 0 });
    setIsEditingResult(false);
    setReEstimateNotes('');
  };

  const composeDescriptionForGemini = (extraInstruction?: string) => {
    const base = description.trim();
    const extra = extraInstruction?.trim();

    if (base && extra) {
      return `${base}\n\n[再推定指示]\n${extra}`;
    }

    if (!base && extra) {
      return `[再推定指示]\n${extra}`;
    }

    return base;
  };

  const runEstimation = async (extraInstruction?: string) => {
    console.log('🤖 AI推定ボタンがクリックされました');
    console.log('📷 選択された画像:', selectedImage);
    console.log('🔑 Geminiフラグ:', process.env.NEXT_PUBLIC_ENABLE_GEMINI);
    
    if (!selectedImage) {
      console.log('❌ 画像が選択されていません');
      toast.error('写真を追加してください');
      return;
    }

    const combinedDescription = composeDescriptionForGemini(extraInstruction);

    setIsEstimating(true);
    console.log('⏳ AI推定を開始します...');

    try {
      const result = await visionService.analyzeFood(
        selectedImage,
        combinedDescription || undefined
      );
      setAnalysisResult(result);
      setMacros({
        protein: result.totalProtein,
        fat: result.totalFat,
        carb: result.totalCarbs
      });
      setShowEstimation(true);

      const providerLabel = result.provider === 'gemini' ? 'Gemini' : 'モックAI';

      if (result.fallback) {
        toast.warning('AI推定は参考値です', {
          description: `${providerLabel}が利用できなかったためモック結果を表示しています`
        });
      } else if (result.overallConfidence < 0.5) {
        toast.warning(`推定精度が低いです (${providerLabel})`, {
          description: '料理の詳細を記載すると精度が向上します'
        });
      } else {
        toast.success(`AI推定が完了しました (${providerLabel})`, {
          description: `信頼度: ${Math.round(result.overallConfidence * 100)}%`
        });
      }
    } catch (error) {
      console.error('Vision analysis error:', error);

      const friendlyMessage =
        error instanceof Error
          ? error.message
          : '手動で栄養素を入力することも可能です';

      toast.error('AI推定に失敗しました', {
        description: friendlyMessage
      });
    } finally {
      setIsEstimating(false);
    }
  };

  const handleEstimate = async () => {
    await runEstimation();
  };

  const handleReestimate = async () => {
    console.log('♻️ 再推定リクエスト:', reEstimateNotes);
    await runEstimation(reEstimateNotes);
  };

  const handleSaveEstimation = () => {
    // Extract food name from analysis result or description
    let foodName = '料理';
    if (analysisResult && analysisResult.items.length > 0) {
      foodName = analysisResult.items.map(item => item.name).join('、');
    } else if (description.trim()) {
      const firstLine = description.trim().split('\n')[0];
      foodName = firstLine.length > 30 ? firstLine.substring(0, 30) : firstLine;
    }

    onSave({
      foodName,
      quantity: 1,
      unit: '人前',
      macros,
      photoUrl: selectedImage?.dataUrl,
      description: description.trim(),
    });

    toast.success('食事を記録しました');
  };

  const totalCalories = macros.protein * 4 + macros.fat * 9 + macros.carb * 4;

  const mealTypeLabels = {
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食',
    snack: '間食',
  };

  return (
    <div className="pb-20 bg-primary/5 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-foreground">AI写真推定</h1>
          <span className="text-sm text-muted-foreground ml-auto">
            {mealTypeLabels[mealType]}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Photo Capture Card */}
        <Card>
          <CardHeader>
            <CardTitle>写真を追加</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              selectedImage={selectedImage}
              isProcessing={isEstimating}
            />
          </CardContent>
        </Card>

        {/* Description Card */}
        <Card>
          <CardHeader>
            <CardTitle>料理の詳細（任意）</CardTitle>
            <p className="text-sm text-muted-foreground">
              料理名や材料を記載すると、推定精度が向上します
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="例：&#10;鶏胸肉のグリル&#10;サラダ（レタス、トマト、きゅうり）&#10;玄米ご飯 150g&#10;味噌汁"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </CardContent>
        </Card>

        {/* AI Estimation Button */}
        {!showEstimation && (
          <Button
            onClick={handleEstimate}
            className="w-full bg-primary hover:bg-accent"
            disabled={!selectedImage || isEstimating}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {isEstimating ? 'AI推定中...' : 'AI推定を実行'}
          </Button>
        )}

        {/* AI Estimation Results */}
        {showEstimation && (
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI推定結果
                </CardTitle>
                {analysisResult && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={analysisResult.fallback ? 'destructive' : 'secondary'}>
                      {analysisResult.fallback ? '参考値 (モック)' : 'Gemini'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      信頼度 {Math.round(analysisResult.overallConfidence * 100)}%
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                推定カロリー: {Math.round(totalCalories)} kcal
                {analysisResult && (
                  <span className="ml-1">
                    ／ 推定元: {analysisResult.provider === 'gemini' ? 'Gemini' : 'モックAI'}
                  </span>
                )}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gemini推定ログ */}
              {analysisResult && (
                <div className="space-y-4 rounded-xl border border-primary/30 bg-white/90 p-4 text-sm text-muted-foreground">
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-foreground">
                      <span role="img" aria-label="photo">
                        📷
                      </span>
                      写真の内容 (推定)
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {analysisResult.items.length > 0 ? (
                        analysisResult.items.map((item, index) => (
                          <li key={`content-${index}`}>
                            {item.name}
                            {item.confidence && (
                              <span className="ml-1 text-xs text-muted-foreground">
                                (信頼度 {Math.round(item.confidence * 100)}%)
                              </span>
                            )}
                          </li>
                        ))
                      ) : (
                        <li className="text-xs">食品は検出されませんでした</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <p className="flex items-center gap-2 font-semibold text-foreground">
                      <span role="img" aria-label="portion">
                        🍽
                      </span>
                      想定分量
                    </p>
                    <ul className="mt-2 space-y-1 rounded-lg bg-primary/5 p-3 text-sm">
                      {analysisResult.items.length > 0 ? (
                        analysisResult.items.map((item, index) => (
                          <li key={`portion-${index}`} className="flex justify-between">
                            <span>{item.name}</span>
                            <span>
                              約{item.quantity}
                              {item.unit}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li>推定分量を算出できませんでした</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <p className="flex items-center gap-2 font-semibold text-foreground">
                      <span role="img" aria-label="pfc">
                        🔍
                      </span>
                      推定PFC (全体)
                    </p>
                    <div className="mt-2 overflow-x-auto rounded-lg border border-primary/20">
                      <table className="min-w-full text-xs">
                        <thead className="bg-primary/5 text-foreground">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold">食材</th>
                            <th className="px-3 py-2 text-right font-semibold">量 (g)</th>
                            <th className="px-3 py-2 text-right font-semibold">P (g)</th>
                            <th className="px-3 py-2 text-right font-semibold">F (g)</th>
                            <th className="px-3 py-2 text-right font-semibold">C (g)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisResult.items.length > 0 ? (
                            <>
                              {analysisResult.items.map((item, index) => (
                                <tr key={`pfc-${index}`} className="border-t border-primary/10">
                                  <td className="px-3 py-2">{item.name}</td>
                                  <td className="px-3 py-2 text-right">
                                    {item.quantity}
                                  </td>
                                  <td className="px-3 py-2 text-right">{item.protein}</td>
                                  <td className="px-3 py-2 text-right">{item.fat}</td>
                                  <td className="px-3 py-2 text-right">{item.carbs}</td>
                                </tr>
                              ))}
                              <tr className="border-t border-primary/20 bg-primary/5 font-semibold text-foreground">
                                <td className="px-3 py-2">合計</td>
                                <td className="px-3 py-2 text-right">
                                  {analysisResult.items.reduce((sum, item) => sum + item.quantity, 0)}
                                </td>
                                <td className="px-3 py-2 text-right">{analysisResult.totalProtein}</td>
                                <td className="px-3 py-2 text-right">{analysisResult.totalFat}</td>
                                <td className="px-3 py-2 text-right">{analysisResult.totalCarbs}</td>
                              </tr>
                            </>
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-3 py-4 text-center text-xs">
                                PFC情報を取得できませんでした
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <p className="flex items-center gap-2 font-semibold text-foreground">
                      <span role="img" aria-label="summary">
                        ✅
                      </span>
                      概要まとめ
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>合計エネルギー: 約{analysisResult.totalCalories} kcal</li>
                      <li>
                        PFC比: P {analysisResult.totalProtein}g / F {analysisResult.totalFat}g / C{' '}
                        {analysisResult.totalCarbs}g
                      </li>
                      <li>
                        推定元: {analysisResult.provider === 'gemini' ? 'Gemini' : 'モックAI'} ／ 信頼度{' '}
                        {Math.round(analysisResult.overallConfidence * 100)}%
                      </li>
                      {analysisResult.fallback && (
                        <li className="text-destructive">Geminiが利用できず、参考値を表示しています。</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* 検出された食品項目 */}
              {analysisResult && analysisResult.items.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base">検出された食品</Label>
                  <div className="space-y-2">
                    {analysisResult.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity}{item.unit} • {item.calories}kcal
                          </p>
                        </div>
                        <div className="text-sm text-right">
                          <p>P: {item.protein}g</p>
                          <p>F: {item.fat}g</p>
                          <p>C: {item.carbs}g</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* マクロ栄養素の調整 */}
              <div className="space-y-4 rounded-xl border border-primary/20 bg-white/90 p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">AI推定の微調整</Label>
                  {isEditingResult ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingResult(false)}
                      disabled={isEstimating}
                    >
                      編集を閉じる
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingResult(true)}
                      disabled={isEstimating}
                    >
                      編集
                    </Button>
                  )}
                </div>

                {isEditingResult ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>タンパク質</Label>
                        <span>{macros.protein}g</span>
                      </div>
                      <Slider
                        value={[macros.protein]}
                        onValueChange={(v) => setMacros({ ...macros, protein: v[0] })}
                        min={0}
                        max={100}
                        step={0.1}
                        className="[&_[role=slider]]:bg-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>脂質</Label>
                        <span>{macros.fat}g</span>
                      </div>
                      <Slider
                        value={[macros.fat]}
                        onValueChange={(v) => setMacros({ ...macros, fat: v[0] })}
                        min={0}
                        max={100}
                        step={0.1}
                        className="[&_[role=slider]]:bg-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>炭水化物</Label>
                        <span>{macros.carb}g</span>
                      </div>
                      <Slider
                        value={[macros.carb]}
                        onValueChange={(v) => setMacros({ ...macros, carb: v[0] })}
                        min={0}
                        max={200}
                        step={0.1}
                        className="[&_[role=slider]]:bg-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>再推定メモ</Label>
                      <Textarea
                        placeholder="再推定にあたり、より詳しい条件や指摘箇所があれば教えてください。"
                        value={reEstimateNotes}
                        onChange={(e) => setReEstimateNotes(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        追加メモはGeminiへの追記として渡され、次の再推定に反映されます。
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>タンパク質</span>
                      <span>{macros.protein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>脂質</span>
                      <span>{macros.fat}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>炭水化物</span>
                      <span>{macros.carb}g</span>
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`grid gap-3 ${
                  isEditingResult ? 'sm:grid-cols-2' : 'sm:grid-cols-1'
                }`}
              >
                {isEditingResult && (
                  <Button
                    variant="outline"
                    onClick={handleReestimate}
                    disabled={isEstimating}
                  >
                    {isEstimating ? '再推定中...' : '指示で再推定'}
                  </Button>
                )}
                <Button
                  onClick={handleSaveEstimation}
                  className="bg-primary hover:bg-accent"
                  disabled={isEstimating}
                >
                  登録する
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="text-blue-900">
                  <strong>推定精度を上げるコツ</strong>
                </p>
                <ul className="space-y-1 text-blue-800">
                  <li>• 料理全体が写るように撮影してください</li>
                  <li>• 明るい場所で撮影すると精度が向上します</li>
                  <li>• 材料や分量を詳細に記載すると、より正確に推定できます</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
