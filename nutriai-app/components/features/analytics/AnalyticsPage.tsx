'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Calendar } from '../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { TrendingDown, Target, Sparkles, Plus, CalendarIcon } from 'lucide-react';
import { mockBodyMetrics, mockGoal } from '../../../lib/mockData';
import { toast } from 'sonner';

export function AnalyticsPage() {
  const [, setUpdateTrigger] = useState(0);
  const latestWeight = mockBodyMetrics[mockBodyMetrics.length - 1];
  const startWeight = mockBodyMetrics[0];
  const weightChange = latestWeight.weightKg - startWeight.weightKg;
  const targetWeight = mockGoal.targetWeightKg;
  const remainingWeight = latestWeight.weightKg - targetWeight;
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weightInput, setWeightInput] = useState('');
  const [bodyFatInput, setBodyFatInput] = useState('');

  return (
    <div className="pb-20 bg-secondary min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-foreground">進捗・分析</h1>
          <p className="text-sm text-muted-foreground">体重・体組成の推移と目標達成度を確認</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* AI Review */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              月次レビュー
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              今月は順調に目標に向かって進んでいます！運動頻度が素晴らしく、カロリー管理も適切です。
              タンパク質の摂取量を少し増やすことで、さらに効果的な減量が期待できます。
            </p>
            <div className="p-3 bg-white rounded-lg space-y-2">
              <p className="text-sm font-medium">推奨される調整</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 目標カロリー: 1800kcal → 1750kcal</li>
                <li>• タンパク質目標: 70g → 80g</li>
                <li>• 運動頻度: 現状維持（週4-5回）</li>
              </ul>
            </div>
            <Button className="w-full bg-primary hover:bg-accent">
              提案を採用して目標を更新
            </Button>
          </CardContent>
        </Card>

        {/* Goal Progress */}
        <Card className="bg-white border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              目標進捗
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">開始時</p>
                <p className="text-foreground">{startWeight.weightKg} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">現在</p>
                <p className="text-foreground">{latestWeight.weightKg} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">目標</p>
                <p className="text-primary">{targetWeight} kg</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>達成度</span>
                <span className="text-primary">{Math.abs(weightChange).toFixed(1)} kg 減</span>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.min((Math.abs(weightChange) / Math.abs(startWeight.weightKg - targetWeight)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                残り {remainingWeight.toFixed(1)} kg
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weight Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              体重・体組成を記録
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>記録日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? selectedDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }) : '日付を選択'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">体重 (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="57.4"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bodyfat">体脂肪率 (%)</Label>
                <Input
                  id="bodyfat"
                  type="number"
                  step="0.1"
                  placeholder="28.0"
                  value={bodyFatInput}
                  onChange={(e) => setBodyFatInput(e.target.value)}
                />
              </div>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-accent"
              onClick={() => {
                const weight = parseFloat(weightInput);
                const bodyFat = bodyFatInput ? parseFloat(bodyFatInput) : undefined;
                
                if (!weight || weight < 20 || weight > 300) {
                  toast.error('正しい体重を入力してください（20-300kg）');
                  return;
                }
                
                if (bodyFat !== undefined && (bodyFat < 0 || bodyFat > 70)) {
                  toast.error('正しい体脂肪率を入力してください（0-70%）');
                  return;
                }
                
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const dateString = `${year}-${month}-${day}`;
                const existingIndex = mockBodyMetrics.findIndex(m => m.date === dateString);
                
                if (existingIndex >= 0) {
                  mockBodyMetrics[existingIndex] = {
                    date: dateString,
                    weightKg: weight,
                    bodyFatPct: bodyFat
                  };
                  toast.success('体重を更新しました');
                } else {
                  mockBodyMetrics.push({
                    date: dateString,
                    weightKg: weight,
                    bodyFatPct: bodyFat
                  });
                  mockBodyMetrics.sort((a, b) => a.date.localeCompare(b.date));
                  toast.success('体重を記録しました');
                }
                
                setWeightInput('');
                setBodyFatInput('');
                setUpdateTrigger(prev => prev + 1);
              }}
            >
              保存
            </Button>
          </CardContent>
        </Card>

        {/* Period Filter */}
        <Tabs defaultValue="month">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="month">1ヶ月</TabsTrigger>
            <TabsTrigger value="3month">3ヶ月</TabsTrigger>
            <TabsTrigger value="6month">6ヶ月</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Weight Chart */}
        <Card>
          <CardHeader>
            <CardTitle>体重推移</CardTitle>
            <CardDescription>過去8日間のデータ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2">
              {mockBodyMetrics.map((metric, idx) => {
                const maxWeight = Math.max(...mockBodyMetrics.map((m) => m.weightKg));
                const minWeight = Math.min(...mockBodyMetrics.map((m) => m.weightKg));
                const height = ((metric.weightKg - minWeight) / (maxWeight - minWeight)) * 100 || 50;
                const isLatest = idx === mockBodyMetrics.length - 1;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div
                      className={`w-full rounded-t transition-colors ${
                        isLatest ? 'bg-primary' : 'bg-chart-1 group-hover:bg-primary'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{metric.date.split('-')[2]}</span>
                    <div className="absolute -top-6 hidden group-hover:block bg-foreground text-white text-xs py-1 px-2 rounded">
                      {metric.weightKg}kg
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                （過去8日）
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calorie Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>摂取 vs 消費カロリー</CardTitle>
            <CardDescription>週間平均</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { day: '月', intake: 1750, burn: 2100 },
                { day: '火', intake: 1820, burn: 2050 },
                { day: '水', intake: 1680, burn: 2200 },
                { day: '木', intake: 1900, burn: 2000 },
                { day: '金', intake: 1780, burn: 2150 },
                { day: '土', intake: 2100, burn: 2300 },
                { day: '日', intake: 1950, burn: 2100 },
              ].map((data, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{data.day}曜日</span>
                    <span className="text-muted-foreground">
                      {data.burn - data.intake > 0 ? '-' : '+'}{Math.abs(data.burn - data.intake)} kcal
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 h-6 bg-chart-5/20 rounded overflow-hidden">
                      <div
                        className="h-full bg-chart-5"
                        style={{ width: `${(data.intake / 2500) * 100}%` }}
                      />
                    </div>
                    <div className="flex-1 h-6 bg-chart-1/20 rounded overflow-hidden">
                      <div
                        className="h-full bg-chart-1"
                        style={{ width: `${(data.burn / 2500) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-chart-5 rounded" />
                <span className="text-sm">摂取</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-chart-1 rounded" />
                <span className="text-sm">消費</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PFC Ratio */}
        <Card>
          <CardHeader>
            <CardTitle>PFC比率</CardTitle>
            <CardDescription>週間平均</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="var(--color-chart-1)"
                    strokeWidth="20"
                    strokeDasharray="75.4 251.2"
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="var(--color-chart-2)"
                    strokeWidth="20"
                    strokeDasharray="50.24 251.2"
                    strokeDashoffset="-75.4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="var(--color-chart-3)"
                    strokeWidth="20"
                    strokeDasharray="125.6 251.2"
                    strokeDashoffset="-125.64"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-chart-1 rounded" />
                  <span className="text-sm">タンパク質</span>
                </div>
                <span className="text-sm">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-chart-2 rounded" />
                  <span className="text-sm">脂質</span>
                </div>
                <span className="text-sm">20%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-chart-3 rounded" />
                  <span className="text-sm">炭水化物</span>
                </div>
                <span className="text-sm">50%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weight History */}
        <Card>
          <CardHeader>
            <CardTitle>記録履歴</CardTitle>
            <CardDescription>直近10件のデータ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockBodyMetrics.slice(-10).reverse().map((metric, idx) => {
                const date = new Date(metric.date);
                const dateStr = date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <p className="font-medium">{dateStr}</p>
                        <p className="text-xs text-muted-foreground">{metric.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{metric.weightKg} kg</p>
                      {metric.bodyFatPct && (
                        <p className="text-xs text-muted-foreground">{metric.bodyFatPct}%</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}