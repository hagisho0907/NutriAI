'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Settings, ChevronLeft, ChevronRight, Utensils, Scale, CheckCircle2, Circle, Calendar as CalendarIcon } from 'lucide-react';
import { mockDailySummary, mockUser, mockBodyMetrics } from '../../../lib/mockData';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '../../ui/carousel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { toast } from 'sonner';
import { ProfileSettingsPage } from '../profile/ProfileSettingsPage';

// Apple Icon SVG Component
function AppleIcon() {
  return (
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path 
        d="M16 4C16 4 18 2 20 4C22 6 22 8 22 8M8 12C8 12 6 14 6 18C6 22 8 26 12 28C14 29 16 29 16 29C16 29 18 29 20 28C24 26 26 22 26 18C26 14 24 12 24 12C24 12 22 10 18 10C16 10 16 10 16 10C16 10 16 10 14 10C10 10 8 12 8 12Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isWeightInputOpen, setIsWeightInputOpen] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [, setUpdateTrigger] = useState(0);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  
  const summary = mockDailySummary;
  const latestWeight = mockBodyMetrics[mockBodyMetrics.length - 1];
  const remainingCalories = (summary as any).targetCalories ? (summary as any).targetCalories - (summary as any).calorieIntake : 2000 - (summary as any).calorieIntake;
  
  // 栄養素の進捗を計算
  const carbProgress = (summary as any).targetCarbG ? ((summary as any).carbG / (summary as any).targetCarbG) * 100 : 0;
  const fatProgress = (summary as any).targetFatG ? ((summary as any).fatG / (summary as any).targetFatG) * 100 : 0;
  const proteinProgress = (summary as any).targetProteinG ? ((summary as any).proteinG / (summary as any).targetProteinG) * 100 : 0;
  const calorieProgress = (summary as any).targetCalories ? ((summary as any).calorieIntake / (summary as any).targetCalories) * 100 : 0;

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return '今日';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨日';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明日';
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });
    }
  };

  if (showProfileSettings) {
    return <ProfileSettingsPage onBack={() => setShowProfileSettings(false)} />;
  }

  return (
    <div className="pb-20 bg-primary/5 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setShowProfileSettings(true)}
            className="w-10 h-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all"
          >
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-white">
                {(mockUser as any).displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </button>
          
          <div className="flex items-center gap-2">
            <AppleIcon />
            <span className="text-2xl text-primary" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600, letterSpacing: '-0.5px' }}>
              NutriAI
            </span>
          </div>
          
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100">
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-white border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousDay}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 justify-start gap-2">
                <CalendarIcon className="h-4 w-4" />
                {formatDate(selectedDate)}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>日付を選択</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 p-4">
                <div className="flex items-center justify-center gap-3">
                  <Select
                    value={selectedDate.getFullYear().toString()}
                    onValueChange={(year) => {
                      const newDate = new Date(selectedDate);
                      newDate.setFullYear(parseInt(year));
                      setSelectedDate(newDate);
                    }}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - 5 + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}年
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <Select
                    value={(selectedDate.getMonth() + 1).toString()}
                    onValueChange={(month) => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(parseInt(month) - 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}月
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedDate.getDate().toString()}
                    onValueChange={(day) => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(parseInt(day));
                      setSelectedDate(newDate);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}日
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDate(new Date())}
                    className="text-primary"
                  >
                    今日
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextDay}
            className="h-9 w-9"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Carousel for Cards */}
        <Carousel className="w-full" setApi={setApi}>
          <CarouselContent>
            {/* Card 1: Calories */}
            <CarouselItem>
              <Card>
                <CardHeader>
                  <CardTitle>カロリー</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">残り = 目標摂取 - 食事摂取</p>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center">
                    {/* Circular Progress */}
                    <div className="relative flex items-center justify-center mb-4">
                      <svg className="w-36 h-36 transform -rotate-90">
                        {/* Background circle */}
                        <circle
                          cx="72"
                          cy="72"
                          r="64"
                          stroke="#E5E7EB"
                          strokeWidth="12"
                          fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="72"
                          cy="72"
                          r="64"
                          stroke="#42B883"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 64}`}
                          strokeDashoffset={`${2 * Math.PI * 64 * (1 - Math.min(calorieProgress / 100, 1))}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <div className="text-3xl">{remainingCalories.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">残り</div>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">目標</span>
                        <span className="text-lg">{((summary as any).targetCalories || 2000).toLocaleString()} kcal</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">食事摂取</span>
                        <span className="text-lg text-primary">{(summary as any).calorieIntake || 0} kcal</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>

            {/* Card 2: Macronutrients */}
            <CarouselItem>
              <Card>
                <CardHeader>
                  <CardTitle>主要栄養素</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center">
                    <div className="grid grid-cols-3 gap-6 mb-4">
                      {/* Carbs */}
                      <div className="flex flex-col items-center">
                        <div className="text-sm mb-2 text-primary">炭水化物</div>
                        <div className="relative flex items-center justify-center mb-2">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="#E5E7EB"
                              strokeWidth="10"
                              fill="none"
                            />
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="#42B883"
                              strokeWidth="10"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - Math.min(carbProgress / 100, 1))}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <div className="text-xl">{(summary as any).carbG || 0}</div>
                            <div className="text-xs text-gray-600">/{(summary as any).targetCarbG || 0}g</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">{((summary as any).targetCarbG || 0) - ((summary as any).carbG || 0)}g 残り</div>
                      </div>

                      {/* Fat */}
                      <div className="flex flex-col items-center">
                        <div className="text-sm mb-2" style={{ color: '#000' }}>脂質</div>
                        <div className="relative flex items-center justify-center mb-2">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="#E5E7EB"
                              strokeWidth="10"
                              fill="none"
                            />
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="#42B883"
                              strokeWidth="10"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - Math.min(fatProgress / 100, 1))}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <div className="text-xl">{(summary as any).fatG || 0}</div>
                            <div className="text-xs text-gray-600">/{(summary as any).targetFatG || 0}g</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">{((summary as any).targetFatG || 0) - ((summary as any).fatG || 0)}g 残り</div>
                      </div>

                      {/* Protein */}
                      <div className="flex flex-col items-center">
                        <div className="text-sm mb-2 text-orange-500">タンパク質</div>
                        <div className="relative flex items-center justify-center mb-2">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="#E5E7EB"
                              strokeWidth="10"
                              fill="none"
                            />
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="#42B883"
                              strokeWidth="10"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - Math.min(proteinProgress / 100, 1))}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <div className="text-xl">{(summary as any).proteinG || 0}</div>
                            <div className="text-xs text-gray-600">/{(summary as any).targetProteinG || 0}g</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">{((summary as any).targetProteinG || 0) - ((summary as any).proteinG || 0)}g 残り</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          </CarouselContent>
          
          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1].map((index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  current === index ? 'bg-primary' : 'bg-gray-300'
                }`}
                aria-label={`スライド ${index + 1} に移動`}
              />
            ))}
          </div>
        </Carousel>

        {/* Weight Card */}
        <Card data-weight-card>
          <CardHeader>
            <CardTitle>体重</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">現在</p>
              <p className="text-3xl">{latestWeight.weightKg} <span className="text-xl text-muted-foreground">kg</span></p>
            </div>

            <Collapsible open={isWeightInputOpen} onOpenChange={setIsWeightInputOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Scale className="w-4 h-4 mr-2" />
                  今日の体重を記録
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="weight-input">体重 (kg)</Label>
                  <Input
                    id="weight-input"
                    type="number"
                    step="0.1"
                    placeholder="57.4"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-accent"
                  onClick={() => {
                    const weight = parseFloat(weightInput);
                    if (weight && weight > 20 && weight < 300) {
                      const today = new Date().toISOString().split('T')[0];
                      mockBodyMetrics.push({
                        date: today,
                        weightKg: weight,
                        bodyFatPct: latestWeight.bodyFatPct
                      });
                      toast.success('体重を記録しました');
                      setWeightInput('');
                      setIsWeightInputOpen(false);
                      setUpdateTrigger(prev => prev + 1);
                    } else {
                      toast.error('正しい体重を入力してください（20-300kg）');
                    }
                  }}
                >
                  保存
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>今日のタスク</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.tasks.map((task, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <button
                  className="flex items-center gap-3 flex-1 text-left"
                  onClick={() => {
                    if (task.status === 'pending') {
                      // タスクを完了にマーク
                      task.status = 'completed';
                      task.completedAt = new Date().toISOString();
                      setUpdateTrigger(prev => prev + 1);
                      toast.success(`「${task.title}」を完了しました`);
                    } else if (task.status === 'completed') {
                      // 完了タスクを未完了に戻す
                      task.status = 'pending';
                      task.completedAt = undefined;
                      setUpdateTrigger(prev => prev + 1);
                      toast.success(`「${task.title}」を未完了に戻しました`);
                    }
                  }}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className={task.status === 'completed' ? 'text-muted-foreground line-through' : ''}>
                    {task.title}
                  </span>
                </button>
                {task.status === 'pending' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      if (task.type === 'log_weight') {
                        setIsWeightInputOpen(true);
                        // Scroll to weight card
                        setTimeout(() => {
                          const weightCard = document.querySelector('[data-weight-card]');
                          weightCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      } else {
                        onNavigate(task.type === 'log_meal' ? 'meals' : 'exercises');
                      }
                    }}
                  >
                    開始
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => onNavigate('meals')}
            variant="outline"
            className="h-20"
          >
            <div className="flex flex-col items-center gap-2">
              <Utensils className="w-6 h-6 text-primary" />
              <span className="text-sm">食事を記録</span>
            </div>
          </Button>
          <Button
            onClick={() => onNavigate('exercises')}
            variant="outline"
            className="h-20"
          >
            <div className="flex flex-col items-center gap-2">
              <Scale className="w-6 h-6 text-orange-500" />
              <span className="text-sm">運動を記録</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}