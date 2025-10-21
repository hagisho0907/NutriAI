'use client';

import { MealCreateEditPage } from '@/components/features/custom-meals/MealCreateEditPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';
import { CustomMeal } from '@/lib/mockData';

export default function CreateMeal() {
  const router = useRouter();

  const handleSave = (meal: CustomMeal) => {
    // Handle saving the meal
    console.log('Saving meal:', meal);
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <MainLayout>
      <MealCreateEditPage 
        meal={null}
        onSave={handleSave}
        onBack={handleBack}
      />
    </MainLayout>
  );
}