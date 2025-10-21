import { LoginPage } from '@/components/features/auth/LoginPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ログイン - NutriAI',
  description: 'NutriAIにログインして、健康管理を始めましょう',
};

export default function Login() {
  return <LoginPage />;
}