'use client';

import { AiPhotoEstimatePage } from '@/components/features/meals/AiPhotoEstimatePage';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';

export default function PhotoEstimate() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSave = (data: {
    foodName: string;
    quantity: number;
    unit: string;
    macros: { protein: number; fat: number; carb: number };
    photoUrl?: string;
    description?: string;
  }) => {
    console.log('Saving photo estimate:', data);
    // Handle saving the data
    router.back();
  };

  return (
    <MainLayout>
      <AiPhotoEstimatePage 
        onBack={handleBack}
        onSave={handleSave}
        mealType="breakfast"
      />
    </MainLayout>
  );
}