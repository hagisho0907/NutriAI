'use client';

import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Progress } from '../../ui/progress';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function GoalWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    bodyFat: '',
    age: '',
    gender: '',
    // TDEE calculation fields
    workActivityLevel: '', // 仕事の活動レベル
    exerciseFrequency: '', // 週の運動頻度
    exerciseDuration: '', // 1回あたりの運動時間
    exerciseIntensity: '', // 運動の強度
    dailyMovement: '', // 日常の移動量
    goalType: '',
    targetWeight: '',
    duration: '',
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete onboarding and redirect to dashboard
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-primary/5 p-4 flex flex-col">
      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            {step > 1 && (
              <button onClick={handleBack} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1 text-center">
              <span className="text-sm text-muted-foreground">
                ステップ {step} / {totalSteps}
              </span>
            </div>
            <button onClick={() => router.push('/dashboard')} className="text-sm text-muted-foreground hover:text-foreground">
              スキップ
            </button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center pb-20">
          {step === 1 && <BasicInfoStep formData={formData} updateField={updateField} />}
          {step === 2 && <BodyDataStep formData={formData} updateField={updateField} />}
          {step === 3 && <ActivityStep formData={formData} updateField={updateField} />}
          {step === 4 && <GoalStep formData={formData} updateField={updateField} />}
        </div>

        {/* Footer */}
        <div className="py-4">
          <Button onClick={handleNext} className="w-full bg-primary hover:bg-accent">
            {step === totalSteps ? (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                AI目標提案を見る
              </>
            ) : (
              <>
                次へ
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BasicInfoStep({ formData, updateField }: any) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>基本情報</CardTitle>
        <CardDescription>あなたの基本情報を教えてください</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="age">年齢</Label>
          <Input
            id="age"
            type="number"
            placeholder="25"
            value={formData.age}
            onChange={(e) => updateField('age', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">性別</Label>
          <Select value={formData.gender} onValueChange={(v) => updateField('gender', v)}>
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">女性</SelectItem>
              <SelectItem value="male">男性</SelectItem>
              <SelectItem value="other">その他</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function BodyDataStep({ formData, updateField }: any) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>身体データ</CardTitle>
        <CardDescription>現在の身体データを入力してください</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="height">身長 (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="162"
            value={formData.height}
            onChange={(e) => updateField('height', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">体重 (kg)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="58"
            value={formData.weight}
            onChange={(e) => updateField('weight', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bodyFat">体脂肪率 (%) - 任意</Label>
          <Input
            id="bodyFat"
            type="number"
            placeholder="28"
            value={formData.bodyFat}
            onChange={(e) => updateField('bodyFat', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityStep({ formData, updateField }: any) {
  return (
    <Card className="w-full max-h-[80vh] overflow-y-auto">
      <CardHeader>
        <CardTitle>活動・運動習慣</CardTitle>
        <CardDescription>より正確なカロリー計算のため、詳しく教えてください</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 仕事の活動レベル */}
        <div className="space-y-2">
          <Label>仕事・日常の活動レベル</Label>
          <Select value={formData.workActivityLevel} onValueChange={(v) => updateField('workActivityLevel', v)}>
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desk">デスクワーク（ほぼ座っている）</SelectItem>
              <SelectItem value="standing">立ち仕事（販売員、教員など）</SelectItem>
              <SelectItem value="moving">動き回る仕事（看護師、配達など）</SelectItem>
              <SelectItem value="physical">肉体労働（建設、引越しなど）</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 週の運動頻度 */}
        <div className="space-y-2">
          <Label>週の運動頻度</Label>
          <Select value={formData.exerciseFrequency} onValueChange={(v) => updateField('exerciseFrequency', v)}>
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">運動しない</SelectItem>
              <SelectItem value="1-2">週1-2回</SelectItem>
              <SelectItem value="3-4">週3-4回</SelectItem>
              <SelectItem value="5-6">週5-6回</SelectItem>
              <SelectItem value="daily">毎日</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 1回あたりの運動時間 */}
        {formData.exerciseFrequency && formData.exerciseFrequency !== 'none' && (
          <div className="space-y-2">
            <Label>1回あたりの運動時間</Label>
            <Select value={formData.exerciseDuration} onValueChange={(v) => updateField('exerciseDuration', v)}>
              <SelectTrigger>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">30分未満</SelectItem>
                <SelectItem value="medium">30-60分</SelectItem>
                <SelectItem value="long">60-90分</SelectItem>
                <SelectItem value="verylong">90分以上</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 運動の強度 */}
        {formData.exerciseFrequency && formData.exerciseFrequency !== 'none' && (
          <div className="space-y-2">
            <Label>運動の強度</Label>
            <Select value={formData.exerciseIntensity} onValueChange={(v) => updateField('exerciseIntensity', v)}>
              <SelectTrigger>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">軽い（ウォーキング、ヨガ、ストレッチ）</SelectItem>
                <SelectItem value="moderate">中程度（ジョギング、サイクリング、水泳）</SelectItem>
                <SelectItem value="vigorous">激しい（ランニング、HIIT、重量挙げ）</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 日常の移動量 */}
        <div className="space-y-2">
          <Label>日常の移動・通勤</Label>
          <Select value={formData.dailyMovement} onValueChange={(v) => updateField('dailyMovement', v)}>
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimal">ほぼ座っている（車・電車で移動）</SelectItem>
              <SelectItem value="light">少し歩く（10-20分/日）</SelectItem>
              <SelectItem value="moderate">そこそこ歩く（20-40分/日）</SelectItem>
              <SelectItem value="active">よく歩く（40分以上/日）</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-3 bg-primary/5 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 これらの情報から、あなたの総消費カロリー（TDEE）を正確に計算し、最適な目標カロリーを提案します。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function GoalStep({ formData, updateField }: any) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>目標設定</CardTitle>
        <CardDescription>達成したい目標を教えてください</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>目標タイプ</Label>
          <Select value={formData.goalType} onValueChange={(v) => updateField('goalType', v)}>
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="loss">ダイエット（減量）</SelectItem>
              <SelectItem value="gain">増量（筋肉をつける）</SelectItem>
              <SelectItem value="maintain">現状維持</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetWeight">目標体重 (kg)</Label>
          <Input
            id="targetWeight"
            type="number"
            placeholder="55"
            value={formData.targetWeight}
            onChange={(e) => updateField('targetWeight', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">目標期間（週）</Label>
          <Input
            id="duration"
            type="number"
            placeholder="12"
            value={formData.duration}
            onChange={(e) => updateField('duration', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}