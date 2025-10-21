import { ChatPage } from '@/components/features/chat/ChatPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'チャット - NutriAI',
  description: 'AIアシスタントに栄養や運動について相談しましょう',
};

export default function Chat() {
  return (
    <MainLayout>
      <ChatPage />
    </MainLayout>
  );
}