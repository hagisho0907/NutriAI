// Mock data service for NutriAI
import type {
  UserProfile,
  UserGoal,
  User,
  BodyMetrics,
  DailyTask,
  Meal,
  MealItem,
  MealTemplate,
  ExerciseLog,
  ExerciseTemplate,
  ChatMessage,
  ChatRole,
  Food,
  CustomFood,
  DailyNutrition,
  PFCBalance,
} from '../types';

// Re-export types that are commonly used
export type { Food, CustomFood, ChatMessage, ChatRole };

// Extend types for mock data convenience
interface SimplifiedUserProfile extends Omit<UserProfile, 'userId'> {
  id: string;
  email: string;
}

interface SimplifiedMeal {
  id: string;
  date: string;
  mealType: Meal['mealType'];
  notes?: string;
  items: SimplifiedMealItem[];
}

interface SimplifiedMealItem {
  id: string;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  proteinG: number;
  fatG: number;
  carbG: number;
}

interface SimplifiedExercise extends Omit<ExerciseLog, 'userId' | 'templateId' | 'performedAt' | 'createdAt' | 'templateName'> {
  date: string;
  name: string;
}

interface SimplifiedBodyMetric {
  date: string;
  weightKg: number;
  bodyFatPct?: number;
}

interface SimplifiedDailySummary {
  date: string;
  calorieIntake: number;
  calorieBurned: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  targetCalories: number;
  targetProteinG: number;
  targetFatG: number;
  targetCarbG: number;
  tasks: DailyTask[];
}

// Legacy CustomMeal interface for backward compatibility
export interface CustomMeal {
  id: string;
  name: string;
  photoUrl?: string;
  foods: Array<{
    foodId: string;
    foodName: string;
    quantity: number;
    unit: string;
    calories: number;
    proteinG: number;
    fatG: number;
    carbG: number;
  }>;
  totalCalories: number;
  totalProteinG: number;
  totalFatG: number;
  totalCarbG: number;
  instructions?: string;
  isPublic?: boolean;
  createdAt: string;
  totalNutrients?: {
    calories: number;
    proteinG: number;
    fatG: number;
    carbG: number;
  };
  description?: string;
  tags?: string[];
}

type LegacyCustomMeal = CustomMeal;

// Mock data
export const mockUser: SimplifiedUserProfile = {
  id: '9d9a9f4d-31a9-4ce3-a0b0-0e2fddcf4f09',
  email: 'guest@nutriai.dev',
  displayName: 'ゲストユーザー',
  gender: 'female',
  birthDate: '1998-06-18',
  heightCm: 162,
  activityLevel: 'light',
  bodyFatPct: 28.5,
};

export const mockGoal: UserGoal = {
  id: 'd61fe1df-20ab-42d1-86f8-35347e5a9954',
  userId: mockUser.id,
  goalType: 'loss',
  targetWeightKg: 55.0,
  targetBodyFatPct: 24.0,
  targetCalorieIntake: 1800,
  targetDurationWeeks: 12,
  status: 'active',
  startDate: '2025-10-01',
  createdAt: '2025-10-01T00:00:00Z',
};

export const mockDailySummary: SimplifiedDailySummary = {
  date: new Date().toISOString().split('T')[0],
  calorieIntake: 0,
  calorieBurned: 54,
  proteinG: 0,
  fatG: 0,
  carbG: 0,
  targetCalories: 1820,
  targetProteinG: 165,
  targetFatG: 40,
  targetCarbG: 200,
  tasks: [
    { id: '1', type: 'log_meal', status: 'pending', title: '朝食を記録する' },
    { id: '2', type: 'log_meal', status: 'pending', title: '昼食を記録する' },
    { id: '3', type: 'log_meal', status: 'pending', title: '夕食を記録する' },
    { id: '4', type: 'log_exercise', status: 'completed', title: '運動を記録する' },
    { id: '5', type: 'log_weight', status: 'pending', title: '体重を記録する' },
  ],
};

export const mockBodyMetrics: SimplifiedBodyMetric[] = [
  { date: '2025-10-10', weightKg: 58.2, bodyFatPct: 28.5 },
  { date: '2025-10-11', weightKg: 58.0, bodyFatPct: 28.4 },
  { date: '2025-10-12', weightKg: 57.8, bodyFatPct: 28.3 },
  { date: '2025-10-13', weightKg: 57.9, bodyFatPct: 28.4 },
  { date: '2025-10-14', weightKg: 57.7, bodyFatPct: 28.2 },
  { date: '2025-10-15', weightKg: 57.5, bodyFatPct: 28.1 },
  { date: '2025-10-16', weightKg: 57.6, bodyFatPct: 28.2 },
  { date: '2025-10-17', weightKg: 57.4, bodyFatPct: 28.0 },
];

