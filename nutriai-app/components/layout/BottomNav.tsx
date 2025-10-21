'use client';

import { Home, Utensils, Activity, TrendingUp, MessageCircle } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { id: 'exercises', label: '運動', icon: Activity, href: '/exercises' },
    { id: 'meals', label: '食事', icon: Utensils, href: '/meals' },
    { id: 'dashboard', label: 'ホーム', icon: Home, href: '/' },
    { id: 'analytics', label: '分析', icon: TrendingUp, href: '/analytics' },
    { id: 'chat', label: 'チャット', icon: MessageCircle, href: '/chat' },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs mt-1 ${isActive ? '' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}