'use client';

import { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { ArrowLeft, Bell, Clock, Utensils, Activity, Scale, Save } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettingsPageProps {
  onBack: () => void;
}

export function NotificationSettingsPage({ onBack }: NotificationSettingsPageProps) {
  const [settings, setSettings] = useState({
    // 基本通知設定
    pushNotifications: true,
    emailNotifications: false,
    
    // 食事リマインダー
    mealReminders: true,
    breakfastTime: '08:00',
    lunchTime: '12:00',
    dinnerTime: '19:00',
    
    // その他のリマインダー
    exerciseReminders: true,
    exerciseTime: '18:00',
    weightReminders: true,
    weightTime: '07:00',
    waterReminders: true,
    waterInterval: '2', // 時間
    
    // 進捗通知
    dailySummary: true,
    weeklyReport: true,
    achievements: true,
    
    // 静音時間
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '07:00'
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleTimeChange = (key: keyof typeof settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would send data to backend
    toast.success('通知設定を保存しました');
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
          <h1 className="text-lg font-semibold">通知設定</h1>
          <div className="w-12"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 基本通知設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              基本設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">プッシュ通知</div>
                <div className="text-sm text-muted-foreground">アプリ内通知を受け取る</div>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={() => handleToggle('pushNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">メール通知</div>
                <div className="text-sm text-muted-foreground">重要な情報をメールで受け取る</div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>
          </CardContent>
        </Card>

        {/* 食事リマインダー */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              食事リマインダー
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">食事記録リマインダー</div>
                <div className="text-sm text-muted-foreground">食事時間に記録を促す通知</div>
              </div>
              <Switch
                checked={settings.mealReminders}
                onCheckedChange={() => handleToggle('mealReminders')}
              />
            </div>

            {settings.mealReminders && (
              <div className="space-y-3 pl-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="breakfast">朝食</Label>
                    <Input
                      id="breakfast"
                      type="time"
                      value={settings.breakfastTime}
                      onChange={(e) => handleTimeChange('breakfastTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lunch">昼食</Label>
                    <Input
                      id="lunch"
                      type="time"
                      value={settings.lunchTime}
                      onChange={(e) => handleTimeChange('lunchTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dinner">夕食</Label>
                    <Input
                      id="dinner"
                      type="time"
                      value={settings.dinnerTime}
                      onChange={(e) => handleTimeChange('dinnerTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* その他のリマインダー */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              その他のリマインダー
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Activity className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="font-medium">運動リマインダー</div>
                  <div className="text-sm text-muted-foreground">運動の時間をお知らせ</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {settings.exerciseReminders && (
                  <Input
                    type="time"
                    value={settings.exerciseTime}
                    onChange={(e) => handleTimeChange('exerciseTime', e.target.value)}
                    className="w-20"
                  />
                )}
                <Switch
                  checked={settings.exerciseReminders}
                  onCheckedChange={() => handleToggle('exerciseReminders')}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Scale className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium">体重測定リマインダー</div>
                  <div className="text-sm text-muted-foreground">毎日の体重記録をサポート</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {settings.weightReminders && (
                  <Input
                    type="time"
                    value={settings.weightTime}
                    onChange={(e) => handleTimeChange('weightTime', e.target.value)}
                    className="w-20"
                  />
                )}
                <Switch
                  checked={settings.weightReminders}
                  onCheckedChange={() => handleToggle('weightReminders')}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                  <span className="text-xs text-white">💧</span>
                </div>
                <div>
                  <div className="font-medium">水分摂取リマインダー</div>
                  <div className="text-sm text-muted-foreground">定期的な水分補給をサポート</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {settings.waterReminders && (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="1"
                      max="6"
                      value={settings.waterInterval}
                      onChange={(e) => handleTimeChange('waterInterval', e.target.value)}
                      className="w-16"
                    />
                    <span className="text-sm text-muted-foreground">時間</span>
                  </div>
                )}
                <Switch
                  checked={settings.waterReminders}
                  onCheckedChange={() => handleToggle('waterReminders')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 進捗通知 */}
        <Card>
          <CardHeader>
            <CardTitle>進捗・実績通知</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">日次サマリー</div>
                <div className="text-sm text-muted-foreground">1日の記録をまとめて通知</div>
              </div>
              <Switch
                checked={settings.dailySummary}
                onCheckedChange={() => handleToggle('dailySummary')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">週次レポート</div>
                <div className="text-sm text-muted-foreground">週間の進捗をレポートで通知</div>
              </div>
              <Switch
                checked={settings.weeklyReport}
                onCheckedChange={() => handleToggle('weeklyReport')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">達成バッジ</div>
                <div className="text-sm text-muted-foreground">目標達成時の通知</div>
              </div>
              <Switch
                checked={settings.achievements}
                onCheckedChange={() => handleToggle('achievements')}
              />
            </div>
          </CardContent>
        </Card>

        {/* 静音時間 */}
        <Card>
          <CardHeader>
            <CardTitle>静音時間</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">静音時間を設定</div>
                <div className="text-sm text-muted-foreground">指定時間は通知を停止</div>
              </div>
              <Switch
                checked={settings.quietHours}
                onCheckedChange={() => handleToggle('quietHours')}
              />
            </div>

            {settings.quietHours && (
              <div className="grid grid-cols-2 gap-4 pl-4">
                <div className="space-y-2">
                  <Label htmlFor="quietStart">開始時刻</Label>
                  <Input
                    id="quietStart"
                    type="time"
                    value={settings.quietStart}
                    onChange={(e) => handleTimeChange('quietStart', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quietEnd">終了時刻</Label>
                  <Input
                    id="quietEnd"
                    type="time"
                    value={settings.quietEnd}
                    onChange={(e) => handleTimeChange('quietEnd', e.target.value)}
                  />
                </div>
              </div>
            )}
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