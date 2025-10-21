import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Slider } from '../../ui/slider';
import { Camera, Upload, Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

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
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [description, setDescription] = useState('');
  const [showEstimation, setShowEstimation] = useState(false);
  const [macros, setMacros] = useState({ protein: 0, fat: 0, carb: 0 });
  const [isEstimating, setIsEstimating] = useState(false);

  const handlePhotoCapture = (type: 'camera' | 'album') => {
    // Simulate photo capture/selection
    setPhotoUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800');
    toast.success(type === 'camera' ? '写真を撮影しました' : '写真を選択しました');
  };

  const handleEstimate = async () => {
    if (!photoUrl) {
      toast.error('写真を追加してください');
      return;
    }

    setIsEstimating(true);

    // Simulate AI estimation with delay
    setTimeout(() => {
      const randomProtein = Math.floor(Math.random() * 40) + 10;
      const randomFat = Math.floor(Math.random() * 30) + 5;
      const randomCarb = Math.floor(Math.random() * 60) + 20;
      
      setMacros({ protein: randomProtein, fat: randomFat, carb: randomCarb });
      setShowEstimation(true);
      setIsEstimating(false);
      toast.success('AI推定が完了しました');
    }, 1500);
  };

  const handleSaveEstimation = () => {
    const totalCalories = macros.protein * 4 + macros.fat * 9 + macros.carb * 4;
    
    // Extract food name from description or use default
    let foodName = '料理';
    if (description.trim()) {
      const firstLine = description.trim().split('\n')[0];
      foodName = firstLine.length > 30 ? firstLine.substring(0, 30) : firstLine;
    }

    onSave({
      foodName,
      quantity: 1,
      unit: '人前',
      macros,
      photoUrl,
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
    <div className="pb-20 bg-secondary min-h-screen">
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
          <CardContent className="space-y-4">
            {photoUrl ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={photoUrl}
                  alt="料理の写真"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-2 right-2"
                >
                  削除
                </Button>
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center gap-2">
                <Camera className="w-12 h-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  料理の写真を追加してください
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handlePhotoCapture('camera')}
                className="bg-primary hover:bg-accent"
                disabled={!!photoUrl}
              >
                <Camera className="mr-2 h-4 w-4" />
                カメラ起動
              </Button>
              <Button
                onClick={() => handlePhotoCapture('album')}
                variant="outline"
                disabled={!!photoUrl}
              >
                <Upload className="mr-2 h-4 w-4" />
                アルバムから
              </Button>
            </div>
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
            disabled={!photoUrl || isEstimating}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {isEstimating ? 'AI推定中...' : 'AI推定を実行'}
          </Button>
        )}

        {/* AI Estimation Results */}
        {showEstimation && (
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI推定結果
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                推定カロリー: {Math.round(totalCalories)} kcal (信頼度: 82%)
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  step={1}
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
                  step={1}
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
                  step={1}
                  className="[&_[role=slider]]:bg-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEstimation(false)}
                >
                  再推定
                </Button>
                <Button
                  onClick={handleSaveEstimation}
                  className="bg-primary hover:bg-accent"
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
