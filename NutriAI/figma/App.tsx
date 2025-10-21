import { useState } from 'react';
import { LoginPage } from './components/features/auth/LoginPage';
import { GoalWizard } from './components/features/onboarding/GoalWizard';
import { DashboardPage } from './components/features/dashboard/DashboardPage';
import { MealLogPage } from './components/features/meals/MealLogPage';
import { BarcodeSearchPage } from './components/features/barcode/BarcodeSearchPage';
import { ExerciseLogPage } from './components/features/exercises/ExerciseLogPage';
import { AnalyticsPage } from './components/features/analytics/AnalyticsPage';
import { ChatPage } from './components/features/chat/ChatPage';
import { BottomNav } from './components/layout/BottomNav';
import { Toaster } from './components/ui/sonner';
import { type Food } from './lib/mockData';

type AppState = 'login' | 'onboarding' | 'app';
type Page = 'dashboard' | 'meals' | 'barcode' | 'exercises' | 'analytics' | 'chat';

export default function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const handleLogin = () => {
    setAppState('onboarding');
  };

  const handleOnboardingComplete = () => {
    setAppState('app');
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setCurrentPage('meals');
  };

  const handleCloseBarcodeSearch = () => {
    setCurrentPage('meals');
  };

  const handleClearSelectedFood = () => {
    setSelectedFood(null);
  };

  // Login screen
  if (appState === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Onboarding wizard
  if (appState === 'onboarding') {
    return <GoalWizard onComplete={handleOnboardingComplete} />;
  }

  // Main app
  return (
    <>
      <div className="h-screen flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
          {currentPage === 'meals' && (
            <MealLogPage 
              selectedFood={selectedFood} 
              onNavigateToBarcode={() => setCurrentPage('barcode')}
              onClearSelectedFood={handleClearSelectedFood}
            />
          )}
          {currentPage === 'barcode' && (
            <BarcodeSearchPage 
              onClose={handleCloseBarcodeSearch} 
              onSelectFood={handleSelectFood} 
            />
          )}
          {currentPage === 'exercises' && <ExerciseLogPage />}
          {currentPage === 'analytics' && <AnalyticsPage />}
          {currentPage === 'chat' && <ChatPage />}
        </div>
        
        <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
      </div>
      <Toaster />
    </>
  );
}