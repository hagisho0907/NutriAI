import { BarcodeSearchPage } from '@/components/features/barcode/BarcodeSearchPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'バーコード検索 - NutriAI',
  description: 'バーコードをスキャンして食品を素早く追加しましょう',
};

export default function BarcodeSearch() {
  return (
    <MainLayout>
      <BarcodeSearchPage />
    </MainLayout>
  );
}