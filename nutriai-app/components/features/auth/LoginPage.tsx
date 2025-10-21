'use client';

import { Button } from '../../ui/button';
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

  const handleLogin = () => {
    // In a real app, this would handle authentication
    router.push('/onboarding');
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <AppleIcon />
          </div>
          <h1 className="text-primary" style={{ fontWeight: 600 }}>NutriAI</h1>
          <p className="text-muted-foreground mt-2">とにかく楽にダイエットをサポート</p>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <FeatureCard
            icon="📸"
            title="写真で簡単記録"
            description="食事の写真を撮るだけで栄養素を自動推定"
          />
          <FeatureCard
            icon="🎯"
            title="AI目標設定"
            description="あなたに合った現実的な目標をAIが提案"
          />
          <FeatureCard
            icon="💬"
            title="いつでも相談"
            description="栄養やトレーニングの疑問をAIに相談"
          />
        </div>

        {/* Login Buttons */}
        <div className="space-y-3">
          <Button onClick={handleLogin} className="w-full bg-primary hover:bg-accent">
            <Chrome className="mr-2 h-5 w-5" />
            Googleで始める
          </Button>
          <Button onClick={handleLogin} variant="outline" className="w-full">
            メールアドレスで登録
          </Button>
          <button onClick={handleLogin} className="w-full text-muted-foreground text-sm hover:text-foreground">
            ゲストモードで試す
          </button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          利用開始することで、利用規約とプライバシーポリシーに同意したものとみなされます
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
      <div className="text-2xl">{icon}</div>
      <div>
        <h3 className="text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}