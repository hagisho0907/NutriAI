'use client';

import { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { ArrowLeft, User, Target, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { mockUser } from '../../../lib/mockData';
import { ProfilePage } from './ProfilePage';
import { GoalSettingsPage } from './GoalSettingsPage';

type ViewMode = 'main' | 'profile' | 'goals';

interface ProfileSettingsPageProps {
  onBack: () => void;
}

export function ProfileSettingsPage({ onBack }: ProfileSettingsPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('main');

  if (viewMode === 'profile') {
    return <ProfilePage onBack={() => setViewMode('main')} />;
  }

  if (viewMode === 'goals') {
    return <GoalSettingsPage onBack={() => setViewMode('main')} />;
  }

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
          <h1 className="text-lg font-semibold">設定</h1>
          <div className="w-12"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* プロフィール概要 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary text-white text-xl">
                  {(mockUser as any).displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{(mockUser as any).displayName || 'ユーザー'}</h2>
                <p className="text-muted-foreground">
                  {(mockUser as any).age && `${(mockUser as any).age}歳`}
                  {(mockUser as any).gender && ` • ${(mockUser as any).gender === 'male' ? '男性' : (mockUser as any).gender === 'female' ? '女性' : 'その他'}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(mockUser as any).height && `身長: ${(mockUser as any).height}cm`}
                  {(mockUser as any).weight && ` • 体重: ${(mockUser as any).weight}kg`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 設定メニュー */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-16 justify-between p-4"
            onClick={() => setViewMode('profile')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">ユーザー情報の変更</div>
                <div className="text-sm text-muted-foreground">名前、年齢、身長、体重等の変更</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Button>

          <Button
            variant="outline"
            className="w-full h-16 justify-between p-4"
            onClick={() => setViewMode('goals')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-left">
                <div className="font-medium">目標の手動変更</div>
                <div className="text-sm text-muted-foreground">1日の摂取カロリー、PFCバランスの設定</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}