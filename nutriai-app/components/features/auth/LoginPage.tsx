'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '../../ui/carousel';
import { Chrome } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Apple Icon SVG Component
function AppleIcon() {
  return (
    <svg 
      width="64" 
      height="64" 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path 
        d="M16 4C16 4 18 2 20 4C22 6 22 8 22 8M8 12C8 12 6 14 6 18C6 22 8 26 12 28C14 29 16 29 16 29C16 29 18 29 20 28C24 26 26 22 26 18C26 14 24 12 24 12C24 12 22 10 18 10C16 10 16 10 16 10C16 10 16 10 14 10C10 10 8 12 8 12Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LoginPage() {
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const handleLogin = () => {
    // In a real app, this would handle authentication
    // For now, go to onboarding for new users
    router.push('/onboarding');
  };

  const screenshots = [
    {
      title: "食事記録",
      description: "写真を撮るだけで栄養素を自動計算",
      color: "bg-gradient-to-br from-green-100 to-green-200",
      icon: "📸"
    },
    {
      title: "運動記録",
      description: "簡単な入力で消費カロリーを管理",
      color: "bg-gradient-to-br from-blue-100 to-blue-200",
      icon: "🏃‍♀️"
    },
    {
      title: "進捗分析",
      description: "目標達成度をグラフで可視化",
      color: "bg-gradient-to-br from-purple-100 to-purple-200",
      icon: "📊"
    }
  ];

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center pt-16 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <AppleIcon />
          <h1 className="text-4xl font-bold text-primary" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-1px' }}>
            NutriAI
          </h1>
        </div>
        <p className="text-xl text-muted-foreground text-center px-4">
          とにかく楽にダイエットをサポート
        </p>
      </div>

      {/* Screenshot Carousel */}
      <div className="flex-1 flex flex-col justify-center px-4">
        <Carousel className="w-full max-w-sm mx-auto" setApi={setApi}>
          <CarouselContent>
            {screenshots.map((screenshot, index) => (
              <CarouselItem key={index}>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className={`${screenshot.color} rounded-xl h-80 flex flex-col items-center justify-center mb-4 relative overflow-hidden`}>
                      {/* Mock App UI */}
                      <div className="absolute top-4 left-4 right-4">
                        <div className="h-2 bg-white/30 rounded-full mb-2"></div>
                        <div className="h-8 bg-white/20 rounded-lg flex items-center px-3">
                          <div className="w-4 h-4 bg-white/40 rounded mr-2"></div>
                          <div className="flex-1 h-2 bg-white/30 rounded"></div>
                        </div>
                      </div>
                      
                      <div className="text-6xl mb-4">{screenshot.icon}</div>
                      
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="h-12 bg-white/20 rounded-lg"></div>
                          <div className="h-12 bg-white/20 rounded-lg"></div>
                        </div>
                        <div className="h-16 bg-white/30 rounded-lg"></div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {screenshot.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {screenshot.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {screenshots.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                current === index ? 'bg-primary' : 'bg-gray-300'
              }`}
              aria-label={`スライド ${index + 1} に移動`}
            />
          ))}
        </div>
      </div>

      {/* Login Buttons */}
      <div className="p-6 space-y-4">
        <Button
          onClick={handleLogin}
          className="w-full bg-primary hover:bg-primary/90 text-white h-12"
        >
          <Chrome className="w-5 h-5 mr-2" />
          Googleで始める
        </Button>

        <Button
          onClick={handleLogin}
          variant="outline"
          className="w-full h-12"
        >
          メールアドレスで登録
        </Button>

        <button
          onClick={handleLogin}
          className="w-full text-muted-foreground text-sm hover:text-foreground py-2"
        >
          ゲストモードで試す
        </button>

        <p className="text-xs text-center text-muted-foreground pt-4">
          利用開始することで、利用規約とプライバシーポリシーに同意したものとみなされます
        </p>
      </div>
    </div>
  );
}

