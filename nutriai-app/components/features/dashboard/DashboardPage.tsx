'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Settings, ChevronLeft, ChevronRight, Utensils, Scale, CheckCircle2, Circle } from 'lucide-react';
import { mockDailySummary, mockUser, mockBodyMetrics } from '../../../lib/mockData';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '../../ui/carousel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { toast } from 'sonner';

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
  
  const summary = mockDailySummary;
  const latestWeight = mockBodyMetrics[mockBodyMetrics.length - 1];
  const remainingCalories = summary.targetCalories - summary.calorieIntake;
  
  // 栄養素の進捗を計算
  const carbProgress = (summary.carbG / summary.targetCarbG) * 100;
  const fatProgress = (summary.fatG / summary.targetFatG) * 100;
  const proteinProgress = (summary.proteinG / summary.targetProteinG) * 100;
  const calorieProgress = (summary.calorieIntake / summary.targetCalories) * 100;

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

  return (
    <div className="pb-20 bg-primary/5 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary text-white">
              {mockUser.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
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
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePreviousDay}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          
          <h1 className="text-foreground">{formatDate(selectedDate)}</h1>
          
          <button
            onClick={handleNextDay}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Carousel for Cards */}
        <Carousel className="w-full" setApi={setApi}>
          <CarouselContent>
            {/* Card 1: Calories */}
            <CarouselItem>
              <Card className="border-0 shadow-sm h-[340px]">
                <CardContent className="p-6 h-full flex flex-col">
                  <h2 className="mb-3">カロリー</h2>
                  <p className="text-sm text-gray-600 mb-4">残り = 目標摂取 - 食事摂取</p>
                  
                  <div className="flex-1 flex flex-col items-center justify-center">
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
                        <span className="text-lg">{summary.targetCalories.toLocaleString()} kcal</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">食事摂取</span>
                        <span className="text-lg text-primary">{summary.calorieIntake} kcal</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>

            {/* Card 2: Macronutrients */}
            <CarouselItem>
              <Card className="border-0 shadow-sm h-[340px]">
                <CardContent className="p-6 h-full flex flex-col">
                  <h2 className="mb-3">主要栄養素</h2>
                  
                  <div className="flex-1 flex flex-col items-center justify-center">
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
                            <div className="text-xl">{summary.carbG}</div>
                            <div className="text-xs text-gray-600">/{summary.targetCarbG}g</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">{summary.targetCarbG - summary.carbG}g 残り</div>
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
                            <div className="text-xl">{summary.fatG}</div>
                            <div className="text-xs text-gray-600">/{summary.targetFatG}g</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">{summary.targetFatG - summary.fatG}g 残り</div>
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
                            <div className="text-xl">{summary.proteinG}</div>
                            <div className="text-xs text-gray-600">/{summary.targetProteinG}g</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">{summary.targetProteinG - summary.proteinG}g 残り</div>
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
                <div className="flex items-center gap-3">
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className={task.status === 'completed' ? 'text-muted-foreground line-through' : ''}>
                    {task.title}
                  </span>
                </div>
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