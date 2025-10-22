'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../ui/dialog';
import { Plus, Trash2, Edit } from 'lucide-react';
import { mockCustomFoods, type CustomFood } from '../../../lib/mockData';
import { toast } from 'sonner';

export function MyFoodsPage() {
  const [customFoods, setCustomFoods] = useState<CustomFood[]>(mockCustomFoods);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<CustomFood | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    servingSize: '',
    servingUnit: 'g',
    calories: '',
    proteinG: '',
    fatG: '',
    carbG: '',
  });

  const handleOpenDialog = (food?: CustomFood) => {
    if (food) {
      setEditingFood(food);
      setFormData({
        name: food.name,
        servingSize: food.servingSize !== undefined ? food.servingSize.toString() : '',
        servingUnit: food.servingUnit ?? 'g',
        calories: food.calories.toString(),
        proteinG: food.proteinG.toString(),
        fatG: food.fatG.toString(),
        carbG: food.carbG.toString(),
      });
    } else {
      setEditingFood(null);
      setFormData({
        name: '',
        servingSize: '',
        servingUnit: 'g',
        calories: '',
        proteinG: '',
        fatG: '',
        carbG: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.servingSize || !formData.calories) {
      toast.error('食品名、分量、カロリーは必須です');
      return;
    }

    const newFood: CustomFood = {
      id: editingFood ? editingFood.id : `cf-${Date.now()}`,
      name: formData.name,
      servingSize: Number(formData.servingSize),
      servingUnit: formData.servingUnit,
      calories: Number(formData.calories),
      proteinG: Number(formData.proteinG) || 0,
      fatG: Number(formData.fatG) || 0,
      carbG: Number(formData.carbG) || 0,
      createdAt: editingFood ? editingFood.createdAt : new Date().toISOString(),
      createdBy: editingFood?.createdBy ?? 'user-demo',
    };

    if (editingFood) {
      setCustomFoods(customFoods.map((f) => (f.id === editingFood.id ? newFood : f)));
      toast.success('マイフードを更新しました');
    } else {
      setCustomFoods([newFood, ...customFoods]);
      toast.success('マイフードを追加しました');
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setCustomFoods(customFoods.filter((f) => f.id !== id));
    toast.success('マイフードを削除しました');
  };

  return (
    <div className="pb-20 bg-primary/5 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-foreground">マイフード</h1>
          <p className="text-sm text-muted-foreground">自分で登録した食品</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Add Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => handleOpenDialog()}
              className="w-full bg-primary hover:bg-accent"
            >
              <Plus className="w-5 h-5 mr-2" />
              新しい食品を登録
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingFood ? 'マイフードを編集' : 'マイフードを登録'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">食品名 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: プロテインパンケーキ"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="servingSize">分量 *</Label>
                  <Input
                    id="servingSize"
                    type="number"
                    value={formData.servingSize}
                    onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="servingUnit">単位 *</Label>
                  <select
                    id="servingUnit"
                    value={formData.servingUnit}
                    onChange={(e) => setFormData({ ...formData, servingUnit: e.target.value })}
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
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  placeholder="200"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="proteinG">タンパク質 (g)</Label>
                  <Input
                    id="proteinG"
                    type="number"
                    value={formData.proteinG}
                    onChange={(e) => setFormData({ ...formData, proteinG: e.target.value })}
                    placeholder="20"
                  />
                </div>
                <div>
                  <Label htmlFor="fatG">脂質 (g)</Label>
                  <Input
                    id="fatG"
                    type="number"
                    value={formData.fatG}
                    onChange={(e) => setFormData({ ...formData, fatG: e.target.value })}
                    placeholder="5"
                  />
                </div>
                <div>
                  <Label htmlFor="carbG">炭水化物 (g)</Label>
                  <Input
                    id="carbG"
                    type="number"
                    value={formData.carbG}
                    onChange={(e) => setFormData({ ...formData, carbG: e.target.value })}
                    placeholder="30"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-accent">
                {editingFood ? '更新' : '登録'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Custom Foods List */}
        {customFoods.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>まだマイフードがありません</p>
              <p className="text-sm mt-2">「新しい食品を登録」ボタンから追加しましょう</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {customFoods.map((food) => (
              <Card key={food.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-start justify-between">
                    <div>
                      <div>{food.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {food.servingSize} {food.servingUnit}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenDialog(food)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(food.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
