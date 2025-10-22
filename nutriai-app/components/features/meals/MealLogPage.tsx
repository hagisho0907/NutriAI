'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Calendar } from '../../ui/calendar';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Trash2,
} from 'lucide-react';
import type { Food, MealItem } from '../../../types/food';
import type { Meal } from '../../../types/meal';
import { toast } from 'sonner';
import { FoodSelectionPage } from './FoodSelectionPage';
import { AiPhotoEstimatePage } from './AiPhotoEstimatePage';
import { BarcodeSearchPage } from '../barcode/BarcodeSearchPage';

interface MealLogPageProps {
  selectedFood?: Food | null;
  onNavigateToBarcode?: () => void;
  onClearSelectedFood?: () => void;
}

type ViewMode = 'main' | 'food-selection' | 'ai-photo' | 'barcode-search';

export function MealLogPage({
  selectedFood,
  onNavigateToBarcode,
  onClearSelectedFood,
}: MealLogPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [selectedMealType, setSelectedMealType] = useState<
    'breakfast' | 'lunch' | 'dinner' | 'snack'
  >('breakfast');

  // Get meals for selected date
  const dateStr = selectedDate.toISOString().split('T')[0];
  const dayMeals = meals.filter((m) => m.loggedAt.split('T')[0] === dateStr);

  // Calculate totals for each meal type
  const getMealTotals = (mealType: string) => {
    const meal = dayMeals.find((m) => m.mealType === mealType);
    if (!meal || !meal.items.length) return null;

    return meal.items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.proteinG,
        fat: acc.fat + item.fatG,
        carb: acc.carb + item.carbG,
      }),
      { calories: 0, protein: 0, fat: 0, carb: 0 }
    );
  };

  // Calculate daily totals
  const dailyTotals = dayMeals.reduce(
    (acc, meal) => {
      meal.items.forEach((item) => {
        acc.calories += item.calories;
        acc.protein += item.proteinG;
        acc.fat += item.fatG;
        acc.carb += item.carbG;
      });
      return acc;
    },
    { calories: 0, protein: 0, fat: 0, carb: 0 }
  );

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

  const handleOpenFoodSelection = (
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ) => {
    setSelectedMealType(mealType);
    setViewMode('food-selection');
  };

  const handleSaveFromAiPhoto = (data: {
    foodName: string;
    quantity: number;
    unit: string;
    macros: { protein: number; fat: number; carb: number };
    photoUrl?: string;
    description?: string;
  }) => {
    const totalCalories = data.macros.protein * 4 + data.macros.fat * 9 + data.macros.carb * 4;

    const newItem: MealItem = {
      id: `${Date.now()}`,
      mealId: '',
      foodId: `custom-${Date.now()}`,
      foodName: data.foodName,
      quantity: data.quantity,
      unit: data.unit,
      calories: totalCalories,
      proteinG: data.macros.protein,
      fatG: data.macros.fat,
      carbG: data.macros.carb,
      createdAt: new Date().toISOString(),
    };

    setMeals((prev) => {
      const existingMealIndex = prev.findIndex(
        (m) => m.loggedAt.split('T')[0] === dateStr && m.mealType === selectedMealType
      );

      if (existingMealIndex >= 0) {
        // Add to existing meal
        const updated = [...prev];
        updated[existingMealIndex] = {
          ...updated[existingMealIndex],
          items: [...updated[existingMealIndex].items, newItem],
          photoUrl: data.photoUrl,
          notes: data.description,
        };
        return updated;
      } else {
        // Create new meal
        const newMeal: Meal = {
          id: `${Date.now()}`,
          userId: 'current-user',
          loggedAt: new Date().toISOString(),
          mealType: selectedMealType,
          source: 'photo',
          items: [newItem],
          photoUrl: data.photoUrl,
          notes: data.description,
          aiEstimated: true,
          totalCalories: totalCalories,
          totalProteinG: data.macros.protein,
          totalFatG: data.macros.fat,
          totalCarbG: data.macros.carb,
          createdAt: new Date().toISOString(),
        };
        return [...prev, newMeal];
      }
    });

    setViewMode('main');
  };

  const handleSelectRecentFood = (food: any) => {
    const newItem: MealItem = {
      id: `${Date.now()}`,
      mealId: '',
      foodId: food.id || `custom-${Date.now()}`,
      foodName: food.name,
      quantity: 1,
      unit: '人前',
      calories: food.calories,
      proteinG: Math.round(food.calories * 0.2 / 4),
      fatG: Math.round(food.calories * 0.3 / 9),
      carbG: Math.round(food.calories * 0.5 / 4),
      createdAt: new Date().toISOString(),
    };

    setMeals((prev) => {
      const existingMealIndex = prev.findIndex(
        (m) => m.loggedAt.split('T')[0] === dateStr && m.mealType === selectedMealType
      );

      if (existingMealIndex >= 0) {
        const updated = [...prev];
        updated[existingMealIndex] = {
          ...updated[existingMealIndex],
          items: [...updated[existingMealIndex].items, newItem],
        };
        return updated;
      } else {
        const newMeal: Meal = {
          id: `${Date.now()}`,
          userId: 'current-user',
          loggedAt: new Date().toISOString(),
          mealType: selectedMealType,
          source: 'manual',
          items: [newItem],
          aiEstimated: false,
          totalCalories: newItem.calories,
          totalProteinG: newItem.proteinG,
          totalFatG: newItem.fatG,
          totalCarbG: newItem.carbG,
          createdAt: new Date().toISOString(),
        };
        return [...prev, newMeal];
      }
    });

    setViewMode('main');
    toast.success('食事を追加しました');
  };

  const handleDeleteItem = (mealId: string, itemId: string) => {
    setMeals((prev) =>
      prev
        .map((meal) => {
          if (meal.id === mealId) {
            return {
              ...meal,
              items: meal.items.filter((item) => item.id !== itemId),
            };
          }
          return meal;
        })
        .filter((meal) => meal.items.length > 0)
    );
    toast.success('削除しました');
  };

  const mealTypeLabels = {
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食',
    snack: '間食',
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

  // Show food selection page
  if (viewMode === 'food-selection') {
    return (
      <FoodSelectionPage
        onBack={() => setViewMode('main')}
        onNavigateToBarcode={() => setViewMode('barcode-search')}
        onNavigateToAiPhoto={() => setViewMode('ai-photo')}
        onSelectFood={handleSelectRecentFood}
        mealType={selectedMealType}
      />
    );
  }

  // Show barcode search page
  if (viewMode === 'barcode-search') {
    return (
      <BarcodeSearchPage
        onClose={() => setViewMode('food-selection')}
        onSelectFood={(food) => {
          // Convert food to the expected format and add to meal
          const recentFood = {
            id: food.id,
            name: food.name,
            calories: food.calories,
            serving: `${food.servingSize || '1'} ${food.servingUnit || '食分'}`,
            brand: food.brand,
          };
          handleSelectRecentFood(recentFood);
        }}
      />
    );
  }

  // Show AI photo estimation page
  if (viewMode === 'ai-photo') {
    return (
      <AiPhotoEstimatePage
        onBack={() => setViewMode('food-selection')}
        onSave={handleSaveFromAiPhoto}
        mealType={selectedMealType}
      />
    );
  }

  // Main meal log view
  return (
    <div className="pb-20 bg-primary/5 min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-foreground mb-3">食事記録</h1>

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

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 justify-start gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {formatDate(selectedDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center" side="bottom" sideOffset={8}>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>

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
        {/* Daily Summary */}
        <Card className="bg-gray-100">
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">カロリー</p>
                <p className="text-foreground">{Math.round(dailyTotals.calories)}kcal</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground whitespace-nowrap">タンパク質</p>
                <p className="text-foreground">{Math.round(dailyTotals.protein)}g</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">脂質</p>
                <p className="text-foreground">{Math.round(dailyTotals.fat)}g</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground whitespace-nowrap">炭水化物</p>
                <p className="text-foreground">{Math.round(dailyTotals.carb)}g</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Sections */}
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => {
          const totals = getMealTotals(mealType);
          const meal = dayMeals.find((m) => m.mealType === mealType);

          return (
            <Card key={mealType}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {mealTypeLabels[mealType]}
                    </CardTitle>
                    {totals && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {Math.round(totals.calories)} kcal
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenFoodSelection(mealType)}
                    className="text-primary hover:text-primary hover:bg-transparent hover:font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    追加
                  </Button>
                </div>
              </CardHeader>
              {meal && meal.items.length > 0 && (
                <CardContent className="space-y-2">
                  {meal.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between p-3 bg-primary/5 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.foodName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round(item.calories)}kcal | P:{Math.round(item.proteinG)}g F:
                          {Math.round(item.fatG)}g C:{Math.round(item.carbG)}g
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteItem(meal.id, item.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {totals && (
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">合計</span>
                        <span className="text-foreground">
                          P:{Math.round(totals.protein)}g F:{Math.round(totals.fat)}g C:
                          {Math.round(totals.carb)}g
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}