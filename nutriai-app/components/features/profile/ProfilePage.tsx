'use client';

import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { ArrowLeft, User, Save } from 'lucide-react';
import { mockUser } from '../../../lib/mockData';
import { toast } from 'sonner';

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const [formData, setFormData] = useState({
    displayName: (mockUser as any).displayName || '',
    age: (mockUser as any).age || '',
    gender: (mockUser as any).gender || '',
    height: (mockUser as any).height || '',
    weight: (mockUser as any).weight || '',
    bodyFat: (mockUser as any).bodyFat || '',
    activityLevel: (mockUser as any).activityLevel || '',
    goal: (mockUser as any).goal || ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // In a real app, this would send data to backend
    Object.assign(mockUser, formData);
    toast.success('プロフィールを更新しました');
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
          <h1 className="text-lg font-semibold">プロフィール設定</h1>
          <div className="w-12"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              基本情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">名前</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                placeholder="山田太郎"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">年齢</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="25"
              />
            </div>

            <div className="space-y-2">
              <Label>性別</Label>
              <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男性</SelectItem>
                  <SelectItem value="female">女性</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 身体データ */}
        <Card>
          <CardHeader>
            <CardTitle>身体データ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">身長 (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  placeholder="162"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">体重 (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  placeholder="58.0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyFat">体脂肪率 (%) - 任意</Label>
              <Input
                id="bodyFat"
                type="number"
                step="0.1"
                value={formData.bodyFat}
                onChange={(e) => handleChange('bodyFat', e.target.value)}
                placeholder="25.0"
              />
            </div>
          </CardContent>
        </Card>

        {/* 活動・目標設定 */}
        <Card>
          <CardHeader>
            <CardTitle>活動・目標設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>活動レベル</Label>
              <Select value={formData.activityLevel} onValueChange={(value) => handleChange('activityLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">座り仕事が多い</SelectItem>
                  <SelectItem value="lightly_active">軽い運動（週1-3回）</SelectItem>
                  <SelectItem value="moderately_active">中程度の運動（週3-5回）</SelectItem>
                  <SelectItem value="very_active">激しい運動（週6-7回）</SelectItem>
                  <SelectItem value="extremely_active">非常に激しい運動・肉体労働</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>目標</Label>
              <Select value={formData.goal} onValueChange={(value) => handleChange('goal', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">減量</SelectItem>
                  <SelectItem value="maintain_weight">体重維持</SelectItem>
                  <SelectItem value="gain_weight">増量</SelectItem>
                  <SelectItem value="build_muscle">筋肉増強</SelectItem>
                </SelectContent>
              </Select>
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