export const mockMeals: SimplifiedMeal[] = [
  {
    id: '1',
    date: '2025-10-17',
    mealType: 'breakfast',
    items: [
      {
        id: '1-1',
        foodName: 'オートミール',
        quantity: 50,
        unit: 'g',
        calories: 190,
        proteinG: 7,
        fatG: 3,
        carbG: 32,
      },
      {
        id: '1-2',
        foodName: 'ギリシャヨーグルト',
        quantity: 150,
        unit: 'g',
        calories: 230,
        proteinG: 21,
        fatG: 7,
        carbG: 20,
      },
    ],
    notes: '朝食',
  },
  {
    id: '2',
    date: '2025-10-17',
    mealType: 'lunch',
    items: [
      {
        id: '2-1',
        foodName: 'サーモンサラダ',
        quantity: 1,
        unit: '人前',
        calories: 520,
        proteinG: 35,
        fatG: 22,
        carbG: 40,
      },
    ],
    notes: '昼食',
  },
  {
    id: '3',
    date: '2025-10-17',
    mealType: 'snack',
    items: [
      {
        id: '3-1',
        foodName: 'プロテインバー',
        quantity: 1,
        unit: '本',
        calories: 180,
        proteinG: 15,
        fatG: 6,
        carbG: 18,
      },
    ],
    notes: '間食',
  },
];

export const mockExercises: SimplifiedExercise[] = [
  {
    id: '1',
    date: '2025-10-17',
    name: 'ランニング',
    durationMin: 30,
    caloriesBurned: 280,
    intensityLevel: 'medium',
    notes: '朝のジョギング',
  },
  {
    id: '2',
    date: '2025-10-17',
    name: 'スクワット',
    durationMin: 20,
    caloriesBurned: 150,
    intensityLevel: 'high',
    notes: '自宅トレーニング',
  },
];

export const mockExerciseTemplates: ExerciseTemplate[] = [
  {
    id: '1',
    name: 'ランニング',
    category: 'cardio',
    metValue: 7.0,
    defaultDurationMin: 30,
    defaultCalories: 250,
    createdAt: '2025-10-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'ウォーキング',
    category: 'cardio',
    metValue: 3.5,
    defaultDurationMin: 30,
    defaultCalories: 120,
    createdAt: '2025-10-14T00:00:00Z',
  },
  {
    id: '3',
    name: 'サイクリング',
    category: 'cardio',
    metValue: 6.0,
    defaultDurationMin: 30,
    defaultCalories: 200,
    createdAt: '2025-10-13T00:00:00Z',
  },
  {
    id: '4',
    name: 'スイミング',
    category: 'cardio',
    metValue: 8.0,
    defaultDurationMin: 30,
    defaultCalories: 280,
    createdAt: '2025-10-12T00:00:00Z',
  },
  {
    id: '5',
    name: 'ウェイトトレーニング（高強度）',
    category: 'strength',
    metValue: 6.0,
    defaultDurationMin: 30,
    defaultCalories: 180,
    createdAt: '2025-10-11T00:00:00Z',
  },
  {
    id: '6',
    name: 'ウェイトトレーニング（低強度）',
    category: 'strength',
    metValue: 3.5,
    defaultDurationMin: 30,
    defaultCalories: 105,
    createdAt: '2025-10-10T00:00:00Z',
  },
  {
    id: '7',
    name: 'ヨガ/ピラティス',
    category: 'mobility',
    metValue: 2.5,
    defaultDurationMin: 30,
    defaultCalories: 90,
    createdAt: '2025-10-09T00:00:00Z',
  },
  {
    id: '8',
    name: 'その他',
    category: 'other',
    metValue: 0,
    defaultDurationMin: 30,
    defaultCalories: 0,
    createdAt: '2025-10-08T00:00:00Z',
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    sessionId: 'default-session',
    role: 'assistant',
    content: 'こんにちは！栄養、トレーニング、モチベーションについて何でも相談してください。',
    createdAt: '2025-10-17T08:00:00Z',
  },
];

