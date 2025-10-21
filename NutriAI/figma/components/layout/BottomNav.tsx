import { Home, Utensils, Activity, TrendingUp, MessageCircle } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'exercises', label: '運動', icon: Activity },
    { id: 'meals', label: '食事', icon: Utensils },
    { id: 'dashboard', label: 'ホーム', icon: Home },
    { id: 'analytics', label: '分析', icon: TrendingUp },
    { id: 'chat', label: 'チャット', icon: MessageCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
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