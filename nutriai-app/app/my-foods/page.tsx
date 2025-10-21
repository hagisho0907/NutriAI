import { MyFoodsPage } from '@/components/features/custom-foods/MyFoodsPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'マイフード - NutriAI',
  description: 'あなたが作成したカスタム食品を管理しましょう',
};

export default function MyFoods() {
  return (
    <MainLayout>
      <MyFoodsPage />
    </MainLayout>
  );
}