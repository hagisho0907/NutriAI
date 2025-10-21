'use client';

import { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { ArrowLeft, Search, Plus, UtensilsCrossed, Copy } from 'lucide-react';
import { mockCustomMeals, type CustomMeal } from '../../../lib/mockData';
import { MealCreateEditPage } from './MealCreateEditPage';

export function MyMealsPage() {
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>(mockCustomMeals);
  const [isCreating, setIsCreating] = useState(false);
  const [editingMeal, setEditingMeal] = useState<CustomMeal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'meals' | 'recipes' | 'foods'>('meals');

  const filteredMeals = customMeals.filter((meal) =>
    meal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNew = () => {
    setEditingMeal(null);
    setIsCreating(true);
  };

  const handleEditMeal = (meal: CustomMeal) => {
    setEditingMeal(meal);
    setIsCreating(true);
  };

  const handleSaveMeal = (meal: CustomMeal) => {
    if (editingMeal) {
      setCustomMeals(customMeals.map((m) => (m.id === editingMeal.id ? meal : m)));
    } else {
      setCustomMeals([meal, ...customMeals]);
    }
    setIsCreating(false);
    setEditingMeal(null);
  };

  const handleDeleteMeal = (id: string) => {
    setCustomMeals(customMeals.filter((m) => m.id !== id));
  };

  const handleBack = () => {
    setIsCreating(false);
    setEditingMeal(null);
  };

  if (isCreating) {
    return (
      <MealCreateEditPage
        meal={editingMeal}
        onSave={handleSaveMeal}
        onBack={handleBack}
        onDelete={editingMeal ? handleDeleteMeal : undefined}
      />
    );
  }

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-foreground">おやつ・間食</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="マイミール (食事) を検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-100 border-0"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 px-1 whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setActiveTab('meals')}
            className={`pb-2 px-1 whitespace-nowrap ${
              activeTab === 'meals'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600'
            }`}
          >
            マイミール
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`pb-2 px-1 whitespace-nowrap ${
              activeTab === 'recipes'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600'
            }`}
          >
            マイレシピ
          </button>
          <button
            onClick={() => setActiveTab('foods')}
            className={`pb-2 px-1 whitespace-nowrap ${
              activeTab === 'foods'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600'
            }`}
          >
            マイフード
          </button>
        </div>

        {/* Quick Actions */}
        {activeTab === 'meals' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className="cursor-pointer hover:bg-gray-50 transition-colors border-gray-200"
                onClick={handleCreateNew}
              >
                <CardContent className="pt-8 pb-8 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UtensilsCrossed className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-center text-primary">食事を作成</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-gray-50 transition-colors border-gray-200">
                <CardContent className="pt-8 pb-8 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Copy className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-center text-primary">以前の食事をコピー</p>
                </CardContent>
              </Card>
            </div>

            {/* Meals List */}
            <div>
              <h2 className="mb-3">マイミール</h2>
              {filteredMeals.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <p>まだマイミールがありません</p>
                    <p className="text-sm mt-2">「食事を作成」から追加しましょう</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredMeals.map((meal) => (
                    <Card
                      key={meal.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors border-gray-200"
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
                            <h3 className="font-medium truncate">{meal.name}</h3>
                            <p className="text-sm text-gray-600">
                              {meal.totalCalories} カロリー, 1 meal,
                            </p>
                          </div>

                          {/* Add Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-primary flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle add to meal log
                            }}
                          >
                            <Plus className="w-6 h-6" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Other Tabs Placeholder */}
        {activeTab !== 'meals' && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>このタブは開発中です</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}