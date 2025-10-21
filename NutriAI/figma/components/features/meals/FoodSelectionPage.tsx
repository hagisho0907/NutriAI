import { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../ui/dialog';
import { Search, Barcode, Camera, Plus, ArrowLeft, UtensilsCrossed, Edit, Trash2 } from 'lucide-react';
import { mockCustomFoods, mockCustomMeals, type CustomFood, type CustomMeal } from '../../../lib/mockData';
import { MealCreateEditPage } from '../custom-meals/MealCreateEditPage';
import { toast } from 'sonner@2.0.3';

interface RecentFood {
  id: string;
  name: string;
  calories: number;
  serving: string;
  brand?: string;
}

interface FoodSelectionPageProps {
  onBack: () => void;
  onNavigateToBarcode?: () => void;
  onNavigateToAiPhoto: () => void;
  onSelectFood?: (food: RecentFood) => void;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

const recentFoods: RecentFood[] = [
  {
    id: '1',
    name: '辛子めんたいこ',
    calories: 22,
    serving: '20 g, ふくやの辛子めんたいこ',
  },
  {
    id: '2',
    name: 'マンゴーラッシー',
    calories: 119,
    serving: '1 食, NATURECAN',
  },
  {
    id: '3',
    name: '和牛ももステーキ',
    calories: 210,
    serving: '150 g, 牛肉 牛もも肉',
  },
  {
    id: '4',
    name: '白飯',
    calories: 237,
    serving: '150 g, 白飯',
  },
];

export function FoodSelectionPage({
  onBack,
  onNavigateToBarcode,
  onNavigateToAiPhoto,
  onSelectFood,
  mealType,
}: FoodSelectionPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Custom Meals State
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>(mockCustomMeals);
  const [isCreatingMeal, setIsCreatingMeal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<CustomMeal | null>(null);

  // Custom Foods State
  const [customFoods, setCustomFoods] = useState<CustomFood[]>(mockCustomFoods);
  const [isFoodDialogOpen, setIsFoodDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<CustomFood | null>(null);
  const [foodFormData, setFoodFormData] = useState({
    name: '',
    servingSize: '',
    servingUnit: 'g',
    calories: '',
    proteinG: '',
    fatG: '',
    carbG: '',
  });

  const mealTypeLabels = {
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食',
    snack: '間食',
  };

  const filteredFoods = recentFoods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomFoods = customFoods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomMeals = customMeals.filter((meal) =>
    meal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Meal Handlers
  const handleCreateNewMeal = () => {
    setEditingMeal(null);
    setIsCreatingMeal(true);
  };

  const handleEditMeal = (meal: CustomMeal) => {
    setEditingMeal(meal);
    setIsCreatingMeal(true);
  };

  const handleSaveMeal = (meal: CustomMeal) => {
    if (editingMeal) {
      setCustomMeals(customMeals.map((m) => (m.id === editingMeal.id ? meal : m)));
      toast.success('マイミールを更新しました');
    } else {
      setCustomMeals([meal, ...customMeals]);
      toast.success('マイミールを作成しました');
    }
    setIsCreatingMeal(false);
    setEditingMeal(null);
  };

  const handleDeleteMeal = (id: string) => {
    setCustomMeals(customMeals.filter((m) => m.id !== id));
    toast.success('マイミールを削除しました');
    setIsCreatingMeal(false);
    setEditingMeal(null);
  };

  const handleBackFromMealEdit = () => {
    setIsCreatingMeal(false);
    setEditingMeal(null);
  };

  const handleSelectCustomMeal = (meal: CustomMeal) => {
    onSelectFood?.({
      id: meal.id,
      name: meal.name,
      calories: meal.totalCalories,
      serving: `${meal.foods.length}品`,
    });
  };

  // Food Handlers
  const handleOpenFoodDialog = (food?: CustomFood) => {
    if (food) {
      setEditingFood(food);
      setFoodFormData({
        name: food.name,
        servingSize: food.servingSize.toString(),
        servingUnit: food.servingUnit,
        calories: food.calories.toString(),
        proteinG: food.proteinG.toString(),
        fatG: food.fatG.toString(),
        carbG: food.carbG.toString(),
      });
    } else {
      setEditingFood(null);
      setFoodFormData({
        name: '',
        servingSize: '',
        servingUnit: 'g',
        calories: '',
        proteinG: '',
        fatG: '',
        carbG: '',
      });
    }
    setIsFoodDialogOpen(true);
  };

  const handleSaveFood = () => {
    if (!foodFormData.name || !foodFormData.servingSize || !foodFormData.calories) {
      toast.error('食品名、分量、カロリーは必須です');
      return;
    }

    const newFood: CustomFood = {
      id: editingFood ? editingFood.id : `cf-${Date.now()}`,
      name: foodFormData.name,
      servingSize: Number(foodFormData.servingSize),
      servingUnit: foodFormData.servingUnit,
      calories: Number(foodFormData.calories),
      proteinG: Number(foodFormData.proteinG) || 0,
      fatG: Number(foodFormData.fatG) || 0,
      carbG: Number(foodFormData.carbG) || 0,
      createdAt: editingFood ? editingFood.createdAt : new Date().toISOString(),
    };

    if (editingFood) {
      setCustomFoods(customFoods.map((f) => (f.id === editingFood.id ? newFood : f)));
      toast.success('マイフードを更新しました');
    } else {
      setCustomFoods([newFood, ...customFoods]);
      toast.success('マイフードを追加しました');
    }

    setIsFoodDialogOpen(false);
  };

  const handleDeleteFood = (id: string) => {
    setCustomFoods(customFoods.filter((f) => f.id !== id));
    toast.success('マイフードを削除しました');
  };

  const handleSelectCustomFood = (food: CustomFood) => {
    onSelectFood?.({
      id: food.id,
      name: food.name,
      calories: food.calories,
      serving: `${food.servingSize} ${food.servingUnit}`,
    });
  };

  // If creating/editing meal, show MealCreateEditPage
  if (isCreatingMeal) {
    return (
      <MealCreateEditPage
        meal={editingMeal}
        onSave={handleSaveMeal}
        onBack={handleBackFromMealEdit}
        onDelete={editingMeal ? handleDeleteMeal : undefined}
      />
    );
  }

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
          <h1 className="text-foreground">{mealTypeLabels[mealType]}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
          <Input
            placeholder="フードを検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-full">
            <TabsTrigger 
              value="all"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              すべて
            </TabsTrigger>
            <TabsTrigger 
              value="meals"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              マイミール
            </TabsTrigger>
            <TabsTrigger 
              value="foods"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              マイフード
            </TabsTrigger>
          </TabsList>

          {/* All Tab */}
          <TabsContent value="all" className="mt-4 space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              {/* Barcode Scan Card */}
              {onNavigateToBarcode && (
                <Card
                  className="cursor-pointer hover:bg-accent/5 transition-colors border-2"
                  onClick={onNavigateToBarcode}
                >
                  <CardContent className="pt-6 pb-6 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Barcode className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-center text-primary">
                      バーコードをスキャン
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* AI Photo Estimation Card */}
              <Card
                className="cursor-pointer hover:bg-accent/5 transition-colors border-2"
                onClick={onNavigateToAiPhoto}
              >
                <CardContent className="pt-6 pb-6 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-center text-primary">
                    AI写真推定
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Foods */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-foreground">履歴</h2>
                <Button variant="ghost" size="sm" className="text-sm">
                  最新
                </Button>
              </div>

              {filteredFoods.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                    検索結果が見つかりませんでした
                  </CardContent>
                </Card>
              ) : (
                filteredFoods.map((food) => (
                  <Card
                    key={food.id}
                    className="cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => onSelectFood?.(food)}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="truncate">{food.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {food.calories} カロリー, {food.serving}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-primary flex-shrink-0"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Meals Tab */}
          <TabsContent value="meals" className="mt-4 space-y-4">
            {/* Quick Action */}
            <Card
              className="cursor-pointer hover:bg-gray-50 transition-colors border-gray-200"
              onClick={handleCreateNewMeal}
            >
              <CardContent className="pt-8 pb-8 flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-center text-primary">食事を作成</p>
              </CardContent>
            </Card>

            {/* Meals List */}
            <div className="space-y-3">
              <h2 className="text-foreground">マイミール</h2>
              {filteredCustomMeals.length === 0 ? (
                <Card className="bg-white">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <p>まだマイミールがありません</p>
                    <p className="text-sm mt-2">「食事を作成」から追加しましょう</p>
                  </CardContent>
                </Card>
              ) : (
                filteredCustomMeals.map((meal) => (
                  <Card
                    key={meal.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors bg-white border-gray-200"
                    onClick={() => handleEditMeal(meal)}
                  >
                    <CardContent className="py-3">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                          {meal.photoUrl ? (
                            <img
                              src={meal.photoUrl}
                              alt={meal.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UtensilsCrossed className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{meal.name}</p>
                          <p className="text-sm text-gray-600">
                            {meal.totalCalories} カロリー, {meal.foods.length}品
                          </p>
                        </div>

                        {/* Add Button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-primary flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCustomMeal(meal);
                          }}
                        >
                          <Plus className="w-6 h-6" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Foods Tab */}
          <TabsContent value="foods" className="mt-4 space-y-4">
            {/* Add Button */}
            <Dialog open={isFoodDialogOpen} onOpenChange={setIsFoodDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => handleOpenFoodDialog()}
                  className="w-full bg-primary hover:bg-accent"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  新しい食品を登録
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingFood ? 'マイフードを編集' : 'マイフードを登録'}</DialogTitle>
                  <DialogDescription>
                    オリジナルの食品を登録して、食事記録で使用できます。
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">食品名 *</Label>
                    <Input
                      id="name"
                      value={foodFormData.name}
                      onChange={(e) => setFoodFormData({ ...foodFormData, name: e.target.value })}
                      placeholder="例: プロテインパンケーキ"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="servingSize">分量 *</Label>
                      <Input
                        id="servingSize"
                        type="number"
                        value={foodFormData.servingSize}
                        onChange={(e) => setFoodFormData({ ...foodFormData, servingSize: e.target.value })}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="servingUnit">単位 *</Label>
                      <select
                        id="servingUnit"
                        value={foodFormData.servingUnit}
                        onChange={(e) => setFoodFormData({ ...foodFormData, servingUnit: e.target.value })}
                        className="w-full h-10 px-3 border border-input rounded-md"
                      >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="個">個</option>
                        <option value="枚">枚</option>
                        <option value="杯">杯</option>
                        <option value="人前">人前</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="calories">カロリー (kcal) *</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={foodFormData.calories}
                      onChange={(e) => setFoodFormData({ ...foodFormData, calories: e.target.value })}
                      placeholder="200"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="proteinG">タンパク質 (g)</Label>
                      <Input
                        id="proteinG"
                        type="number"
                        value={foodFormData.proteinG}
                        onChange={(e) => setFoodFormData({ ...foodFormData, proteinG: e.target.value })}
                        placeholder="20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fatG">脂質 (g)</Label>
                      <Input
                        id="fatG"
                        type="number"
                        value={foodFormData.fatG}
                        onChange={(e) => setFoodFormData({ ...foodFormData, fatG: e.target.value })}
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="carbG">炭水化物 (g)</Label>
                      <Input
                        id="carbG"
                        type="number"
                        value={foodFormData.carbG}
                        onChange={(e) => setFoodFormData({ ...foodFormData, carbG: e.target.value })}
                        placeholder="30"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsFoodDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={handleSaveFood} className="bg-primary hover:bg-accent">
                    {editingFood ? '更新' : '登録'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Custom Foods List */}
            <div className="space-y-3">
              {filteredCustomFoods.length === 0 ? (
                <Card className="bg-white">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <p>まだマイフードがありません</p>
                    <p className="text-sm mt-2">「新しい食品を登録」ボタンから追加しましょう</p>
                  </CardContent>
                </Card>
              ) : (
                filteredCustomFoods.map((food) => (
                  <Card key={food.id} className="bg-white border-gray-200">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{food.name}</p>
                          <p className="text-sm text-gray-600">
                            {food.servingSize} {food.servingUnit}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenFoodDialog(food)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteFood(food.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary"
                            onClick={() => handleSelectCustomFood(food)}
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="text-center">
                          <div className="text-muted-foreground">カロリー</div>
                          <div>{food.calories} kcal</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">P</div>
                          <div>{food.proteinG}g</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">F</div>
                          <div>{food.fatG}g</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">C</div>
                          <div>{food.carbG}g</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
