export const env = {
  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // AI APIs
  ai: {
    replicateToken: process.env.REPLICATE_API_TOKEN || '',
    openaiKey: process.env.OPENAI_API_KEY || '',
    anthropicKey: process.env.ANTHROPIC_API_KEY || '',
  },

  // Image Processing
  image: {
    maxSizeMB: parseInt(process.env.MAX_IMAGE_SIZE_MB || '10'),
    maxWidth: parseInt(process.env.MAX_IMAGE_WIDTH || '1200'),
    maxHeight: parseInt(process.env.MAX_IMAGE_HEIGHT || '1200'),
    quality: parseFloat(process.env.IMAGE_QUALITY || '0.85'),
  },

  // Feature Flags
  features: {
    realAiAnalysis: process.env.ENABLE_REAL_AI_ANALYSIS === 'true',
    supabaseStorage: process.env.ENABLE_SUPABASE_STORAGE === 'true',
    imageUpload: process.env.ENABLE_IMAGE_UPLOAD === 'true',
  },

  // Rate Limiting
  rateLimit: {
    visionApiPerHour: parseInt(process.env.VISION_API_RATE_LIMIT_PER_HOUR || '100'),
    visionApiPerDay: parseInt(process.env.VISION_API_RATE_LIMIT_PER_DAY || '1000'),
  },

  // General
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
};

// Validation
export function validateEnv() {
  const missing: string[] = [];

  if (env.features.realAiAnalysis && !env.ai.replicateToken) {
    missing.push('REPLICATE_API_TOKEN');
  }

  if (env.features.supabaseStorage) {
    if (!env.supabase.url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!env.supabase.anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    if (!env.supabase.serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Usage helper
export function isFeatureEnabled(feature: keyof typeof env.features): boolean {
  return env.features[feature];
}