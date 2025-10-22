'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../../ui/drawer';
import { Calendar } from '../../ui/calendar';
import {
  Activity,
  Dumbbell,
  Heart,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Trash2,
  Flame,
} from 'lucide-react';
import { mockExercises, mockExerciseTemplates } from '../../../lib/mockData';
import type { ExerciseLog } from '../../../types/exercise';
import { toast } from 'sonner';

export function ExerciseLogPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [exercises, setExercises] = useState<ExerciseLog[]>(mockExercises as any);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');
  const [customCalories, setCustomCalories] = useState('');

  // Get exercises for selected date
  const dateStr = selectedDate.toISOString().split('T')[0];
  const dayExercises = exercises.filter((e) => (e as any).date === dateStr);

  // Calculate daily total
  const dailyTotal = dayExercises.reduce((sum, ex) => sum + ((ex as any).caloriesBurned || 0), 0);

  const calculateCalories = () => {
    const template = mockExerciseTemplates.find((t) => t.id === selectedTemplate);
    if (!template) return 0;
    
    // その他の場合は自由入力
    if (template.name === 'その他') {
      return parseInt(customCalories) || 0;
    }
    
    const weight = 65; // Mock user weight
    const durationNum = parseInt(duration) || 0;
    const intensityMultiplier = intensity === 'low' ? 0.8 : intensity === 'high' ? 1.2 : 1.0;
    return Math.round(
      (template.metValue * 3.5 * weight / 200) * durationNum * intensityMultiplier
    );
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleOpenAddDialog = (templateId?: string) => {
    setSelectedTemplate(templateId || '');
    setDuration('30');
    setIntensity('medium');
    setNotes('');
    setCustomCalories('');
    setIsAddDialogOpen(true);
  };

  const handleSaveExercise = () => {
    if (!selectedTemplate) {
      toast.error('運動の種類を選択してください');
      return;
    }

    const template = mockExerciseTemplates.find((t) => t.id === selectedTemplate);
    if (!template) return;

    const calories = calculateCalories();

    const newExercise = {
      id: `${Date.now()}`,
      date: dateStr,
      name: template.name,
      durationMin: parseInt(duration) || 0,
      caloriesBurned: calories,
      intensityLevel: intensity,
      notes,
    };

    setExercises((prev) => [...prev, newExercise as any]);
    setIsAddDialogOpen(false);
    toast.success('運動を記録しました');
  };

  const handleDeleteExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
    toast.success('削除しました');
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '今日';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨日';
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      });
    }
  };

  const intensityLabels = {
    low: '低強度',
    medium: '中強度',
    high: '高強度',
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'cardio':
        return <Activity className="w-5 h-5 text-primary" />;
      case 'strength':
        return <Dumbbell className="w-5 h-5 text-primary" />;
      default:
        return <Heart className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="pb-20 bg-primary/5 min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-foreground mb-3">運動記録</h1>

          {/* Date Navigator */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevDay}
              className="h-9 w-9"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="flex-1 justify-start gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {formatDate(selectedDate)}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>日付を選択</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="rounded-md border mx-auto"
                  />
                </div>
              </DrawerContent>
            </Drawer>

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
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Total Calories Card */}
        <Card className="bg-gray-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">消費カロリー</span>
              </div>
              <span className="text-primary">{dailyTotal} kcal</span>
            </div>
            {dayExercises.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                {dayExercises.length}件の運動を記録
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercise List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">運動記録</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleOpenAddDialog()}
                className="text-primary hover:text-primary hover:bg-transparent hover:font-semibold"
              >
                <Plus className="h-4 w-4 mr-1" />
                追加
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {dayExercises.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">まだ運動を記録していません</p>
              </div>
            ) : (
              dayExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-start justify-between p-3 bg-primary/5 rounded-lg"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{(exercise as any).name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(exercise as any).durationMin}分 • {intensityLabels[(exercise as any).intensityLevel as keyof typeof intensityLabels]}
                      </p>
                      {(exercise as any).notes && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {(exercise as any).notes}
                        </p>
                      )}
                      <p className="text-sm text-primary mt-1">
                        {(exercise as any).caloriesBurned} kcal
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Weekly Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">週次サマリー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-32 gap-2 mb-4">
              {[120, 180, 0, 240, 150, 280, 320].map((value, idx) => {
                const height = value > 0 ? (value / 320) * 100 : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-primary rounded-t"
                      style={{ height: height > 0 ? `${height}%` : '2px', minHeight: '2px' }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {['月', '火', '水', '木', '金', '土', '日'][idx]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">週間合計</p>
                <p className="text-foreground">1,290 kcal</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">運動回数</p>
                <p className="text-foreground">5回</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">平均時間</p>
                <p className="text-foreground">35分</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Exercise Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>運動を記録</DialogTitle>
            <DialogDescription>
              運動の種類、強度、時間を入力してください。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Exercise Type */}
            <div className="space-y-2">
              <Label>運動の種類</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="運動を選択" />
                </SelectTrigger>
                <SelectContent>
                  {mockExerciseTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <>
                {/* Custom Calories (only for "その他") */}
                {mockExerciseTemplates.find((t) => t.id === selectedTemplate)?.name === 'その他' ? (
                  <div className="space-y-2">
                    <Label>消費カロリー（kcal）</Label>
                    <Input
                      type="number"
                      value={customCalories}
                      onChange={(e) => setCustomCalories(e.target.value)}
                      placeholder="例: 200"
                      min="1"
                    />
                  </div>
                ) : (
                  <>
                    {/* Intensity */}
                    <div className="space-y-2">
                      <Label>強度</Label>
                      <Select value={intensity} onValueChange={(v: any) => setIntensity(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">低強度</SelectItem>
                          <SelectItem value="medium">中強度</SelectItem>
                          <SelectItem value="high">高強度</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Duration */}
                <div className="space-y-2">
                  <Label>時間（分）</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="30"
                    min="1"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>メモ（任意）</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="例: 朝のジョギング"
                  />
                </div>

                {/* Calories Estimate */}
                <div className="p-4 bg-white border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">消費カロリー</span>
                    </div>
                    <span className="text-primary">{calculateCalories()} kcal</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              type="button"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSaveExercise}
              className="bg-primary hover:bg-accent"
              type="button"
              disabled={!selectedTemplate}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}