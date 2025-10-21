'use client';

import { FoodSelectionPage } from '@/components/features/meals/FoodSelectionPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';

export default function FoodSelection() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleNavigateToAiPhoto = () => {
    router.push('/meals/photo');
  };

  return (
    <MainLayout>
      <FoodSelectionPage 
        onBack={handleBack}
        onNavigateToAiPhoto={handleNavigateToAiPhoto}
        mealType="breakfast"
      />
    </MainLayout>
  );
}