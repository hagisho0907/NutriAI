import { GoalWizard } from '@/components/features/onboarding/GoalWizard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '初期設定 - NutriAI',
  description: 'あなたの健康目標を設定して、パーソナライズされた体験を始めましょう',
};

export default function Onboarding() {
  return <GoalWizard />;
}