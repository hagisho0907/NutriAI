import { ExerciseLogPage } from '@/components/features/exercises/ExerciseLogPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '運動記録 - NutriAI',
  description: '運動を記録して、カロリー消費を管理しましょう',
};

export default function Exercises() {
  return (
    <MainLayout>
      <ExerciseLogPage />
    </MainLayout>
  );
}