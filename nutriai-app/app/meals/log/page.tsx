import { MealLogPage } from '@/components/features/meals/MealLogPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '食事記録 - NutriAI',
  description: '今日の食事を記録しましょう',
};

export default function MealLog() {
  return (
    <MainLayout>
      <MealLogPage />
    </MainLayout>
  );
}