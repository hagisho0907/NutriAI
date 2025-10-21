'use client';

import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  
  // Don't show BottomNav on auth pages
  const hideBottomNav = pathname.startsWith('/login') || pathname.startsWith('/onboarding');

  return (
    <main className="min-h-screen bg-background">
      <div className={`max-w-2xl mx-auto ${!hideBottomNav ? 'pb-16' : ''}`}>
        {children}
      </div>
      {!hideBottomNav && <BottomNav />}
    </main>
  );
}