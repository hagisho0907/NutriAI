// Chat-related type definitions for NutriAI

export type ChatRole = 'user' | 'assistant' | 'system';
export type ChatTopic = 'nutrition' | 'training' | 'mood' | 'general';

// Chat session
export interface ChatSession {
  id: string;
  userId: string;
  topic?: ChatTopic;
  contextSnapshot?: any; // User context at session start (JSONB)
  createdAt: string;
  lastMessageAt?: string;
  messageCount: number;
  isActive: boolean;
}

// Chat message
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  context?: any;
  contextTags?: string[]; // e.g., ["plateau", "protein"]
  latencyMs?: number; // Response time for assistant messages
  createdAt: string;
}

// Create chat message request
export interface CreateChatMessageRequest {
  sessionId?: string; // If not provided, create new session
  message: string;
  topic?: ChatTopic;
}

// Chat response
export interface ChatResponse {
  sessionId: string;
  messageId: string;
  reply: string;
  suggestedActions?: SuggestedAction[];
  confidence?: number;
  contextTags?: string[];
}

// AI chat suggestion for follow-up prompts
export interface ChatSuggestion {
  id: string;
  text: string;
  category: string;
  confidence?: number;
}

export interface ChatSummary {
  totalMessages: number;
  totalUserMessages: number;
  totalAiMessages: number;
  firstMessageDate: string;
  lastMessageDate: string;
  topTopics: Array<{
    topic: string;
    count: number;
  }>;
  averageResponseTime: number;
}

export interface ChatInsights {
  personalizedRecommendations: string[];
  healthTrends: Array<{
    category: string;
    trend: 'improving' | 'declining' | 'stable';
    description: string;
  }>;
  suggestedActions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
  }>;
  motivationalMessage: string;
}

export interface ConversationStarters {
  nutrition: string[];
  exercise: string[];
  motivation: string[];
  general: string[];
}

export interface ChatSearchResult {
  results: Array<{
    message: ChatMessage;
    relevanceScore: number;
    matchedText: string;
  }>;
  totalResults: number;
  searchQuery: string;
}

export interface ChatTemplate {
  id: string;
  category: string;
  title: string;
  content: string;
  usage_count: number;
}

export interface ConversationContext {
  recentTopics: string[];
  userGoals: string[];
  currentChallenges: string[];
  preferredCommunicationStyle: string;
  relevantData: {
    nutrition?: any;
    exercise?: any;
    bodyMetrics?: any;
  };
}

// Suggested action from AI
export interface SuggestedAction {
  type: 'habit' | 'meal' | 'exercise' | 'goal' | 'tracking';
  title: string;
  description: string;
  actionData?: any; // Specific data for the action
  priority?: 'high' | 'medium' | 'low';
}

// Chat summary for listing
export interface ChatSessionSummary {
  id: string;
  topic?: ChatTopic;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
}

// AI inference record (for audit/improvement)
export interface AIInference {
  id: string;
  sourceType: 'meal' | 'chat' | 'review' | 'goal';
  sourceId?: string;
  modelName?: string;
  inputSummary?: string;
  outputJson: any;
  confidence?: number;
  createdAt: string;
}

// Chat context for AI
export interface ChatContext {
  userProfile: {
    age?: number;
    gender?: string;
    activityLevel?: string;
    currentWeight?: number;
    targetWeight?: number;
  };
  recentMetrics?: {
    avgCaloriesIntake?: number;
    avgProteinG?: number;
    avgExerciseMin?: number;
    weightTrend?: string;
  };
  currentGoals?: {
    goalType?: string;
    targetCalories?: number;
    progressPercent?: number;
  };
}