export const mockFoods: Food[] = [
  {
    id: '1',
    name: 'プロテインバー チョコレート味',
    janCode: '4901234567890',
    brand: 'マイプロテイン',
    servingSize: 60,
    servingUnit: 'g',
    calories: 200,
    proteinG: 20,
    fatG: 8,
    carbG: 15,
    sugarG: 2,
    fiberG: 3,
    category: 'プロテイン製品',
    isVerified: true,
  },
  {
    id: '2',
    name: 'ギリシャヨーグルト プレーン',
    janCode: '4901234567891',
    brand: 'オイコス',
    servingSize: 110,
    servingUnit: 'g',
    calories: 92,
    proteinG: 10,
    fatG: 0,
    carbG: 12.5,
    sugarG: 5,
    category: '乳製品',
    isVerified: true,
  },
  {
    id: '3',
    name: 'サラダチキン プレーン',
    janCode: '4901234567892',
    brand: 'セブンプレミアム',
    servingSize: 115,
    servingUnit: 'g',
    calories: 121,
    proteinG: 27,
    fatG: 1.2,
    carbG: 0.3,
    category: '肉類',
    isVerified: true,
  },
  {
    id: '4',
    name: 'アーモンド 無塩',
    brand: '素焼きナッツ',
    servingSize: 30,
    servingUnit: 'g',
    calories: 178,
    proteinG: 6.5,
    fatG: 15.5,
    carbG: 6.2,
    fiberG: 3.5,
    category: 'ナッツ類',
    isVerified: true,
  },
  {
    id: '5',
    name: 'オートミール',
    brand: 'クエーカー',
    servingSize: 40,
    servingUnit: 'g',
    calories: 152,
    proteinG: 5.4,
    fatG: 2.8,
    carbG: 26.4,
    fiberG: 3.8,
    category: '穀物',
    isVerified: true,
  },
  {
    id: '6',
    name: 'ゆで卵',
    servingSize: 50,
    servingUnit: 'g',
    calories: 76,
    proteinG: 6.2,
    fatG: 5.2,
    carbG: 0.2,
    category: '卵類',
    isVerified: true,
  },
  {
    id: '7',
    name: 'アボカド',
    servingSize: 100,
    servingUnit: 'g',
    calories: 187,
    proteinG: 2.5,
    fatG: 18.7,
    carbG: 6.2,
    fiberG: 5.3,
    category: '果物',
    isVerified: true,
  },
  {
    id: '8',
    name: 'サーモン 切り身',
    servingSize: 100,
    servingUnit: 'g',
    calories: 139,
    proteinG: 20.1,
    fatG: 6.0,
    carbG: 0.1,
    category: '魚類',
    isVerified: true,
  },
  {
    id: '9',
    name: 'ブロッコリー',
    servingSize: 100,
    servingUnit: 'g',
    calories: 33,
    proteinG: 4.3,
    fatG: 0.5,
    carbG: 5.2,
    fiberG: 4.4,
    category: '野菜',
    isVerified: true,
  },
  {
    id: '10',
    name: '玄米ごはん',
    servingSize: 150,
    servingUnit: 'g',
    calories: 248,
    proteinG: 4.2,
    fatG: 1.5,
    carbG: 53.4,
    fiberG: 2.1,
    category: '穀物',
    isVerified: true,
  },
  {
    id: '11',
    name: 'バナナ',
    servingSize: 100,
    servingUnit: 'g',
    calories: 86,
    proteinG: 1.1,
    fatG: 0.2,
    carbG: 22.5,
    sugarG: 12.2,
    fiberG: 1.1,
    category: '果物',
    isVerified: true,
  },
  {
    id: '12',
    name: '納豆',
    servingSize: 50,
    servingUnit: 'g',
    calories: 100,
    proteinG: 8.3,
    fatG: 5.0,
    carbG: 6.1,
    fiberG: 3.4,
    category: '大豆製品',
    isVerified: true,
  },
  {
    id: '13',
    name: 'プロテインシェイク バニラ味',
    janCode: '4901234567893',
    brand: 'ザバス',
    servingSize: 21,
    servingUnit: 'g',
    calories: 83,
    proteinG: 15,
    fatG: 0.9,
    carbG: 2.9,
    category: 'プロテイン製品',
    isVerified: true,
  },
  {
    id: '14',
    name: '鶏むね肉',
    servingSize: 100,
    servingUnit: 'g',
    calories: 108,
    proteinG: 22.3,
    fatG: 1.5,
    carbG: 0,
    category: '肉類',
    isVerified: true,
  },
  {
    id: '15',
    name: 'カッテージチーズ',
    brand: '北海道乳業',
    servingSize: 100,
    servingUnit: 'g',
    calories: 105,
    proteinG: 13.3,
    fatG: 4.5,
    carbG: 1.9,
    category: '乳製品',
    isVerified: true,
  },
];

// Helper functions
export const calculatePFCPercentages = (summary: SimplifiedDailySummary): PFCBalance => {
  const totalCalories = summary.calorieIntake;
  if (totalCalories === 0) return { protein: 0, fat: 0, carb: 0 };
  
  return {
    protein: Math.round((summary.proteinG * 4 / totalCalories) * 100),
    fat: Math.round((summary.fatG * 9 / totalCalories) * 100),
    carb: Math.round((summary.carbG * 4 / totalCalories) * 100),
  };
};

export const getAIAdvice = (): string => {
  const advices = [
    '今日も順調です！夕食でタンパク質を少し増やすとバランスが良くなります。',
    '水分補給を忘れずに！1日2リットルを目標にしましょう。',
    '今週の運動頻度が素晴らしいです。継続が鍵です！',
    '目標まであと少し！週末のご褒美も計画に入れましょう。',
  ];
  return advices[Math.floor(Math.random() * advices.length)];
};

