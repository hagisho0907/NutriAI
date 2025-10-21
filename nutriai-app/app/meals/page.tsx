import { MealLogPage } from '@/components/features/meals/MealLogPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '食事記録 - NutriAI',
  description: '食事を記録して、栄養バランスを管理しましょう',
};

export default function Meals() {
  return (
    <MainLayout>
      <MealLogPage />
    </MainLayout>
  );
}