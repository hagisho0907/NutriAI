'use client';

import { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { ArrowLeft, Sun, Moon, Monitor, Palette, Save } from 'lucide-react';
import { toast } from 'sonner';

interface AppearanceSettingsPageProps {
  onBack: () => void;
}

export function AppearanceSettingsPage({ onBack }: AppearanceSettingsPageProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [accentColor, setAccentColor] = useState('#42B883');

  const themeOptions = [
    {
      value: 'light' as const,
      label: 'ライトモード',
      description: '明るい背景で表示',
      icon: Sun,
      preview: 'bg-white border-gray-200'
    },
    {
      value: 'dark' as const,
      label: 'ダークモード',
      description: '暗い背景で表示',
      icon: Moon,
      preview: 'bg-gray-900 border-gray-700'
    },
    {
      value: 'system' as const,
      label: 'システム設定',
      description: 'デバイス設定に従う',
      icon: Monitor,
      preview: 'bg-gradient-to-r from-white to-gray-900 border-gray-400'
    }
  ];

  const accentColors = [
    { name: 'グリーン（デフォルト）', value: '#42B883' },
    { name: 'ブルー', value: '#3B82F6' },
    { name: 'パープル', value: '#8B5CF6' },
    { name: 'ピンク', value: '#EC4899' },
    { name: 'オレンジ', value: '#F59E0B' },
    { name: 'レッド', value: '#EF4444' }
  ];

  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme);
    
    // In a real app, this would apply the theme
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme detection would be implemented here
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    toast.success(`テーマを${newTheme === 'light' ? 'ライト' : newTheme === 'dark' ? 'ダーク' : 'システム設定'}に変更しました`);
  };

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
    
    // In a real app, this would update CSS custom properties
    document.documentElement.style.setProperty('--color-primary', color);
    
    toast.success('アクセントカラーを変更しました');
  };

  const handleSave = () => {
    // In a real app, this would save to backend/localStorage
    toast.success('表示設定を保存しました');
    onBack();
  };

  return (
    <div className="min-h-screen bg-primary/5">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-5 h-5" />
            戻る
          </button>
          <h1 className="text-lg font-semibold">表示設定</h1>
          <div className="w-12"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* テーマ設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              テーマ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {themeOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`w-full p-4 border rounded-lg text-left transition-all ${
                    theme === option.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-8 rounded border ${option.preview}`}></div>
                    <div className="flex items-center gap-2 flex-1">
                      <IconComponent className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                    {theme === option.value && (
                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                    )}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* アクセントカラー */}
        <Card>
          <CardHeader>
            <CardTitle>アクセントカラー</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {accentColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleAccentColorChange(color.value)}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    accentColor === color.value 
                      ? 'border-gray-400 ring-2 ring-gray-300' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: color.value }}
                    ></div>
                    <div className="text-sm font-medium">{color.name}</div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">プレビュー</div>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  style={{ backgroundColor: accentColor }}
                >
                  プライマリボタン
                </Button>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  ></div>
                  <span className="text-sm">アクセントカラーの例</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* その他の表示設定 */}
        <Card>
          <CardHeader>
            <CardTitle>その他の設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• テーマ設定はアプリ全体に適用されます</p>
              <p>• システム設定を選択すると、デバイスの設定に自動で合わせます</p>
              <p>• アクセントカラーはボタンやリンクの色に反映されます</p>
              <p>• 設定は次回起動時にも保持されます</p>
            </div>
          </CardContent>
        </Card>

        {/* 保存ボタン */}
        <Button onClick={handleSave} className="w-full h-12 bg-primary hover:bg-[#2F855A]">
          <Save className="w-5 h-5 mr-2" />
          設定を保存
        </Button>
      </div>
    </div>
  );
}