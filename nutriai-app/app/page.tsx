import { LoginPage } from '@/components/features/auth/LoginPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NutriAI - とにかく楽にダイエットをサポート',
  description: 'AI搭載の栄養・運動管理アプリ。写真を撮るだけで栄養素を自動計算し、あなたに最適な目標を提案します。',
};

export default function Home() {
  return <LoginPage />;
}
