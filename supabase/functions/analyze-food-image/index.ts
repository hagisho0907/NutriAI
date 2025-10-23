import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  confidence: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageUrl, description, userId } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call Replicate API
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${Deno.env.get('REPLICATE_API_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'andreasjansson/blip-2:4b32258c42e9efd4288bb9910bc532a69727f9acd26aa08e175713a0a857a608',
        input: {
          image: imageUrl,
          question: 'What foods are in this image? List each food item with estimated portions.',
        },
      }),
    });

    if (!replicateResponse.ok) {
      throw new Error('Failed to call Replicate API');
    }

    const prediction = await replicateResponse.json();
    
    // Poll for results
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(result.urls.get, {
        headers: {
          'Authorization': `Token ${Deno.env.get('REPLICATE_API_TOKEN')}`,
        },
      });
      
      result = await statusResponse.json();
    }

    if (result.status === 'failed') {
      throw new Error('Image analysis failed');
    }

    // Parse the output and structure the response
    const foodItems = parseFoodItems(result.output, description);
    const nutritionData = await fetchNutritionData(foodItems);

    // Calculate totals
    const totals = nutritionData.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        fat: acc.fat + item.fat,
        carbs: acc.carbs + item.carbs,
      }),
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );

    const analysisResult = {
      items: nutritionData,
      totalCalories: Math.round(totals.calories),
      totalProtein: Math.round(totals.protein * 10) / 10,
      totalFat: Math.round(totals.fat * 10) / 10,
      totalCarbs: Math.round(totals.carbs * 10) / 10,
      overallConfidence: 0.85,
      analysisId: `replicate-${Date.now()}`,
      processedAt: new Date().toISOString(),
    };

    // Store result in database
    const { error: dbError } = await supabaseClient
      .from('ai_inferences')
      .insert({
        user_id: userId,
        type: 'meal_image',
        input_data: { imageUrl, description },
        output_data: analysisResult,
        model_used: 'blip-2',
        confidence_score: analysisResult.overallConfidence,
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    return new Response(
      JSON.stringify(analysisResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function parseFoodItems(aiOutput: string, userDescription?: string): string[] {
  // Parse AI output to extract food items
  // This is a simplified version - in production, use more sophisticated parsing
  const items = aiOutput.split(',').map(item => item.trim());
  
  // Enhance with user description if provided
  if (userDescription) {
    // Extract additional items from description
    const descriptionItems = userDescription
      .split(/[、,\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    return [...new Set([...items, ...descriptionItems])];
  }
  
  return items;
}

async function fetchNutritionData(foodNames: string[]): Promise<FoodItem[]> {
  // In production, query a nutrition database or API
  // For now, return mock data based on common Japanese foods
  
  const nutritionDatabase: Record<string, Partial<FoodItem>> = {
    'rice': { name: 'ご飯', quantity: 150, unit: 'g', calories: 252, protein: 3.8, fat: 0.5, carbs: 55.7 },
    'chicken': { name: '鶏肉', quantity: 100, unit: 'g', calories: 165, protein: 31, fat: 3.6, carbs: 0 },
    'miso soup': { name: '味噌汁', quantity: 200, unit: 'ml', calories: 60, protein: 4, fat: 2, carbs: 8 },
    'salad': { name: 'サラダ', quantity: 100, unit: 'g', calories: 20, protein: 1, fat: 0.2, carbs: 4 },
    'egg': { name: '卵', quantity: 50, unit: 'g', calories: 75, protein: 6, fat: 5, carbs: 0.5 },
  };

  return foodNames.map(name => {
    const lowerName = name.toLowerCase();
    const nutrition = Object.entries(nutritionDatabase).find(([key]) => 
      lowerName.includes(key)
    )?.[1] || {
      name: name,
      quantity: 100,
      unit: 'g',
      calories: 100,
      protein: 5,
      fat: 3,
      carbs: 15,
    };

    return {
      ...nutrition,
      confidence: 0.8 + Math.random() * 0.15,
    } as FoodItem;
  });
}