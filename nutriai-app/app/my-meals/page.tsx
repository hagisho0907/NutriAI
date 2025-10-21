import { MyMealsPage } from '@/components/features/custom-meals/MyMealsPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'マイミール - NutriAI',
  description: 'あなたが作成したお気に入りの食事を管理しましょう',
};

export default function MyMeals() {
  return (
    <MainLayout>
      <MyMealsPage />
    </MainLayout>
  );
}