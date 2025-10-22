'use client';

import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Slider } from '../../ui/slider';
import { ArrowLeft, Target, Save, Calculator } from 'lucide-react';
import { mockDailySummary } from '../../../lib/mockData';
import { toast } from 'sonner';

interface GoalSettingsPageProps {
  onBack: () => void;
}

export function GoalSettingsPage({ onBack }: GoalSettingsPageProps) {
  const [targetCalories, setTargetCalories] = useState((mockDailySummary as any).targetCalories || 2000);
  const [carbRatio, setCarbRatio] = useState(50); // 炭水化物の割合 (%)
  const [fatRatio, setFatRatio] = useState(25);   // 脂質の割合 (%)
  const [proteinRatio, setProteinRatio] = useState(25); // タンパク質の割合 (%)
  const [customMode, setCustomMode] = useState(false);

  // PFCバランスのプリセット
  const presets = [
    { name: 'バランス型', carb: 50, fat: 25, protein: 25 },
    { name: '低糖質', carb: 20, fat: 50, protein: 30 },
    { name: '高タンパク', carb: 40, fat: 20, protein: 40 },
    { name: 'ケトジェニック', carb: 5, fat: 75, protein: 20 }
  ];

  // 割合の合計を100%に調整
  const adjustRatios = (newCarb: number, newFat: number, newProtein: number) => {
    const total = newCarb + newFat + newProtein;
    if (total !== 100) {
      const factor = 100 / total;
      setCarbRatio(Math.round(newCarb * factor));
      setFatRatio(Math.round(newFat * factor));
      setProteinRatio(Math.round(newProtein * factor));
    } else {
      setCarbRatio(newCarb);
      setFatRatio(newFat);
      setProteinRatio(newProtein);
    }
  };

  const handlePresetSelect = (preset: typeof presets[0]) => {
    setCarbRatio(preset.carb);
    setFatRatio(preset.fat);
    setProteinRatio(preset.protein);
    setCustomMode(false);
  };

  const handleCustomRatioChange = (type: 'carb' | 'fat' | 'protein', value: number[]) => {
    setCustomMode(true);
    const newValue = value[0];
    
    if (type === 'carb') {
      const remaining = 100 - newValue;
      const fatPortion = (fatRatio / (fatRatio + proteinRatio)) * remaining;
      const proteinPortion = remaining - fatPortion;
      adjustRatios(newValue, Math.round(fatPortion), Math.round(proteinPortion));
    } else if (type === 'fat') {
      const remaining = 100 - newValue;
      const carbPortion = (carbRatio / (carbRatio + proteinRatio)) * remaining;
      const proteinPortion = remaining - carbPortion;
      adjustRatios(Math.round(carbPortion), newValue, Math.round(proteinPortion));
    } else {
      const remaining = 100 - newValue;
      const carbPortion = (carbRatio / (carbRatio + fatRatio)) * remaining;
      const fatPortion = remaining - carbPortion;
      adjustRatios(Math.round(carbPortion), Math.round(fatPortion), newValue);
    }
  };

  // グラム数の計算
  const carbGrams = Math.round((targetCalories * carbRatio / 100) / 4);
  const fatGrams = Math.round((targetCalories * fatRatio / 100) / 9);
  const proteinGrams = Math.round((targetCalories * proteinRatio / 100) / 4);

  const handleSave = () => {
    // In a real app, this would send data to backend
    (mockDailySummary as any).targetCalories = targetCalories;
    (mockDailySummary as any).targetCarbG = carbGrams;
    (mockDailySummary as any).targetFatG = fatGrams;
    (mockDailySummary as any).targetProteinG = proteinGrams;
    
    toast.success('目標設定を更新しました');
    onBack();
  };

  return (
    <div className="min-h-screen bg-primary/5">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-5 h-5" />
            戻る
          </button>
          <h1 className="text-lg font-semibold">目標設定</h1>
          <div className="w-12"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* カロリー目標 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              1日の目標摂取カロリー
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetCalories">目標カロリー (kcal)</Label>
              <Input
                id="targetCalories"
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(parseInt(e.target.value) || 2000)}
                placeholder="2000"
              />
            </div>
            <div className="text-sm text-muted-foreground p-3 bg-primary/5 rounded-lg">
              💡 一般的な成人の基礎代謝は1200-1800kcal程度です。活動量を考慮して設定してください。
            </div>
          </CardContent>
        </Card>

        {/* PFCバランス設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              PFCバランス設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* プリセット選択 */}
            <div className="space-y-3">
              <Label>プリセットから選択</Label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant={!customMode && carbRatio === preset.carb && fatRatio === preset.fat && proteinRatio === preset.protein ? "default" : "outline"}
                    onClick={() => handlePresetSelect(preset)}
                    className="h-auto p-3 flex flex-col items-start"
                  >
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">
                      P{preset.protein}% F{preset.fat}% C{preset.carb}%
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* カスタム設定 */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>カスタム設定</Label>
                {customMode && <span className="text-xs text-primary">カスタムモード</span>}
              </div>

              {/* 炭水化物 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-primary">炭水化物</Label>
                  <div className="text-right">
                    <div className="text-sm font-medium">{carbRatio}% ({carbGrams}g)</div>
                    <div className="text-xs text-muted-foreground">{Math.round(carbGrams * 4)}kcal</div>
                  </div>
                </div>
                <Slider
                  value={[carbRatio]}
                  onValueChange={(value) => handleCustomRatioChange('carb', value)}
                  max={80}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* 脂質 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">脂質</Label>
                  <div className="text-right">
                    <div className="text-sm font-medium">{fatRatio}% ({fatGrams}g)</div>
                    <div className="text-xs text-muted-foreground">{Math.round(fatGrams * 9)}kcal</div>
                  </div>
                </div>
                <Slider
                  value={[fatRatio]}
                  onValueChange={(value) => handleCustomRatioChange('fat', value)}
                  max={80}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* タンパク質 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-orange-500">タンパク質</Label>
                  <div className="text-right">
                    <div className="text-sm font-medium">{proteinRatio}% ({proteinGrams}g)</div>
                    <div className="text-xs text-muted-foreground">{Math.round(proteinGrams * 4)}kcal</div>
                  </div>
                </div>
                <Slider
                  value={[proteinRatio]}
                  onValueChange={(value) => handleCustomRatioChange('protein', value)}
                  max={80}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* サマリー */}
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="text-sm font-medium mb-2">設定サマリー</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>総カロリー:</span>
                    <span className="font-medium">{targetCalories}kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>炭水化物:</span>
                    <span>{carbGrams}g ({carbRatio}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>脂質:</span>
                    <span>{fatGrams}g ({fatRatio}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>タンパク質:</span>
                    <span>{proteinGrams}g ({proteinRatio}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 保存ボタン */}
        <Button onClick={handleSave} className="w-full h-12 bg-primary hover:bg-[#2F855A]">
          <Save className="w-5 h-5 mr-2" />
          変更を保存
        </Button>
      </div>
    </div>
  );
}