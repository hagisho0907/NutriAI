'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { ArrowLeft, Camera, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { mockFoods, type CustomMeal, type Food } from '../../../lib/mockData';
import { toast } from 'sonner';

interface MealCreateEditPageProps {
  meal: CustomMeal | null;
  onSave: (meal: CustomMeal) => void;
  onBack: () => void;
  onDelete?: (id: string) => void;
}

export function MealCreateEditPage({ meal, onSave, onBack, onDelete }: MealCreateEditPageProps) {
  const [mealName, setMealName] = useState(meal?.name || '');
  const [photoUrl, setPhotoUrl] = useState(meal?.photoUrl || '');
  const [isPublic, setIsPublic] = useState(meal?.isPublic ?? true);
  const [instructions, setInstructions] = useState(meal?.instructions || '');
  const [selectedFoods, setSelectedFoods] = useState<CustomMeal['foods']>(meal?.foods || []);
  const [isAddFoodDialogOpen, setIsAddFoodDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNutritionDetails, setShowNutritionDetails] = useState(false);

  const filteredFoods = mockFoods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateTotals = () => {
    return selectedFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.calories,
        proteinG: acc.proteinG + food.proteinG,
        fatG: acc.fatG + food.fatG,
        carbG: acc.carbG + food.carbG,
      }),
      { calories: 0, proteinG: 0, fatG: 0, carbG: 0 }
    );
  };

  const totals = calculateTotals();
  
  const calculatePercentage = (value: number, targetCalories: number) => {
    if (totals.calories === 0) return 0;
    const calories = value * (value === totals.proteinG || value === totals.carbG ? 4 : 9);
    return Math.round((calories / totals.calories) * 100);
  };

  const handleAddFood = (food: Food) => {
    const servingSize = food.servingSize || 100;
    const servingUnit = food.servingUnit || 'g';

    const newFood = {
      foodId: food.id,
      foodName: food.name,
      quantity: servingSize,
      unit: servingUnit,
      calories: food.calories,
      proteinG: food.proteinG,
      fatG: food.fatG,
      carbG: food.carbG,
    };

    setSelectedFoods([...selectedFoods, newFood]);
    setIsAddFoodDialogOpen(false);
    toast.success(`${food.name}を追加しました`);
  };

  const handleRemoveFood = (index: number) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    const food = selectedFoods[index];
    const originalFood = mockFoods.find((f) => f.id === food.foodId);
    if (!originalFood) return;

    const servingSize = originalFood.servingSize || 100;
    const multiplier = newQuantity / servingSize;

    const updatedFood = {
      ...food,
      quantity: newQuantity,
      calories: Math.round(originalFood.calories * multiplier),
      proteinG: Number((originalFood.proteinG * multiplier).toFixed(1)),
      fatG: Number((originalFood.fatG * multiplier).toFixed(1)),
      carbG: Number((originalFood.carbG * multiplier).toFixed(1)),
    };

    setSelectedFoods(selectedFoods.map((f, i) => (i === index ? updatedFood : f)));
  };

  const handleSave = () => {
    if (!mealName.trim()) {
      toast.error('ミール名を入力してください');
      return;
    }

    if (selectedFoods.length === 0) {
      toast.error('少なくとも1つの食品を追加してください');
      return;
    }

    const newMeal: CustomMeal = {
      id: meal?.id || `cm-${Date.now()}`,
      name: mealName,
      photoUrl,
      foods: selectedFoods,
      totalCalories: totals.calories,
      totalProteinG: Number(totals.proteinG.toFixed(1)),
      totalFatG: Number(totals.fatG.toFixed(1)),
      totalCarbG: Number(totals.carbG.toFixed(1)),
      instructions,
      isPublic,
      createdAt: meal?.createdAt || new Date().toISOString(),
    };

    onSave(newMeal);
    toast.success(meal ? 'ミールを更新しました' : 'ミールを作成しました');
  };

  const handleAddPhoto = () => {
    // Simulate photo upload
    const placeholderUrl = 'https://images.unsplash.com/photo-1615444432044-413ff198ba73?w=400';
    setPhotoUrl(placeholderUrl);
    toast.success('写真を追加しました');
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-white">食事を作成</h1>
          <Button
            variant="ghost"
            onClick={handleSave}
            className="text-white hover:bg-white/20"
          >
            保存
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Photo Section */}
        <div
          className="bg-primary h-48 flex items-center justify-center cursor-pointer relative"
          onClick={handleAddPhoto}
          style={{
            backgroundImage: photoUrl ? `url(${photoUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!photoUrl && (
            <div className="text-center text-white">
              <Camera className="w-12 h-12 mx-auto mb-2" />
              <p>写真を追加</p>
            </div>
          )}
        </div>

        {/* Meal Name */}
        <div className="bg-white p-4 border-b border-gray-200">
          <Input
            placeholder="この食事に名前を付けてください"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            className="border-0 bg-transparent text-base placeholder:text-gray-400"
          />
        </div>

        {/* Public/Private */}
        <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <span className="text-gray-700">共有先</span>
          <Button
            variant="ghost"
            onClick={() => setIsPublic(!isPublic)}
            className="text-primary hover:text-primary hover:bg-primary/10 h-auto p-2"
          >
            {isPublic ? '公開' : '非公開'}
          </Button>
        </div>

        {/* Nutrition Summary */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center gap-6">
            {/* Calories Circle */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl">{totals.calories}</div>
                  <div className="text-xs text-gray-500">kcal</div>
                </div>
              </div>
            </div>

            {/* Macros */}
            <div className="flex-1 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500">{calculatePercentage(totals.carbG, totals.calories)}%</div>
                <div className="text-base">{totals.carbG.toFixed(1)} g</div>
                <div className="text-xs text-blue-500">炭水化物</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">{calculatePercentage(totals.fatG, totals.calories)}%</div>
                <div className="text-base">{totals.fatG.toFixed(1)} g</div>
                <div className="text-xs text-purple-500">脂質</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">{calculatePercentage(totals.proteinG, totals.calories)}%</div>
                <div className="text-base">{totals.proteinG.toFixed(1)} g</div>
                <div className="text-xs text-orange-500">タンパク質</div>
              </div>
            </div>
          </div>

          {/* Nutrition Details Toggle */}
          <Collapsible open={showNutritionDetails} onOpenChange={setShowNutritionDetails}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full mt-3 text-gray-600">
                栄養成分表を表示
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showNutritionDetails ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">総カロリー</span>
                <span>{totals.calories} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">炭水化物</span>
                <span>{totals.carbG.toFixed(1)} g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">脂質</span>
                <span>{totals.fatG.toFixed(1)} g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">タンパク質</span>
                <span>{totals.proteinG.toFixed(1)} g</span>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Food Items Section */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2>食事品目</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsAddFoodDialogOpen(true)}
              className="text-primary hover:text-primary hover:bg-transparent"
            >
              <Plus className="w-4 h-4 hover:stroke-[2.5]" />
            </Button>
          </div>
          {selectedFoods.length === 0 ? (
            <Button
              variant="ghost"
              onClick={() => setIsAddFoodDialogOpen(true)}
              className="text-primary hover:text-primary hover:bg-transparent hover:font-semibold h-auto p-0 text-sm justify-start"
            >
              この食事にアイテムを追加
            </Button>
          ) : (
            <div className="space-y-2">
              {selectedFoods.map((food, idx) => (
                <Card key={idx} className="border-gray-200">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="text-sm">{food.foodName}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={food.quantity}
                            onChange={(e) => handleUpdateQuantity(idx, Number(e.target.value))}
                            className="w-20 h-8 text-sm"
                          />
                          <span className="text-sm text-gray-500">{food.unit}</span>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>{food.calories} kcal</div>
                        <div className="text-xs text-gray-500">
                          P:{food.proteinG}g F:{food.fatG}g C:{food.carbG}g
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFood(idx)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Instructions Section */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2>手順</h2>
            <Button
              variant="ghost"
              className="text-primary hover:text-primary hover:bg-transparent hover:font-semibold h-auto p-2 text-sm"
            >
              追加
            </Button>
          </div>
          <Textarea
            placeholder="作り方や食べ方を記入..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="min-h-20 border-gray-300"
          />
        </div>

        {/* Add Food Button */}
        <div className="p-4">
          <Button
            onClick={() => setIsAddFoodDialogOpen(true)}
            className="w-full bg-primary hover:bg-accent h-12"
          >
            フードを追加
          </Button>
        </div>

        {/* Delete Button (if editing) */}
        {meal && onDelete && (
          <div className="p-4 pt-0">
            <Button
              onClick={() => {
                if (window.confirm('このミールを削除しますか？')) {
                  onDelete(meal.id);
                  onBack();
                }
              }}
              variant="outline"
              className="w-full text-destructive border-destructive hover:bg-destructive/10"
            >
              このミールを削除
            </Button>
          </div>
        )}
      </div>

      {/* Add Food Dialog */}
      <Dialog open={isAddFoodDialogOpen} onOpenChange={setIsAddFoodDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>フードを追加</DialogTitle>
            <DialogDescription>
              ミールに追加する食品を検索して選択してください。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="フードを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {filteredFoods.map((food) => (
                <Card
                  key={food.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleAddFood(food)}
                >
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">{food.name}</div>
                        <div className="text-xs text-gray-500">
                          {food.servingSize} {food.servingUnit} あたり
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>{food.calories} kcal</div>
                        <div className="text-xs text-gray-500">
                          P:{food.proteinG}g F:{food.fatG}g C:{food.carbG}g
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}