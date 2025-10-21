'use client';

import { DashboardPage } from '@/components/features/dashboard/DashboardPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleNavigate = (page: string) => {
    router.push(page);
  };

  return (
    <MainLayout>
      <DashboardPage onNavigate={handleNavigate} />
    </MainLayout>
  );
}