// Custom Foods and Meals Mock Data
export const mockCustomFoods: CustomFood[] = [
  {
    id: 'cf-1',
    name: 'プロテインパンケーキ',
    servingSize: 1,
    servingUnit: '枚',
    calories: 145,
    proteinG: 18,
    fatG: 3,
    carbG: 12,
    createdAt: '2025-10-15T10:00:00Z',
    createdBy: 'user-demo',
  },
  {
    id: 'cf-2',
    name: '自家製グラノーラ',
    servingSize: 50,
    servingUnit: 'g',
    calories: 220,
    proteinG: 6,
    fatG: 9,
    carbG: 28,
    createdAt: '2025-10-14T08:30:00Z',
    createdBy: 'user-demo',
  },
  {
    id: 'cf-3',
    name: '特製スムージー',
    servingSize: 1,
    servingUnit: '杯',
    calories: 180,
    proteinG: 8,
    fatG: 4,
    carbG: 28,
    createdAt: '2025-10-12T07:00:00Z',
    createdBy: 'user-demo',
  },
];

export const mockCustomMeals: LegacyCustomMeal[] = [
  {
    id: 'cm-1',
    name: '朝の定番セット',
    photoUrl: 'https://example.com/breakfast_set.jpg',
    foods: [
      {
        foodId: '5',
        foodName: 'オートミール',
        quantity: 50,
        unit: 'g',
        calories: 190,
        proteinG: 6.8,
        fatG: 3.5,
        carbG: 33,
      },
      {
        foodId: '11',
        foodName: 'バナナ',
        quantity: 100,
        unit: 'g',
        calories: 86,
        proteinG: 1.1,
        fatG: 0.2,
        carbG: 22.5,
      },
      {
        foodId: '2',
        foodName: 'ギリシャヨーグルト プレーン',
        quantity: 110,
        unit: 'g',
        calories: 92,
        proteinG: 10,
        fatG: 0,
        carbG: 12.5,
      },
    ],
    totalCalories: 368,
    totalProteinG: 17.9,
    totalFatG: 3.7,
    totalCarbG: 68,
    instructions: '朝食として摂取してください。',
    isPublic: true,
    createdAt: '2025-10-16T09:00:00Z',
  },
  {
    id: 'cm-2',
    name: 'ヘルシーランチボウル',
    photoUrl: 'https://example.com/healthy_lunch_bowl.jpg',
    foods: [
      {
        foodId: '10',
        foodName: '玄米ごはん',
        quantity: 150,
        unit: 'g',
        calories: 248,
        proteinG: 4.2,
        fatG: 1.5,
        carbG: 53.4,
      },
      {
        foodId: '14',
        foodName: '鶏むね肉',
        quantity: 120,
        unit: 'g',
        calories: 130,
        proteinG: 26.8,
        fatG: 1.8,
        carbG: 0,
      },
      {
        foodId: '9',
        foodName: 'ブロッコリー',
        quantity: 100,
        unit: 'g',
        calories: 33,
        proteinG: 4.3,
        fatG: 0.5,
        carbG: 5.2,
      },
      {
        foodId: '7',
        foodName: 'アボカド',
        quantity: 50,
        unit: 'g',
        calories: 94,
        proteinG: 1.3,
        fatG: 9.4,
        carbG: 3.1,
      },
    ],
    totalCalories: 505,
    totalProteinG: 36.6,
    totalFatG: 13.2,
    totalCarbG: 61.7,
    instructions: '昼食として摂取してください。',
    isPublic: true,
    createdAt: '2025-10-15T12:30:00Z',
  },
  {
    id: 'cm-3',
    name: 'プロテイン補給セット',
    photoUrl: 'https://example.com/protein_supplement_set.jpg',
    foods: [
      {
        foodId: '3',
        foodName: 'サラダチキン プレーン',
        quantity: 115,
        unit: 'g',
        calories: 121,
        proteinG: 27,
        fatG: 1.2,
        carbG: 0.3,
      },
      {
        foodId: '6',
        foodName: 'ゆで卵',
        quantity: 100,
        unit: 'g',
        calories: 152,
        proteinG: 12.4,
        fatG: 10.4,
        carbG: 0.4,
      },
      {
        foodId: '4',
        foodName: 'アーモンド 無塩',
        quantity: 30,
        unit: 'g',
        calories: 178,
        proteinG: 6.5,
        fatG: 15.5,
        carbG: 6.2,
      },
    ],
    totalCalories: 451,
    totalProteinG: 45.9,
    totalFatG: 27.1,
    totalCarbG: 6.9,
    instructions: '夕食として摂取してください。',
    isPublic: true,
    createdAt: '2025-10-13T14:00:00Z',
  },
];
