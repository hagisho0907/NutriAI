import { AnalyticsPage } from '@/components/features/analytics/AnalyticsPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '分析 - NutriAI',
  description: '栄養や運動のデータを分析して、進捗を確認しましょう',
};

export default function Analytics() {
  return (
    <MainLayout>
      <AnalyticsPage />
    </MainLayout>
  );
}