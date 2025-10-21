import { useState } from 'react';
import { Search, Barcode, Plus, ArrowLeft } from 'lucide-react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { mockFoods, type Food } from '../../../lib/mockData';

interface BarcodeSearchPageProps {
  onClose?: () => void;
  onSelectFood?: (food: Food) => void;
}

export function BarcodeSearchPage({ onClose, onSelectFood }: BarcodeSearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);
  const [manualFormData, setManualFormData] = useState({
    name: '',
    brand: '',
    calories: '',
    proteinG: '',
    fatG: '',
    carbG: '',
    servingSize: '',
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // Search by keyword or JAN code
    const results = mockFoods.filter(
      (food) =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.janCode?.includes(searchQuery) ||
        food.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(results);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddFood = (food: Food) => {
    if (onSelectFood) {
      onSelectFood(food);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleManualSubmit = () => {
    // In a real app, this would POST to /foods
    console.log('Manual food submission:', manualFormData);
    setIsManualFormOpen(false);
    // Reset form
    setManualFormData({
      name: '',
      brand: '',
      calories: '',
      proteinG: '',
      fatG: '',
      carbG: '',
      servingSize: '',
    });
    alert('食品情報が送信されました。管理者のレビュー後に利用可能になります。');
  };

  return (
    <div className="h-full flex flex-col bg-[#F5FBF6]">
      {/* Header */}
      <div className="bg-[#42B883] text-white p-4 flex items-center gap-3">
        {onClose && (
          <button onClick={onClose} className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <Barcode className="h-5 w-5" />
          <h1>バーコード検索</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white border-b">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="商品名またはJANコードを入力"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} className="bg-[#42B883] hover:bg-[#2F855A]">
            検索
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          ※モックではバーコードカメラは利用できません。テキスト入力で検索してください。
        </p>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {searchResults.length === 0 && searchQuery && (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500 mb-4">該当する食品が見つかりませんでした</p>
              <Button
                variant="outline"
                onClick={() => setIsManualFormOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                手動で登録する
              </Button>
            </CardContent>
          </Card>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {searchResults.length}件の食品が見つかりました
            </p>
            {searchResults.map((food) => (
              <Card key={food.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base mb-1 truncate">
                        {food.name}
                      </CardTitle>
                      {food.brand && (
                        <CardDescription className="truncate">{food.brand}</CardDescription>
                      )}
                      {food.category && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {food.category}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddFood(food)}
                      className="bg-[#42B883] hover:bg-[#2F855A] shrink-0"
                    >
                      追加
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">カロリー</p>
                      <p className="font-medium">{food.calories} kcal</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">たんぱく質</p>
                      <p className="font-medium">{food.proteinG} g</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">脂質</p>
                      <p className="font-medium">{food.fatG} g</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">炭水化物</p>
                      <p className="font-medium">{food.carbG} g</p>
                    </div>
                  </div>
                  {food.servingSize && (
                    <p className="text-xs text-gray-500 mt-2">
                      1食分: {food.servingSize} {food.servingUnit}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!searchQuery && (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <Barcode className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 mb-2">
                商品名やJANコードで食品を検索できます
              </p>
              <p className="text-sm text-gray-400">
                検索してみましょう
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Manual Entry Dialog */}
      <Dialog open={isManualFormOpen} onOpenChange={setIsManualFormOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>食品を手動登録</DialogTitle>
            <DialogDescription>
              未登録の食品情報を入力してください。管理者のレビュー後に利用可能になります。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">商品名 *</Label>
              <Input
                id="name"
                value={manualFormData.name}
                onChange={(e) =>
                  setManualFormData({ ...manualFormData, name: e.target.value })
                }
                placeholder="例: プロテインバー"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">ブランド</Label>
              <Input
                id="brand"
                value={manualFormData.brand}
                onChange={(e) =>
                  setManualFormData({ ...manualFormData, brand: e.target.value })
                }
                placeholder="例: マイプロテイン"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servingSize">1食分の量</Label>
              <Input
                id="servingSize"
                value={manualFormData.servingSize}
                onChange={(e) =>
                  setManualFormData({ ...manualFormData, servingSize: e.target.value })
                }
                placeholder="例: 60g"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">カロリー (kcal) *</Label>
                <Input
                  id="calories"
                  type="number"
                  value={manualFormData.calories}
                  onChange={(e) =>
                    setManualFormData({ ...manualFormData, calories: e.target.value })
                  }
                  placeholder="200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proteinG">たんぱく質 (g) *</Label>
                <Input
                  id="proteinG"
                  type="number"
                  value={manualFormData.proteinG}
                  onChange={(e) =>
                    setManualFormData({ ...manualFormData, proteinG: e.target.value })
                  }
                  placeholder="20"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fatG">脂質 (g) *</Label>
                <Input
                  id="fatG"
                  type="number"
                  value={manualFormData.fatG}
                  onChange={(e) =>
                    setManualFormData({ ...manualFormData, fatG: e.target.value })
                  }
                  placeholder="8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbG">炭水化物 (g) *</Label>
                <Input
                  id="carbG"
                  type="number"
                  value={manualFormData.carbG}
                  onChange={(e) =>
                    setManualFormData({ ...manualFormData, carbG: e.target.value })
                  }
                  placeholder="25"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManualFormOpen(false)}>
              キャンセル
            </Button>
            <Button
              onClick={handleManualSubmit}
              disabled={
                !manualFormData.name ||
                !manualFormData.calories ||
                !manualFormData.proteinG ||
                !manualFormData.fatG ||
                !manualFormData.carbG
              }
              className="bg-[#42B883] hover:bg-[#2F855A]"
            >
              送信
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
