'use client';

import { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { ArrowLeft, Smartphone, Watch, Activity, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface StepCounterPageProps {
  onBack: () => void;
}

export function StepCounterPage({ onBack }: StepCounterPageProps) {
  const [connectedDevices, setConnectedDevices] = useState({
    appleHealth: false,
    googleFit: false,
    fitbit: false,
    garmin: false
  });

  const [todaySteps] = useState(8547); // モックデータ

  const handleDeviceToggle = (device: keyof typeof connectedDevices) => {
    setConnectedDevices(prev => ({
      ...prev,
      [device]: !prev[device]
    }));

    const deviceNames = {
      appleHealth: 'Apple Health',
      googleFit: 'Google Fit',
      fitbit: 'Fitbit',
      garmin: 'Garmin'
    };

    if (!connectedDevices[device]) {
      toast.success(`${deviceNames[device]}と連携しました`);
    } else {
      toast.success(`${deviceNames[device]}の連携を解除しました`);
    }
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
          <h1 className="text-lg font-semibold">歩数連携</h1>
          <div className="w-12"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 今日の歩数 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              今日の歩数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-primary mb-2">
                {todaySteps.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">歩</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium">距離</div>
                <div className="text-muted-foreground">{(todaySteps * 0.0007).toFixed(1)} km</div>
              </div>
              <div className="text-center">
                <div className="font-medium">消費カロリー</div>
                <div className="text-muted-foreground">{Math.round(todaySteps * 0.04)} kcal</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* デバイス連携 */}
        <Card>
          <CardHeader>
            <CardTitle>デバイス連携</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Apple Health */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="font-medium">Apple Health</div>
                  <div className="text-sm text-muted-foreground">iPhoneの歩数データを取得</div>
                </div>
                {connectedDevices.appleHealth && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <Switch
                checked={connectedDevices.appleHealth}
                onCheckedChange={() => handleDeviceToggle('appleHealth')}
              />
            </div>

            {/* Google Fit */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium">Google Fit</div>
                  <div className="text-sm text-muted-foreground">Androidの歩数データを取得</div>
                </div>
                {connectedDevices.googleFit && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <Switch
                checked={connectedDevices.googleFit}
                onCheckedChange={() => handleDeviceToggle('googleFit')}
              />
            </div>

            {/* Fitbit */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Watch className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <div className="font-medium">Fitbit</div>
                  <div className="text-sm text-muted-foreground">Fitbitデバイスと連携</div>
                </div>
                {connectedDevices.fitbit && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <Switch
                checked={connectedDevices.fitbit}
                onCheckedChange={() => handleDeviceToggle('fitbit')}
              />
            </div>

            {/* Garmin */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Watch className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Garmin</div>
                  <div className="text-sm text-muted-foreground">Garminデバイスと連携</div>
                </div>
                {connectedDevices.garmin && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <Switch
                checked={connectedDevices.garmin}
                onCheckedChange={() => handleDeviceToggle('garmin')}
              />
            </div>
          </CardContent>
        </Card>

        {/* 注意事項 */}
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">ご注意</p>
              <ul className="space-y-1 pl-4">
                <li>• デバイス連携には各サービスでの認証が必要です</li>
                <li>• 歩数データは運動記録の消費カロリー計算に反映されます</li>
                <li>• データの同期には数分かかる場合があります</li>
                <li>• プライバシー設定により一部データが取得できない場合があります</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}