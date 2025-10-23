import { http, HttpResponse, delay } from 'msw';

// Vision API handlers
export const visionHandlers = [
  http.post('/api/vision/analyze', async ({ request }) => {
    await delay(1500);
    
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const description = formData.get('description') as string;
    
    // Mock food items based on description or random
    const mockFoods = [
      { name: 'ご飯', quantity: 150, unit: 'g', multiplier: 1.68 },
      { name: '鶏胸肉', quantity: 100, unit: 'g', multiplier: 1.65 },
      { name: 'サラダ', quantity: 80, unit: 'g', multiplier: 0.2 },
      { name: '味噌汁', quantity: 200, unit: 'ml', multiplier: 0.3 },
      { name: '卵焼き', quantity: 60, unit: 'g', multiplier: 1.5 },
      { name: '焼き魚', quantity: 80, unit: 'g', multiplier: 1.8 },
      { name: '納豆', quantity: 50, unit: 'g', multiplier: 2.0 }
    ];
    
    // Select items based on description keywords or random
    let selectedItems = mockFoods;
    if (description) {
      const descLower = description.toLowerCase();
      selectedItems = mockFoods.filter(food => 
        descLower.includes(food.name) || 
        descLower.includes(food.name.replace('', ''))
      );
      
      if (selectedItems.length === 0) {
        // If no match, select random items
        const numItems = Math.floor(Math.random() * 3) + 1;
        selectedItems = mockFoods
          .sort(() => Math.random() - 0.5)
          .slice(0, numItems);
      }
    } else {
      const numItems = Math.floor(Math.random() * 3) + 1;
      selectedItems = selectedItems
        .sort(() => Math.random() - 0.5)
        .slice(0, numItems);
    }
    
    const items = selectedItems.map(food => {
      const baseCalories = food.quantity * food.multiplier;
      const protein = baseCalories * 0.15 / 4; // 15% from protein
      const fat = baseCalories * 0.25 / 9; // 25% from fat
      const carbs = baseCalories * 0.6 / 4; // 60% from carbs
      
      return {
        name: food.name,
        quantity: food.quantity,
        unit: food.unit,
        calories: Math.round(baseCalories),
        protein: Math.round(protein * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        confidence: Math.round((0.7 + Math.random() * 0.25) * 100) / 100
      };
    });
    
    const totals = items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        fat: acc.fat + item.fat,
        carbs: acc.carbs + item.carbs
      }),
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
    
    const overallConfidence = 
      items.reduce((sum, item) => sum + item.confidence, 0) / items.length;
    
    return HttpResponse.json({
      items,
      totalCalories: Math.round(totals.calories),
      totalProtein: Math.round(totals.protein * 10) / 10,
      totalFat: Math.round(totals.fat * 10) / 10,
      totalCarbs: Math.round(totals.carbs * 10) / 10,
      overallConfidence: Math.round(overallConfidence * 100) / 100,
      analysisId: `vision-${Date.now()}`,
      processedAt: new Date().toISOString()
    });
  })
];

// Existing API handlers (placeholder for other endpoints)
export const apiHandlers = [
  // User endpoints
  http.get('/api/users/me', async () => {
    await delay(300);
    return HttpResponse.json({
      id: '1',
      name: 'テストユーザー',
      email: 'test@example.com',
      profile: {
        age: 30,
        gender: 'male',
        height: 170,
        weight: 65,
        activityLevel: 'moderate',
        targetCalories: 2200,
        targetProtein: 80,
        targetFat: 60,
        targetCarbs: 300
      }
    });
  }),
  
  // Meal endpoints
  http.post('/api/meals', async ({ request }) => {
    await delay(500);
    const meal = await request.json();
    return HttpResponse.json({
      id: `meal-${Date.now()}`,
      ...meal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }),
  
  http.get('/api/meals', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    
    return HttpResponse.json({
      meals: [],
      summary: {
        date,
        totalCalories: 0,
        totalProtein: 0,
        totalFat: 0,
        totalCarbs: 0
      }
    });
  })
];

// Combine all handlers
export const handlers = [
  ...visionHandlers,
  ...apiHandlers
];